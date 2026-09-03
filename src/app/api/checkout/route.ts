import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mpPreference } from "@/lib/mercadopago";
import { siteConfig } from "@/config/site";
import { sendOutbidEmail, sendWelcomeEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRequiredHttpsOrigin, isProductionLike } from "@/lib/env";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    const rateLimit = checkRateLimit(ip, 15, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Inténtalo nuevamente en unos segundos." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rateLimit.retryAfterMs ?? 0) / 1000)) } },
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      ctaText,
      targetUrl,
      platform,
      email,
      amount,
      cardId,        // Opcional: si ya existe la tarjeta y están re-pujando
      token,         // Opcional: token de edición para validar propiedad si ya existe
      paymentMethod, // 'transfer' | 'demo' | 'mercadopago' (por defecto 'transfer')
    } = body;

    const method = paymentMethod || "transfer";
    const allowedMethods = new Set(["transfer", "mercadopago", "demo"]);

    // 1. Validaciones básicas de campos
    if (!title || title.length > 38) {
      return NextResponse.json({ error: "Título inválido (máx 38 caracteres)" }, { status: 400 });
    }
    if (!description || description.length > 110) {
      return NextResponse.json({ error: "Descripción inválida (máx 110 caracteres)" }, { status: 400 });
    }
    if (!ctaText || ctaText.length > 20) {
      return NextResponse.json({ error: "Texto de CTA inválido (máx 20 caracteres)" }, { status: 400 });
    }
    if (!targetUrl) {
      return NextResponse.json({ error: "URL de destino inválida (debe empezar con http/https)" }, { status: 400 });
    }

    try {
      const parsedTargetUrl = new URL(targetUrl);
      if (!['http:', 'https:'].includes(parsedTargetUrl.protocol)) {
        throw new Error("Protocol not allowed");
      }
    } catch {
      return NextResponse.json({ error: "URL de destino inválida (debe empezar con http/https)" }, { status: 400 });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email de contacto inválido" }, { status: 400 });
    }

    if (!allowedMethods.has(method)) {
      return NextResponse.json({ error: "Método de pago inválido" }, { status: 400 });
    }

    if (method === "demo" && isProductionLike()) {
      return NextResponse.json({ error: "El modo demo está deshabilitado en producción." }, { status: 403 });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: "Monto de puja inválido" }, { status: 400 });
    }

    // 2. Validar que el monto supere el mínimo necesario para el Puesto #1
    const currentNumberOne = await prisma.card.findFirst({
      where: { position: 1 },
    });

    const minRequired = currentNumberOne 
      ? currentNumberOne.currentBid + siteConfig.minBidStep
      : siteConfig.baseMinBid;

    if (numericAmount < minRequired) {
      return NextResponse.json({
        error: `El monto mínimo de puja para tomar el Puesto #1 es de ${siteConfig.currencySymbol}${minRequired.toLocaleString('es-AR')}`,
      }, { status: 400 });
    }

    let card;

    if (cardId) {
      // 3a. Flujo de edición / re-puja de tarjeta existente
      card = await prisma.card.findUnique({
        where: { id: cardId },
      });

      if (!card) {
        return NextResponse.json({ error: "Tarjeta no encontrada" }, { status: 404 });
      }

      // Validar token de seguridad
      if (card.editToken !== token) {
        return NextResponse.json({ error: "No autorizado. Token de edición inválido." }, { status: 401 });
      }

      // Actualizar datos de la tarjeta
      card = await prisma.card.update({
        where: { id: cardId },
        data: {
          title,
          description,
          ctaText,
          targetUrl,
          platform,
          email,
        },
      });
    } else {
      // 3b. Flujo de creación de tarjeta nueva
      const editToken = crypto.randomUUID(); // Generar token seguro de edición
      card = await prisma.card.create({
        data: {
          title,
          description,
          ctaText,
          targetUrl,
          platform,
          email,
          editToken,
          currentBid: 0, // Inicia en 0 hasta que se confirme la transferencia o pago
          position: 999, // Posición temporal fuera de la grilla activa
        },
      });
    }

    // 4. Registrar el Bid en la base de datos
    await prisma.bid.create({
      data: {
        cardId: card.id,
        amount: numericAmount,
        status: method === "demo" ? "approved" : "pending",
      },
    });

    // 5. FLUJO SEGÚN MÉTODO DE PAGO

    // OPCIÓN A: MODO DEMO / SIMULACIÓN INSTANTÁNEA
    if (method === "demo") {
      await prisma.$transaction(async (tx) => {
        await tx.transaction.create({
          data: {
            paymentId: `DEMO-${Date.now()}-${card.id.slice(0, 4)}`,
            cardId: card.id,
            amount: numericAmount,
            status: "approved",
            rawWebhookData: JSON.stringify({ mode: "demo" }),
          },
        });

        // Actualizar el bid de la tarjeta
        await tx.card.update({
          where: { id: card.id },
          data: { currentBid: numericAmount },
        });

        // Reordenar todas las tarjetas activas
        const activeCards = await tx.card.findMany({
          where: { currentBid: { gt: 0 } },
          orderBy: [{ currentBid: "desc" }, { updatedAt: "asc" }],
        });

        let pos = 1;
        for (const c of activeCards) {
          await tx.card.update({
            where: { id: c.id },
            data: { position: pos },
          });
          pos++;
        }
      });

      // Enviar correos
      await sendWelcomeEmail(card.email, card.title, card.editToken, card.id);
      if (currentNumberOne && currentNumberOne.id !== card.id) {
        await sendOutbidEmail(
          currentNumberOne.email,
          currentNumberOne.title,
          numericAmount + siteConfig.minBidStep,
          currentNumberOne.editToken,
          currentNumberOne.id
        );
      }

      return NextResponse.json({
        success: true,
        method: "demo",
        cardId: card.id,
        token: card.editToken,
      });
    }

    // OPCIÓN B: TRANSFERENCIA BANCARIA DIRECTA (ALIAS / CBU)
    if (method === "transfer") {
      return NextResponse.json({
        success: true,
        method: "transfer",
        cardId: card.id,
        token: card.editToken,
        bankDetails: siteConfig.bankDetails,
        amount: numericAmount,
      });
    }

    // OPCIÓN C: MERCADO PAGO AUTOMÁTICO
    const domain = getRequiredHttpsOrigin();

    if (!mpPreference) {
      return NextResponse.json(
        { error: "MP_ACCESS_TOKEN no configurado. Revisa las variables del entorno antes de habilitar pagos reales." },
        { status: 500 },
      );
    }

    const result = await mpPreference.create({
      body: {
        items: [
          {
            id: card.id,
            title: `Anuncio ${siteConfig.name}: ${title}`,
            quantity: 1,
            unit_price: numericAmount,
            currency_id: siteConfig.currency,
          },
        ],
        back_urls: {
          success: `${domain}/crear/exito?cardId=${card.id}&token=${card.editToken}`,
          failure: `${domain}/crear?error=payment_failed&cardId=${card.id}&token=${card.editToken}`,
          pending: `${domain}/crear?error=payment_pending&cardId=${card.id}&token=${card.editToken}`,
        },
        auto_return: "approved",
        external_reference: card.id,
        metadata: {
          cardId: card.id,
          amount: numericAmount,
          email: email,
        },
        notification_url: process.env.MP_WEBHOOK_URL ?? `${domain}/api/webhook`,
      },
    });

    return NextResponse.json({
      success: true,
      method: "mercadopago",
      preferenceId: result.id,
      initPoint: result.init_point,
      cardId: card.id,
      token: card.editToken,
    });
  } catch (error: unknown) {
    console.error("Error en checkout api:", error);
    const message = error instanceof Error ? error.message : "Error al procesar el checkout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

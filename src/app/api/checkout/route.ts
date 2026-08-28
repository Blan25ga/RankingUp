import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mpPreference } from "@/lib/mercadopago";
import { siteConfig } from "@/config/site";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      ctaText,
      targetUrl,
      platform,
      email,
      amount,
      cardId, // Opcional: si ya existe la tarjeta y están re-pujando
      token,  // Opcional: token de edición para validar propiedad si ya existe
    } = body;

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
    if (!targetUrl || !targetUrl.startsWith("http")) {
      return NextResponse.json({ error: "URL de destino inválida (debe empezar con http/https)" }, { status: 400 });
    }
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email de contacto inválido" }, { status: 400 });
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

      // Actualizar datos de la tarjeta (pero el Bid sólo se consolida al pagar)
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
          currentBid: 0, // Inicia en 0 hasta que el webhook apruebe el pago
          position: 999, // Posición temporal fuera de la grilla activa
        },
      });
    }

    // 4. Crear un Bid pendiente en la base de datos
    await prisma.bid.create({
      data: {
        cardId: card.id,
        amount: numericAmount,
        status: "pending",
      },
    });

    // 5. Configurar preferencia de Mercado Pago
    const domain = process.env.NEXT_PUBLIC_SITE_URL || `http://localhost:3000`;
    
    // Crear preferencia en Mercado Pago
    const result = await mpPreference.create({
      body: {
        items: [
          {
            id: card.id,
            title: `Anuncio rankinguponline: ${title}`,
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
        // Notificaciones IPN / Webhook de Mercado Pago
        notification_url: process.env.MP_WEBHOOK_URL || `${domain}/api/webhook`,
      },
    });

    return NextResponse.json({
      preferenceId: result.id,
      initPoint: result.init_point, // Enlace de Mercado Pago para redirigir al checkout
      cardId: card.id,
      token: card.editToken,
    });
  } catch (error: unknown) {
    console.error("Error en checkout api:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error al procesar el checkout" }, { status: 500 });
  }
}

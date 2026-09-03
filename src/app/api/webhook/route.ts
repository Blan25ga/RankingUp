import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendOutbidEmail, sendWelcomeEmail } from "@/lib/email";
import { getRequiredServerEnv } from "@/lib/env";

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("x-signature") || req.headers.get("X-Signature");
    const webhookSecret = process.env.MP_WEBHOOK_SECRET?.trim();

    if (webhookSecret && !signature) {
      return NextResponse.json({ error: "Webhook no autenticado" }, { status: 401 });
    }

    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));

    // Mercado Pago puede enviar datos tanto por query params (IPN) como en el body (Webhooks)
    const paymentId = url.searchParams.get("data.id") || url.searchParams.get("id") || body?.data?.id || body?.id;
    const topic = url.searchParams.get("type") || url.searchParams.get("topic") || body?.type || body?.action;

    const accessToken = getRequiredServerEnv("MP_ACCESS_TOKEN");

    if (!paymentId || (topic !== "payment" && topic !== "payment.created")) {
      // Retornar 200 OK rápido si no es una notificación de pago relevante para no bloquear a Mercado Pago
      return NextResponse.json({ message: "Notificación ignorada (no es un pago)" }, { status: 200 });
    }

    console.log(`[Mercado Pago Webhook] Procesando pago ID: ${paymentId}`);

    // 1. CONSULTA DIRECTA Y SEGURA A LA API DE MERCADO PAGO
    // De esta manera prevenimos spoofing (datos falsificados enviados a nuestro webhook),
    // ya que sólo confiamos en lo que Mercado Pago nos devuelve directamente desde su servidor.
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!mpResponse.ok) {
      console.error(`[Webhook] Error al consultar pago ${paymentId} en Mercado Pago API`);
      return NextResponse.json({ error: "Error consultando pasarela de pagos" }, { status: 502 });
    }

    const paymentData = await mpResponse.json();

    // 2. VERIFICACIONES DE SEGURIDAD DEL PAGO
    if (paymentData.status !== "approved") {
      console.log(`[Webhook] El pago ${paymentId} no está aprobado (Estado: ${paymentData.status})`);
      return NextResponse.json({ message: "Pago no aprobado" }, { status: 200 });
    }

    const cardId = paymentData.external_reference;
    const paidAmount = Number(paymentData.transaction_amount);

    if (!cardId) {
      console.error(`[Webhook] Pago ${paymentId} no contiene la referencia (external_reference / cardId)`);
      return NextResponse.json({ error: "Referencia externa faltante" }, { status: 400 });
    }

    // 3. EVITAR REPLAY ATTACKS (PAGOS YA PROCESADOS)
    const existingTx = await prisma.transaction.findUnique({
      where: { paymentId: String(paymentId) },
    });

    if (existingTx) {
      console.log(`[Webhook] El pago ${paymentId} ya fue procesado anteriormente.`);
      return NextResponse.json({ message: "Pago ya procesado" }, { status: 200 });
    }

    // 4. TRANSACCIÓN DE BASE DE DATOS (LOCKING / EVITAR RACE CONDITIONS)
    const result = await prisma.$transaction(async (tx) => {
      // Verificar si la tarjeta existe
      const card = await tx.card.findUnique({
        where: { id: cardId },
      });

      if (!card) {
        throw new Error(`Tarjeta con ID ${cardId} no encontrada`);
      }

      // Registrar la transacción aprobada para evitar doble procesamiento
      await tx.transaction.create({
        data: {
          paymentId: String(paymentId),
          cardId: cardId,
          amount: paidAmount,
          status: "approved",
          rawWebhookData: JSON.stringify(paymentData),
        },
      });

      // Actualizar el estado de los Bids pendientes de esta tarjeta a 'approved' para este monto
      await tx.bid.updateMany({
        where: {
          cardId: cardId,
          amount: paidAmount,
          status: "pending",
        },
        data: {
          status: "approved",
        },
      });

      // Obtener el dueño actual del Puesto #1 antes de actualizar posiciones
      const currentNumberOne = await tx.card.findFirst({
        where: { position: 1 },
      });

      // Actualizar el bid actual de la tarjeta que pagó
      // Si ya era parte de la grilla, sumamos o pisamos por su puja aprobada
      const updatedCard = await tx.card.update({
        where: { id: cardId },
        data: {
          currentBid: paidAmount,
        },
      });

      // Recalcular posiciones para todas las tarjetas activas (bid > 0)
      // Ordenamos por puja descendente. Si hay empate, priorizamos la más antigua en ser actualizada.
      const activeCards = await tx.card.findMany({
        where: {
          currentBid: { gt: 0 },
        },
        orderBy: [
          { currentBid: "desc" },
          { updatedAt: "asc" },
        ],
      });

      // Usar posiciones temporales para evitar colisiones durante el reordenamiento.
      for (let index = 0; index < activeCards.length; index++) {
        await tx.card.update({
          where: { id: activeCards[index].id },
          data: { position: -(index + 1) },
        });
      }

      let positionIndex = 1;
      for (const activeCard of activeCards) {
        await tx.card.update({
          where: { id: activeCard.id },
          data: { position: positionIndex },
        });
        positionIndex++;
      }

      return {
        cardTitle: updatedCard.title,
        cardEmail: updatedCard.email,
        editToken: updatedCard.editToken,
        cardId: updatedCard.id,
        currentNumberOneBeforeUpdate: currentNumberOne,
      };
    });

    console.log(`[Webhook] Base de datos actualizada con éxito para el anuncio: "${result.cardTitle}"`);

    // 5. ENVIAR NOTIFICACIONES DE CORREO
    // Correo de bienvenida y confirmación de que su anuncio está activo
    await sendWelcomeEmail(result.cardEmail, result.cardTitle, result.editToken, result.cardId);

    // Si el puesto #1 cambió, notificar al anunciante desplazado (Reenganche)
    const previousOne = result.currentNumberOneBeforeUpdate;
    if (previousOne && previousOne.id !== result.cardId) {
      const nextSuggestedBid = paidAmount + 100; // Sugerir superar la nueva puja por el paso mínimo
      await sendOutbidEmail(
        previousOne.email,
        previousOne.title,
        nextSuggestedBid,
        previousOne.editToken,
        previousOne.id
      );
    }

    return NextResponse.json({ success: true, message: "Webhook procesado y grilla actualizada" }, { status: 200 });
  } catch (error: unknown) {
    console.error("[Webhook Error]:", error);
    // Retornamos 500 para que Mercado Pago reintente en caso de error transaccional de red
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}

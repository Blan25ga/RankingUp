import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { siteConfig } from "@/config/site";
import { sendOutbidEmail, sendWelcomeEmail } from "@/lib/email";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!siteConfig.adminSecretKey) {
      return NextResponse.json({ error: "ADMIN_SECRET_KEY no configurada" }, { status: 500 });
    }

    if (key !== siteConfig.adminSecretKey) {
      return NextResponse.json({ error: "Clave de administrador incorrecta" }, { status: 401 });
    }

    const cards = await prisma.card.findMany({
      include: {
        bids: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: [
        { currentBid: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ cards });
  } catch (error: unknown) {
    console.error("Error en admin cards GET:", error);
    return NextResponse.json({ error: "Error al obtener tarjetas" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { key, action, cardId, amount } = body;

    if (!siteConfig.adminSecretKey) {
      return NextResponse.json({ error: "ADMIN_SECRET_KEY no configurada" }, { status: 500 });
    }

    if (key !== siteConfig.adminSecretKey) {
      return NextResponse.json({ error: "Clave de administrador incorrecta" }, { status: 401 });
    }

    if (!cardId) {
      return NextResponse.json({ error: "cardId requerido" }, { status: 400 });
    }

    if (action === "approve") {
      const card = await prisma.card.findUnique({
        where: { id: cardId },
        include: { bids: { orderBy: { createdAt: "desc" }, take: 1 } },
      });

      if (!card) {
        return NextResponse.json({ error: "Tarjeta no encontrada" }, { status: 404 });
      }

      const approvedAmount = Number(amount) || card.bids[0]?.amount || card.currentBid || siteConfig.baseMinBid;

      // Ejecutar la actualización atómica y reordenamiento
      const result = await prisma.$transaction(async (tx) => {
        // Registrar transacción aprobada
        await tx.transaction.create({
          data: {
            paymentId: `TRANSF-${Date.now()}-${cardId.slice(0, 4)}`,
            cardId: card.id,
            amount: approvedAmount,
            status: "approved",
            rawWebhookData: JSON.stringify({ manualApproval: true, approvedBy: "admin" }),
          },
        });

        // Aprobar el último bid
        await tx.bid.updateMany({
          where: { cardId: card.id, status: "pending" },
          data: { status: "approved" },
        });

        // Guardar el número uno anterior
        const currentNumberOne = await tx.card.findFirst({
          where: { position: 1 },
        });

        // Actualizar el bid de la tarjeta
        const updatedCard = await tx.card.update({
          where: { id: card.id },
          data: { currentBid: approvedAmount },
        });

        // Reordenar todas las tarjetas activas
        const activeCards = await tx.card.findMany({
          where: { currentBid: { gt: 0 } },
          orderBy: [
            { currentBid: "desc" },
            { updatedAt: "asc" },
          ],
        });

        let pos = 1;
        for (const c of activeCards) {
          await tx.card.update({
            where: { id: c.id },
            data: { position: pos },
          });
          pos++;
        }

        return {
          cardTitle: updatedCard.title,
          cardEmail: updatedCard.email,
          editToken: updatedCard.editToken,
          cardId: updatedCard.id,
          previousNumberOne: currentNumberOne,
        };
      });

      // Enviar emails
      await sendWelcomeEmail(result.cardEmail, result.cardTitle, result.editToken, result.cardId);

      if (result.previousNumberOne && result.previousNumberOne.id !== result.cardId) {
        await sendOutbidEmail(
          result.previousNumberOne.email,
          result.previousNumberOne.title,
          approvedAmount + siteConfig.minBidStep,
          result.previousNumberOne.editToken,
          result.previousNumberOne.id
        );
      }

      return NextResponse.json({ success: true, message: `Anuncio "${result.cardTitle}" aprobado con éxito.` });
    }

    if (action === "delete") {
      await prisma.card.delete({
        where: { id: cardId },
      });

      // Recalcular posiciones restantes
      const activeCards = await prisma.card.findMany({
        where: { currentBid: { gt: 0 } },
        orderBy: [{ currentBid: "desc" }, { updatedAt: "asc" }],
      });

      let pos = 1;
      for (const c of activeCards) {
        await prisma.card.update({
          where: { id: c.id },
          data: { position: pos },
        });
        pos++;
      }

      return NextResponse.json({ success: true, message: "Anuncio eliminado correctamente." });
    }

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (error: unknown) {
    console.error("Error en admin cards POST:", error);
    const message = error instanceof Error ? error.message : "Error al procesar acción";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

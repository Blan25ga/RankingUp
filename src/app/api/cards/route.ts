import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { siteConfig } from "@/config/site";

export async function GET() {
  try {
    // Obtener tarjetas ordenadas por posición ascendente
    const cards = await prisma.card.findMany({
      where: {
        currentBid: { gt: 0 },
      },
      orderBy: {
        position: "asc",
      },
    });

    // Calcular el monto mínimo requerido para pujar por el Puesto #1
    const currentNumberOne = cards.find((c) => c.position === 1);
    const minBidForNumberOne = currentNumberOne
      ? currentNumberOne.currentBid + siteConfig.minBidStep
      : siteConfig.baseMinBid;

    return NextResponse.json({
      cards,
      minBidForNumberOne,
      baseMinBid: siteConfig.baseMinBid,
      minBidStep: siteConfig.minBidStep,
    });
  } catch (error: unknown) {
    console.error("Error al obtener tarjetas:", error);
    return NextResponse.json({ error: "Error al obtener las posiciones" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const { id } = await params;

    if (!token) {
      return NextResponse.json({ error: "Token de edición requerido" }, { status: 400 });
    }

    const card = await prisma.card.findUnique({
      where: { id },
    });

    if (!card) {
      return NextResponse.json({ error: "Anuncio no encontrado" }, { status: 404 });
    }

    // Verificar token de edición por seguridad
    if (card.editToken !== token) {
      return NextResponse.json({ error: "No autorizado. Token de edición inválido." }, { status: 401 });
    }

    // Retornamos los detalles de la tarjeta de forma segura
    return NextResponse.json({
      id: card.id,
      title: card.title,
      description: card.description,
      ctaText: card.ctaText,
      targetUrl: card.targetUrl,
      platform: card.platform,
      email: card.email,
      currentBid: card.currentBid,
      position: card.position,
    });
  } catch (error) {
    console.error("Error al obtener tarjeta individual:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

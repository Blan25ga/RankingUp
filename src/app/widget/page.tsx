import React from "react";
import { prisma } from "@/lib/db";
import { siteConfig } from "@/config/site";
import { Award, ExternalLink, Zap } from "lucide-react";

interface WidgetPageProps {
  searchParams: Promise<{
    cardId?: string;
  }>;
}

export default async function WidgetPage({ searchParams }: WidgetPageProps) {
  const resolvedParams = await searchParams;
  const cardId = resolvedParams.cardId;

  if (!cardId) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center p-4 text-center">
        <p className="text-xs text-gray-400">Widget inválido (cardId faltante)</p>
      </div>
    );
  }

  // Obtener detalles de la tarjeta directamente de la base de datos
  const card = await prisma.card.findUnique({
    where: { id: cardId },
  });

  if (!card || card.currentBid === 0) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center p-4 text-center">
        <p className="text-xs text-gray-400 dark:text-zinc-500">Anuncio no activo en {siteConfig.name}</p>
      </div>
    );
  }

  const isNumberOne = card.position === 1;

  return (
    <div className="h-screen w-full bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-4 flex flex-col justify-between overflow-hidden">
      <div>
        {/* Cabecera del Widget */}
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
              isNumberOne
                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300/30"
                : "bg-gray-150 text-gray-700 dark:bg-zinc-800 dark:text-zinc-350"
            }`}
          >
            {isNumberOne && <Award className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />}
            Puesto #{card.position} en {siteConfig.name}
          </span>
          <span className="text-[8px] font-black text-gray-300 dark:text-zinc-600 uppercase tracking-widest">
            Verificado
          </span>
        </div>

        {/* Título de la marca */}
        <h4 className="font-extrabold text-sm text-gray-900 dark:text-white line-clamp-1 leading-tight">
          {card.title}
        </h4>
        <p className="text-[10px] text-gray-500 dark:text-zinc-450 line-clamp-2 mt-1 leading-normal">
          {card.description}
        </p>
      </div>

      {/* Footer del Widget */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-zinc-850">
        <a
          href={card.targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-1.5 px-3 bg-gray-900 dark:bg-zinc-100 hover:bg-gray-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold text-[10px] rounded-lg text-center flex items-center justify-center gap-1 transition-all"
        >
          <span>{card.ctaText}</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
        <a
          href={`https://${siteConfig.domain}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-850 text-gray-500 dark:text-zinc-400 font-bold text-[9px] rounded-lg flex items-center justify-center gap-1 transition-all"
          title="Ver grilla completa"
        >
          <Zap className="w-2.5 h-2.5 text-amber-500 fill-current" />
          <span>Competir</span>
        </a>
      </div>
    </div>
  );
}

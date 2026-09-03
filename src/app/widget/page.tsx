import React from "react";
import { prisma } from "@/lib/db";
import { siteConfig } from "@/config/site";
import { Award, ExternalLink, Zap, Crown } from "lucide-react";

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
      <div className="h-screen bg-zinc-950 flex items-center justify-center p-4 text-center">
        <p className="text-xs text-zinc-500 font-bold">Widget inválido (cardId faltante)</p>
      </div>
    );
  }

  const card = await prisma.card.findUnique({
    where: { id: cardId },
  });

  if (!card || card.currentBid === 0) {
    return (
      <div className="h-screen bg-zinc-950 flex items-center justify-center p-4 text-center">
        <p className="text-xs text-zinc-500 font-bold">Anuncio no activo en {siteConfig.name}</p>
      </div>
    );
  }

  const isNumberOne = card.position === 1;

  return (
    <div className={`h-screen w-full bg-zinc-950 p-3 flex flex-col justify-between overflow-hidden ${
      isNumberOne ? "border-2 border-amber-500/60 rounded-2xl shadow-xl shadow-amber-500/10" : "border border-zinc-800 rounded-2xl"
    }`}>
      <div>
        {/* Cabecera del Widget */}
        <div className="flex items-center justify-between mb-1.5">
          <span
            className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
              isNumberOne
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "bg-zinc-800 text-zinc-300 border border-zinc-700"
            }`}
          >
            {isNumberOne ? <Crown className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> : <Award className="w-2.5 h-2.5 text-zinc-400" />}
            Puesto #{card.position}
          </span>
          <span className="text-[8px] font-black text-cyan-400 bg-cyan-950/50 border border-cyan-500/30 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
            👁️ {(card.views || 0).toLocaleString('es-AR')}
          </span>
        </div>

        {/* Título de la marca */}
        <h4 className="font-black text-sm text-white line-clamp-1 leading-tight mt-1">
          {card.title}
        </h4>
        <p className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5 leading-tight">
          {card.description}
        </p>
      </div>

      {/* Footer del Widget */}
      <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/80">
        <a
          href={card.targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex-1 py-1.5 px-3 rounded-lg text-center flex items-center justify-center gap-1 transition-all text-[10px] font-black ${
            isNumberOne
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 hover:brightness-110 shadow-sm"
              : "bg-zinc-100 hover:bg-white text-zinc-950"
          }`}
        >
          <span>{card.ctaText}</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
        <a
          href={`https://${siteConfig.domain}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-amber-400 font-bold text-[9px] rounded-lg flex items-center justify-center gap-1 transition-all"
          title="Ver grilla en vivo"
        >
          <Zap className="w-2.5 h-2.5 fill-current" />
          <span>Grilla</span>
        </a>
      </div>
    </div>
  );
}

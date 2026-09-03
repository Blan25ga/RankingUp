"use client";
import React, { useState } from "react";
import { X, Sparkles, ExternalLink } from "lucide-react";

export default function StickyFooterAd() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800 p-2.5 shadow-2xl flex flex-col items-center">
      <div className="relative w-full max-w-4xl flex items-center justify-between gap-4">
        
        {/* Botón de cerrar */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -top-7 right-2 md:-top-3 md:-right-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-full p-1 shadow-lg border border-zinc-700 transition-colors"
          aria-label="Cerrar anuncio"
          title="Cerrar publicidad"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Contenido del Anuncio */}
        <div className="w-full flex items-center justify-center min-h-[50px] md:min-h-[70px]">
          {process.env.NODE_ENV === "production" ? (
            <div className="w-full max-w-[728px] h-[90px] hidden md:block">
              <ins
                className="adsbygoogle"
                style={{ display: "inline-block", width: "728px", height: "90px" }}
                data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                data-ad-slot="9876543210"
              />
              <script
                dangerouslySetInnerHTML={{
                  __html: "(adsbygoogle = window.adsbygoogle || []).push({});",
                }}
              />
            </div>
          ) : (
            <div className="w-full max-w-[728px] bg-gradient-to-r from-zinc-900 via-zinc-850 to-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 tracking-wider flex items-center gap-1 shrink-0">
                  <Sparkles className="w-2.5 h-2.5" />
                  Sponsor
                </span>
                <div className="text-left">
                  <div className="text-xs font-bold text-white line-clamp-1">
                    Espacio Publicitario Google AdSense (Banner Fijo Inferior)
                  </div>
                  <div className="text-[10px] text-zinc-400 hidden sm:block">
                    Formato estándar 728x90 (Desktop) / 320x50 (Mobile) con alta tasa de conversión.
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <span>Google Ads</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

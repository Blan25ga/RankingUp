"use client";
import React, { useState } from "react";
import { X } from "lucide-react";

export default function StickyFooterAd() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-zinc-800 p-2 shadow-xl flex flex-col items-center">
      <div className="relative w-full max-w-4xl flex items-center justify-center">
        {/* Botón de cerrar */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -top-6 right-2 md:-top-3 md:-right-6 bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full p-1 shadow hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors"
          aria-label="Cerrar anuncio"
        >
          <X className="w-3 h-3" />
        </button>

        {/* Contenido del Anuncio */}
        <div className="w-full flex items-center justify-center min-h-[50px] md:min-h-[90px]">
          {process.env.NODE_ENV === "production" ? (
            <div className="w-full max-w-[728px] h-[90px] hidden md:block">
              {/* AdSense Desktop banner 728x90 */}
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
            <div className="w-full max-w-[728px] h-[50px] md:h-[90px] bg-gray-100 dark:bg-zinc-850 rounded border border-dashed border-gray-300 dark:border-zinc-700 flex items-center justify-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-gray-200 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 tracking-wider">
                Ad
              </span>
              <span className="text-xs text-gray-400 dark:text-zinc-500">
                Banner Sticky Footer (320x50 móvil / 728x90 escritorio)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

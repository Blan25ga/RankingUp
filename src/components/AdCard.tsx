import React from "react";
import { Info } from "lucide-react";

interface AdCardProps {
  slot: string; // ID del slot de AdSense
}

export default function AdCard({ slot }: AdCardProps) {
  return (
    <div className="p-0.5 bg-gray-200 dark:bg-zinc-800 rounded-2xl shadow-md min-h-[300px] flex flex-col justify-between overflow-hidden">
      <div className="bg-white dark:bg-zinc-900 rounded-[14px] p-5 h-full flex flex-col justify-between relative overflow-hidden flex-1">
        {/* Etiqueta de Anuncio */}
        <div className="flex items-center justify-between mb-3">
          <span className="bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400 font-extrabold text-[10px] px-2 py-0.5 rounded tracking-widest uppercase flex items-center gap-1">
            <Info className="w-3 h-3 text-gray-400" />
            Anuncio Patrocinado
          </span>
        </div>

        {/* Contenido / Google AdSense Slot */}
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
          {/* Aquí se inyecta Google AdSense en producción */}
          {process.env.NODE_ENV === "production" ? (
            <div className="w-full h-full min-h-[150px] flex items-center justify-center">
              <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-format="fluid"
                data-ad-layout-key="-fb+5w+4e-db+86"
                data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Reemplazar con el ID de cliente de AdSense real
                data-ad-slot={slot}
              />
              <script
                dangerouslySetInnerHTML={{
                  __html: "(adsbygoogle = window.adsbygoogle || []).push({});",
                }}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-400 dark:text-zinc-500 font-mono font-bold">
                AD
              </div>
              <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">
                Google AdSense Native Slot
              </p>
              <p className="text-[10px] text-gray-300 dark:text-zinc-600 font-mono">
                Slot ID: {slot}
              </p>
            </div>
          )}
        </div>

        {/* Footer del Anuncio simulado */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-850 flex items-center justify-between">
          <div className="w-2/3 h-3 bg-gray-100 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="w-1/4 h-8 bg-gray-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}

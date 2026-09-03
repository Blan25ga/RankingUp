import React from "react";
import { Info, ExternalLink, Sparkles } from "lucide-react";

interface AdCardProps {
  slot: string; // ID del slot de AdSense
}

export default function AdCard({ slot }: AdCardProps) {
  return (
    <div className="p-[1px] bg-gradient-to-b from-purple-500/30 via-indigo-500/20 to-zinc-800 rounded-2xl shadow-lg min-h-[300px] flex flex-col justify-between overflow-hidden group hover:border-purple-500/50 transition-all">
      <div className="bg-zinc-950/90 backdrop-blur-xl rounded-[15px] p-5 h-full flex flex-col justify-between relative overflow-hidden flex-1">
        
        {/* Cabecera del Anuncio */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 font-black text-[9px] px-2.5 py-0.5 rounded-full tracking-widest uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Espacio Patrocinado
            </span>
            <span className="text-[9px] text-zinc-500 font-mono">Google Ads</span>
          </div>

          {/* Renderizado de Anuncio */}
          {process.env.NODE_ENV === "production" ? (
            <div className="w-full h-full min-h-[160px] flex items-center justify-center">
              <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-format="fluid"
                data-ad-layout-key="-fb+5w+4e-db+86"
                data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                data-ad-slot={slot}
              />
              <script
                dangerouslySetInnerHTML={{
                  __html: "(adsbygoogle = window.adsbygoogle || []).push({});",
                }}
              />
            </div>
          ) : (
            <div className="py-4 space-y-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-purple-500/20">
                AD
              </div>
              <h4 className="font-extrabold text-base text-white line-clamp-1">
                {slot === "slot-4-native" ? "Hosting Cloud de Alta Velocidad" : "Herramientas de Crecimiento Digital"}
              </h4>
              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                {slot === "slot-4-native" 
                  ? "Despliega tus aplicaciones web con SSL gratuito y rendimiento ultra rápido en servidores dedicados."
                  : "Potencia tu alcance en redes sociales y automatiza tus campañas de marketing fácilmente."}
              </p>
            </div>
          )}
        </div>

        {/* Footer del Anuncio */}
        <div className="mt-3 pt-3 border-t border-zinc-900 flex items-center justify-between">
          <div className="text-[10px] text-zinc-500 font-medium">
            Anuncio de la Red
          </div>
          <span className="py-2 px-3 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg text-xs font-bold flex items-center gap-1">
            <span>Saber más</span>
            <ExternalLink className="w-3 h-3 text-purple-400" />
          </span>
        </div>

      </div>
    </div>
  );
}

import React from "react";
import { 
  ArrowUpRight, 
  Award,
  Zap
} from "lucide-react";
import { InstagramIcon, XIcon, YoutubeIcon, GlobeIcon } from "@/components/BrandIcons";
import { siteConfig } from "@/config/site";


interface CardItemProps {
  position: number;
  title: string;
  description: string;
  ctaText: string;
  targetUrl: string;
  platform: string;
  currentBid: number;
  onBidClick?: () => void;
}

export default function CardItem({
  position,
  title,
  description,
  ctaText,
  targetUrl,
  platform,
  currentBid,
  onBidClick,
}: CardItemProps) {
  // Obtener icono según plataforma
  const getIcon = () => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return <InstagramIcon className="w-5 h-5 text-pink-500" />;
      case "x":
      case "twitter":
        return <XIcon className="w-5 h-5 text-gray-800 dark:text-gray-205" />;
      case "youtube":
        return <YoutubeIcon className="w-5 h-5 text-red-600" />;
      default:
        return <GlobeIcon className="w-5 h-5 text-blue-600" />;
    }
  };

  const isNumberOne = position === 1;

  return (
    <div
      className={`relative group rounded-2xl transition-all duration-300 ${
        isNumberOne
          ? "p-[3px] bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 shadow-xl shadow-amber-500/10 hover:shadow-amber-500/20"
          : "p-0.5 bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 shadow-md"
      }`}
    >
      <div className="bg-white dark:bg-zinc-900 rounded-[14px] p-5 h-full flex flex-col justify-between relative overflow-hidden">
        {/* Decoración premium para el puesto #1 */}
        {isNumberOne && (
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-full blur-xl pointer-events-none" />
        )}

        <div>
          {/* Cabecera de la Tarjeta */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span
                className={`font-black text-sm px-2.5 py-1 rounded-full flex items-center gap-1 ${
                  isNumberOne
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-300/30"
                    : "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300"
                }`}
              >
                {isNumberOne && <Award className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />}
                PUESTO #{position}
              </span>
              <span className="p-1 bg-gray-50 dark:bg-zinc-850 rounded-lg">
                {getIcon()}
              </span>
            </div>
            
            {/* Valor de puja actual */}
            <div className="text-right">
              <span className="text-xs text-gray-500 dark:text-zinc-400 block font-medium">Puja activa</span>
              <span className="font-extrabold text-sm text-gray-900 dark:text-zinc-100">
                {siteConfig.currencySymbol}
                {currentBid.toLocaleString("es-AR")}
              </span>
            </div>
          </div>

          {/* Contenido */}
          <h3 className="font-bold text-lg text-gray-900 dark:text-zinc-100 line-clamp-1 mb-1 tracking-tight">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-zinc-400 line-clamp-3 mb-4 min-h-[3.75rem] leading-relaxed">
            {description}
          </p>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 mt-2">
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 px-4 bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-bold text-sm text-center transition-all hover:bg-gray-800 dark:hover:bg-zinc-200 flex items-center justify-center gap-1.5 shadow-sm"
          >
            {ctaText}
            <ArrowUpRight className="w-4 h-4" />
          </a>
          
          <button
            onClick={onBidClick}
            className={`p-2.5 rounded-xl border transition-all flex items-center justify-center gap-1.5 font-semibold text-xs ${
              isNumberOne
                ? "border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                : "border-gray-200 dark:border-zinc-850 bg-gray-50 dark:bg-zinc-850 text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
            }`}
            title="Pujar por esta posición"
          >
            <Zap className="w-4 h-4 fill-current text-amber-500" />
            <span>Pujar</span>
          </button>
        </div>
      </div>
    </div>
  );
}

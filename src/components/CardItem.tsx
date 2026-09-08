import React from "react";
import { 
  ArrowUpRight, 
  Award, 
  Zap, 
  Flame, 
  Crown,
  Sparkles,
  Eye
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
  views?: number;
}

export default function CardItem({
  position,
  title,
  description,
  ctaText,
  targetUrl,
  platform,
  currentBid,
  views = 0,
}: CardItemProps) {
  const getIcon = () => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return <InstagramIcon className="w-5 h-5 text-pink-400" />;
      case "x":
      case "twitter":
        return <XIcon className="w-5 h-5 text-zinc-200" />;
      case "youtube":
        return <YoutubeIcon className="w-5 h-5 text-red-500" />;
      default:
        return <GlobeIcon className="w-5 h-5 text-cyan-400" />;
    }
  };

  const isNumberOne = position === 1;
  const isNumberTwo = position === 2;
  const isNumberThree = position === 3;

  // Formatear vistas de forma atractiva (ej. 1.2k vistas)
  const formatViews = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  // El Puesto #1 ocupa el doble de espacio (2 columnas en desktop) y es más imponente
  const getCardWrapperStyle = () => {
    if (isNumberOne) {
      return "sm:col-span-2 lg:col-span-2 xl:col-span-2 p-[3px] bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-300 glow-number-one rounded-3xl shadow-2xl min-h-[340px]";
    }
    if (isNumberTwo) {
      return "p-[2px] bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 rounded-2xl shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 min-h-[290px]";
    }
    if (isNumberThree) {
      return "p-[2px] bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 rounded-2xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 min-h-[290px]";
    }
    return "p-[1px] bg-zinc-800 hover:bg-zinc-700 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-transform duration-200 min-h-[290px]";
  };

  const getBadgeStyle = () => {
    if (isNumberOne) {
      return "bg-amber-400/20 text-amber-300 border border-amber-400/50 shadow-md shadow-amber-500/20 text-xs px-3 py-1";
    }
    if (isNumberTwo) {
      return "bg-purple-400/20 text-purple-300 border border-purple-400/40 text-[11px] px-2.5 py-1";
    }
    if (isNumberThree) {
      return "bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 text-[11px] px-2.5 py-1";
    }
    return "bg-zinc-800 text-zinc-300 border border-zinc-700 text-[11px] px-2 py-0.5";
  };

  const getCtaButtonStyle = () => {
    if (isNumberOne) {
      return "bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:brightness-110 text-zinc-950 font-black text-sm py-3.5 px-6 shadow-xl shadow-amber-500/30";
    }
    if (isNumberTwo) {
      return "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs py-2.5 px-4 shadow-md shadow-purple-500/20";
    }
    if (isNumberThree) {
      return "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs py-2.5 px-4 shadow-md shadow-emerald-500/20";
    }
    return "bg-zinc-100 hover:bg-white text-zinc-900 font-extrabold text-xs py-2.5 px-4";
  };

  return (
    <div className={`relative group transition-all duration-300 ${getCardWrapperStyle()}`}>
      <div className={`bg-zinc-900/95 backdrop-blur-xl h-full flex flex-col justify-between relative overflow-hidden ${
        isNumberOne ? "rounded-[22px] p-6 md:p-7" : "rounded-[15px] p-5"
      }`}>
        {/* Resplandor decorativo interno para el #1 */}
        {isNumberOne && (
          <>
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-amber-500/25 via-orange-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-500/15 rounded-full blur-2xl pointer-events-none" />
          </>
        )}

        <div>
          {/* Cabecera de la Tarjeta */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className={`font-black rounded-full flex items-center gap-1.5 uppercase tracking-wider ${getBadgeStyle()}`}>
                {isNumberOne && <Crown className="w-4 h-4 fill-amber-400 text-amber-400 animate-bounce" />}
                {isNumberTwo && <Award className="w-3.5 h-3.5 fill-purple-400 text-purple-400" />}
                {isNumberThree && <Flame className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />}
                PUESTO #{position} {isNumberOne && "⭐ LÍDER"}
              </span>
              <span className={`rounded-xl border border-zinc-700/50 ${isNumberOne ? 'p-2 bg-amber-500/10' : 'p-1.5 bg-zinc-800/80'}`}>
                {getIcon()}
              </span>
              
              {/* Badge de Vistas Acumuladas */}
              <span className="text-[10px] font-bold bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Eye className="w-3 h-3 text-cyan-400" />
                <span>{formatViews(views)} vistas</span>
              </span>
            </div>
            
            {/* Valor de puja actual */}
            <div className="text-right">
              <span className="text-[10px] text-zinc-400 block font-semibold uppercase tracking-wider">
                {isNumberOne ? "Puja Récord" : "Puja activa"}
              </span>
              <span className={`font-black ${isNumberOne ? 'text-lg md:text-xl text-amber-400' : 'text-sm text-zinc-100'}`}>
                {siteConfig.currencySymbol}
                {currentBid.toLocaleString("es-AR")}
              </span>
            </div>
          </div>

          {/* Título y Contenido */}
          <h3 className={`font-black text-white line-clamp-1 mb-2 tracking-tight group-hover:text-amber-400 transition-colors ${
            isNumberOne ? "text-xl md:text-2xl" : "text-lg"
          }`}>
            {title}
          </h3>
          <p className={`text-zinc-400 leading-relaxed ${
            isNumberOne ? "text-sm line-clamp-3 min-h-[3.8rem] max-w-xl" : "text-xs line-clamp-3 min-h-[3.25rem]"
          }`}>
            {description}
          </p>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3 mt-4 pt-3.5 border-t border-zinc-800/80">
          <form action={targetUrl} method="get" target="_blank" className="flex-1">
            <button
              type="submit"
              aria-label={`${ctaText}: ${title}`}
              className={`w-full rounded-xl text-center transition-all flex items-center justify-center gap-2 ${getCtaButtonStyle()}`}
            >
              {isNumberOne && <Sparkles className="w-4 h-4 fill-zinc-950" />}
              <span>{ctaText}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </form>
          
          <button
            className={`rounded-xl border transition-all flex items-center justify-center gap-1.5 font-bold ${
              isNumberOne
                ? "py-3 px-4 text-xs border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 shadow-md shadow-amber-500/10"
                : "p-2.5 text-xs border-zinc-700 bg-zinc-800/80 text-amber-400 hover:bg-amber-500/10"
            }`}
            title="Superar puja"
          >
            <Zap className="w-4 h-4 fill-current text-amber-400" />
            <span>Superar</span>
          </button>
        </div>
      </div>
    </div>
  );
}

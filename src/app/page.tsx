import React from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { siteConfig } from "@/config/site";
import CardItem from "@/components/CardItem";
import AdCard from "@/components/AdCard";
import StickyFooterAd from "@/components/StickyFooterAd";
import FireworksTrigger from "@/components/FireworksTrigger";
import { 
  Zap, 
  Sparkles, 
  HelpCircle, 
  ArrowRight, 
  ShieldCheck, 
  Mail,
  Scale,
  Crown,
  Flame,
  TrendingUp,
  Activity
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // 1. Incrementar vistas y obtener tarjetas activas desde la base de datos
  try {
    await prisma.card.updateMany({
      where: { currentBid: { gt: 0 } },
      data: { views: { increment: 1 } },
    });
  } catch (e) {
    console.error("Error al incrementar vistas:", e);
  }

  const activeCards = await prisma.card.findMany({
    where: {
      currentBid: { gt: 0 },
    },
    orderBy: {
      position: "asc",
    },
  });

  const numberOneCard = activeCards.find((c) => c.position === 1);
  const nextMinBid = numberOneCard 
    ? numberOneCard.currentBid + siteConfig.minBidStep
    : siteConfig.baseMinBid;

  // 2. Grilla con anuncios nativos intercalados
  const totalSlots = Math.max(activeCards.length + 2, 8);
  const gridElements = [];

  let cardIndex = 0;
  for (let pos = 1; pos <= totalSlots; pos++) {
    if (pos === 4) {
      gridElements.push({ type: "ad", slot: "slot-4-native", key: `ad-${pos}` });
      continue;
    }
    if (pos === 7) {
      gridElements.push({ type: "ad", slot: "slot-7-native", key: `ad-${pos}` });
      continue;
    }

    const currentCard = activeCards[cardIndex];
    if (currentCard) {
      gridElements.push({
        type: "card",
        data: currentCard,
        key: `card-${currentCard.id}`,
        position: pos,
      });
      cardIndex++;
    } else {
      gridElements.push({
        type: "placeholder",
        position: pos,
        key: `placeholder-${pos}`,
      });
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-between pb-28 md:pb-36 relative">
      <FireworksTrigger />
      
      {/* 1. Encabezado Luminoso */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/80 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-36 h-12 group-hover:scale-105 transition-transform">
              <Image
                src="/brand/rankingup-logo.jpg"
                alt="RankingUp"
                fill
                priority
                sizes="144px"
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-200 bg-clip-text text-transparent block">
                {siteConfig.name}
              </span>
              <span className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase block -mt-1">
                Live Ad Board
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/crear"
              className="py-2.5 px-5 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 text-zinc-950 hover:brightness-110 font-black text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 active:scale-95"
            >
              <Sparkles className="w-4 h-4 fill-current text-zinc-950" />
              <span>Conquistar Puesto</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Vibrante & Banner de Subasta */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12">
        
        {/* Banner Hero con Gradiente y Resplandor */}
        <div className="relative overflow-hidden bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-amber-500/30 rounded-3xl p-6 md:p-10 shadow-2xl shadow-amber-500/5">
          {/* Luces de Fondo */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <Activity className="w-3.5 h-3.5" />
                <span>Subasta Publicitaria en Vivo</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                El Puesto #1 se Conquista con{" "}
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 bg-clip-text text-transparent">
                  la Mejor Puja
                </span>
              </h1>

              <p className="text-sm md:text-base text-zinc-400 max-w-2xl leading-relaxed">
                Destaca tu negocio, perfil o marca en la cima de la grilla. Cuando superas la puja del líder, tomas el <strong>Puesto #1</strong> de inmediato.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs font-semibold text-zinc-300">
                <div className="flex items-center gap-1.5 bg-zinc-800/80 px-3 py-1.5 rounded-lg border border-zinc-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Sin Registro / Sin Contraseñas</span>
                </div>
                <div className="flex items-center gap-1.5 bg-zinc-800/80 px-3 py-1.5 rounded-lg border border-zinc-700">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <span>Actualización Inmediata</span>
                </div>
              </div>
            </div>
            
            {/* Tarjeta de Puja Rápida de Hero */}
            <div className="w-full lg:w-auto shrink-0 bg-gradient-to-b from-zinc-800/90 to-zinc-900/90 border border-amber-500/40 rounded-2xl p-6 text-center space-y-4 shadow-xl backdrop-blur-xl">
              <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400 font-extrabold uppercase tracking-wider">
                <Crown className="w-4 h-4 fill-amber-400 text-amber-400 animate-bounce" />
                <span>Para tomar el Puesto #1</span>
              </div>

              <div>
                <div className="text-xs text-zinc-400 font-semibold mb-1">Puja mínima requerida:</div>
                <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-amber-300 via-yellow-200 to-white bg-clip-text text-transparent">
                  {siteConfig.currencySymbol}{nextMinBid.toLocaleString('es-AR')}{" "}
                  <span className="text-sm font-bold text-amber-400">{siteConfig.currency}</span>
                </div>
              </div>

              <Link
                href="/crear"
                className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-zinc-950 font-black text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <span>Pujar por el Puesto #1</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* 3. Grilla Principal de Posiciones */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
              <span>Grilla de Posiciones en Tiempo Real</span>
            </h2>
            <span className="text-xs font-bold text-zinc-400 bg-zinc-800/60 px-3 py-1 rounded-full border border-zinc-700/60">
              {activeCards.length} anunciantes activos
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {gridElements.map((el) => {
              if (el.type === "ad") {
                return <AdCard key={el.key} slot={el.slot!} />;
              }
              
              if (el.type === "card") {
                const cardData = el.data!;
                return (
                  <CardItem
                    key={el.key}
                    position={el.position!}
                    title={cardData.title}
                    description={cardData.description}
                    ctaText={cardData.ctaText}
                    targetUrl={cardData.targetUrl}
                    platform={cardData.platform}
                    currentBid={cardData.currentBid}
                    views={cardData.views}
                  />
                );
              }

              // Placeholder para puestos disponibles con diseño colorido
              const placeholderBid = siteConfig.baseMinBid;
              return (
                <div
                  key={el.key}
                  className="relative group p-[1px] rounded-2xl bg-gradient-to-b from-zinc-800/80 to-zinc-900/80 hover:from-amber-500/40 hover:to-purple-500/40 transition-all duration-300"
                >
                  <div className="bg-zinc-950/80 rounded-[15px] p-5 flex flex-col justify-between h-full min-h-[290px] border border-dashed border-zinc-800 group-hover:border-transparent transition-colors">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black bg-zinc-800/90 text-zinc-400 group-hover:text-amber-300 group-hover:bg-amber-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider transition-colors">
                          Puesto #{el.position}
                        </span>
                        <span className="text-xs font-black text-zinc-500 group-hover:text-zinc-300">
                          {siteConfig.currencySymbol}{placeholderBid}
                        </span>
                      </div>
                      
                      <div className="py-6 flex flex-col items-center justify-center text-center space-y-2.5">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 font-black group-hover:bg-amber-500 group-hover:text-zinc-950 group-hover:scale-110 transition-all shadow-md">
                          +
                        </div>
                        <h4 className="font-extrabold text-sm text-zinc-300 group-hover:text-amber-400 transition-colors">
                          ¡Tu Anuncio Aquí!
                        </h4>
                        <p className="text-[11px] text-zinc-500 leading-relaxed max-w-[200px]">
                          Conquista este espacio con una puja inicial.
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/crear`}
                      className="w-full py-2.5 bg-zinc-900 group-hover:bg-gradient-to-r group-hover:from-amber-500 group-hover:to-orange-500 text-zinc-400 group-hover:text-zinc-950 rounded-xl text-xs font-black text-center transition-all block mt-2 border border-zinc-800 group-hover:border-transparent shadow-sm"
                    >
                      Pujar Posición
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Sección Informativa con Acentos Neón */}
        <div className="border-t border-zinc-800/80 pt-14 max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-white flex items-center justify-center gap-2">
              <HelpCircle className="w-6 h-6 text-amber-400" />
              <span>¿Cómo funciona {siteConfig.name}?</span>
            </h3>
            <p className="text-sm text-zinc-400">
              Subastas de visibilidad 100% automatizadas y sin comisiones abusivas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="bg-zinc-900/70 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 space-y-2.5 hover:border-amber-500/30 transition-colors">
              <h4 className="font-bold text-sm text-amber-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-400 rounded-full" />
                Subasta en Tiempo Real
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                El puesto #1 pertenece al anunciante con la puja aprobada más alta. Si alguien te supera, tu tarjeta desciende automáticamente al puesto #2, #3, etc.
              </p>
            </div>

            <div className="bg-zinc-900/70 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 space-y-2.5 hover:border-purple-500/30 transition-colors">
              <h4 className="font-bold text-sm text-purple-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-400 rounded-full" />
                Reenganche Inmediato por Correo
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Si pierdes el Puesto #1, te enviamos un email instantáneo con tu enlace secreto para que puedas aumentar tu puja con 1 clic y recuperar tu liderazgo.
              </p>
            </div>

            <div className="bg-zinc-900/70 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 space-y-2.5 hover:border-emerald-500/30 transition-colors">
              <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                Transferencia Directa (0% Comisiones)
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Paga directamente por Alias o CBU desde cualquier billetera (Mercado Pago, Cuenta DNI, Banco) sin intermediarios ni retenciones extra.
              </p>
            </div>

            <div className="bg-zinc-900/70 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 space-y-2.5 hover:border-cyan-500/30 transition-colors">
              <h4 className="font-bold text-sm text-cyan-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                Kit de Instagram Story y Widget
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Al ganar una posición, descargas gratis una imagen adaptada a Instagram Stories anunciando tu Puesto #1 con código QR y obtienes un Widget HTML para tu web.
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* 5. Pie de Página */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md py-8 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-sm text-amber-400">
              {siteConfig.name}
            </span>
            <span className="text-xs text-zinc-500">
              &copy; {new Date().getFullYear()} Todos los derechos reservados.
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 font-semibold">
            <Link href="/terminos" className="hover:text-amber-400 transition-colors flex items-center gap-1">
              <Scale className="w-3.5 h-3.5" />
              Términos y Condiciones
            </Link>
            <Link href="/privacidad" className="hover:text-amber-400 transition-colors flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Políticas de Privacidad
            </Link>
            <a href={`mailto:${siteConfig.contactEmail}`} className="hover:text-amber-400 transition-colors flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" />
              Contacto
            </a>
          </div>
        </div>
      </footer>

      {/* Anuncio Fijo Inferior */}
      <StickyFooterAd />
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { siteConfig } from "@/config/site";
import CardItem from "@/components/CardItem";
import AdCard from "@/components/AdCard";
import StickyFooterAd from "@/components/StickyFooterAd";
import { 
  Zap, 
  Sparkles, 
  HelpCircle, 
  ArrowRight, 
  ShieldCheck, 
  Mail,
  Scale
} from "lucide-react";

// Forzar renderizado dinámico para ver actualizaciones de pujas en tiempo real al recargar
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // 1. Obtener tarjetas activas desde la base de datos
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

  // 2. Construir la grilla mezclando tarjetas reales, anuncios nativos y placeholders
  // Queremos mostrar al menos 8 posiciones en la grilla para que tenga estructura
  const totalSlots = Math.max(activeCards.length + 2, 8);
  const gridElements = [];

  let cardIndex = 0;
  for (let pos = 1; pos <= totalSlots; pos++) {
    // Intercalar anuncios nativos en las posiciones #4 y #7 (índices de grilla 4 y 7)
    if (pos === 4) {
      gridElements.push({ type: "ad", slot: "slot-4-native", key: `ad-${pos}` });
      continue;
    }
    if (pos === 7) {
      gridElements.push({ type: "ad", slot: "slot-7-native", key: `ad-${pos}` });
      continue;
    }

    // Si tenemos una tarjeta real para esta posición
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
      // Si no hay tarjeta real, creamos un placeholder disponible para compra
      gridElements.push({
        type: "placeholder",
        position: pos,
        key: `placeholder-${pos}`,
      });
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-between pb-24 md:pb-32">
      {/* 1. Encabezado */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-gray-100 dark:border-zinc-900 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shadow-md shadow-amber-500/20">
              <Zap className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="font-black text-xl tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
              {siteConfig.name}
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/crear"
              className="py-2 px-4 md:px-5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-extrabold text-sm rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 fill-current text-amber-500" />
              <span>Anunciar</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero / Cabecera Informativa */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12">
        
        {/* Banner de Estado del Puesto #1 */}
        <div className="bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-yellow-500/5 border border-amber-500/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Zap className="w-3.5 h-3.5 fill-current" />
              Subasta Publicitaria Activa
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {numberOneCard 
                ? `Puesto #1 ocupado por ${siteConfig.currencySymbol}${numberOneCard.currentBid.toLocaleString('es-AR')}`
                : "¡El Puesto #1 está disponible!"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-xl leading-relaxed">
              Supera al líder actual y quédate con la posición más visible de la grilla. Las actualizaciones son automáticas tras validarse el pago.
            </p>
          </div>
          
          <div className="shrink-0 text-center md:text-right space-y-3">
            <div className="text-xs text-gray-400 dark:text-zinc-500 font-bold uppercase">
              Puja mínima para Puesto #1
            </div>
            <div className="text-3xl font-black text-gray-900 dark:text-white">
              {siteConfig.currencySymbol}
              {nextMinBid.toLocaleString('es-AR')}{" "}
              <span className="text-sm text-gray-400 font-bold">{siteConfig.currency}</span>
            </div>
            <Link
              href="/crear"
              className="inline-flex items-center gap-1.5 py-3 px-6 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-amber-500/15"
            >
              Pujar por Puesto #1
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 3. Grilla Principal de Puestos */}
        <div className="space-y-6">
          <h3 className="font-extrabold text-lg text-gray-800 dark:text-zinc-200">
            Posiciones Destacadas
          </h3>
          
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
                    onBidClick={() => {}} // Redirige por defecto mediante el link, o podemos hacer toggle del form
                  />
                );
              }

              // Renderizado de Placeholder
              const placeholderBid = siteConfig.baseMinBid;
              return (
                <div
                  key={el.key}
                  className="p-0.5 bg-gray-100 dark:bg-zinc-900 border border-dashed border-gray-300 dark:border-zinc-800 rounded-2xl flex flex-col justify-between min-h-[300px] hover:border-amber-400 dark:hover:border-amber-500/50 hover:bg-white dark:hover:bg-zinc-850/10 transition-all duration-300 group"
                >
                  <div className="p-5 flex flex-col justify-between h-full flex-1">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-bold bg-gray-200/60 text-gray-500 dark:bg-zinc-800 dark:text-zinc-500 px-2 py-0.5 rounded-full uppercase">
                          Puesto #{el.position} Disponible
                        </span>
                        <span className="text-xs font-bold text-gray-400 dark:text-zinc-650">
                          {siteConfig.currencySymbol}{placeholderBid}
                        </span>
                      </div>
                      
                      <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-400 dark:text-zinc-600 font-bold group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                          +
                        </div>
                        <h4 className="font-extrabold text-sm text-gray-600 dark:text-zinc-400 group-hover:text-amber-500 transition-colors">
                          ¡Tu Anuncio Aquí!
                        </h4>
                        <p className="text-[11px] text-gray-400 dark:text-zinc-550 leading-relaxed max-w-[180px]">
                          Adquiere este puesto pujando desde el valor mínimo.
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/crear`}
                      className="w-full py-2 bg-gray-100 dark:bg-zinc-800 group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 text-gray-700 dark:text-zinc-300 group-hover:text-white dark:group-hover:text-zinc-900 rounded-lg text-xs font-bold text-center transition-all block mt-2"
                    >
                      Pujar Posición
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Sección de Preguntas Frecuentes */}
        <div className="border-t border-gray-100 dark:border-zinc-900 pt-12 max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center justify-center gap-1.5">
              <HelpCircle className="w-5 h-5 text-amber-500" />
              ¿Cómo funciona {siteConfig.name}?
            </h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Una grilla dinámica de enlaces organizada de forma totalmente automatizada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-850 space-y-2">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                <span className="w-2 h-2 bg-amber-500 rounded-full" />
                ¿Qué es una puja en tiempo real?
              </h4>
              <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                El puesto #1 pertenece al anunciante que ofrezca la puja más alta en pesos argentinos. Si otro anunciante realiza una puja mayor, toma el puesto #1 al instante y desplaza tu tarjeta una posición hacia abajo.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-150 dark:border-zinc-850 space-y-2">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                <span className="w-2 h-2 bg-amber-500 rounded-full" />
                ¿Qué pasa si me superan en la puja?
              </h4>
              <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                Nuestro sistema te enviará automáticamente un correo electrónico de reenganche avisándote que has sido superado y dándote un enlace secreto para que puedas aumentar tu puja fácilmente y recuperar el puesto líder.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-150 dark:border-zinc-850 space-y-2">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                <span className="w-2 h-2 bg-amber-500 rounded-full" />
                ¿Es seguro el sistema de pagos?
              </h4>
              <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                Totalmente. Integramos de manera nativa la API de Mercado Pago. Todas las transacciones se realizan bajo los protocolos de seguridad de la pasarela y las actualizaciones se validan mediante Webhooks firmados en el backend.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-150 dark:border-zinc-850 space-y-2">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                <span className="w-2 h-2 bg-amber-500 rounded-full" />
                ¿Tengo que registrarme?
              </h4>
              <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                No. Creemos en la agilidad del servicio. Rellenas la tarjeta, ingresas el monto, pagas y listo. Para cualquier modificación futura, usas el enlace secreto que llega a tu email.
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* 5. Pie de Página */}
      <footer className="border-t border-gray-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-sm text-gray-900 dark:text-white">
              {siteConfig.name}
            </span>
            <span className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} Todos los derechos reservados.
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500 dark:text-zinc-400 font-semibold">
            <Link href="/terminos" className="hover:text-gray-950 dark:hover:text-white flex items-center gap-1">
              <Scale className="w-3.5 h-3.5" />
              Términos y Condiciones
            </Link>
            <Link href="/privacidad" className="hover:text-gray-950 dark:hover:text-white flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Políticas de Privacidad
            </Link>
            <a href={`mailto:${siteConfig.contactEmail}`} className="hover:text-gray-950 dark:hover:text-white flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" />
              Contacto
            </a>
          </div>
        </div>
      </footer>

      {/* Anuncio Fijo Inferior (Sticky Footer) */}
      <StickyFooterAd />
    </div>
  );
}

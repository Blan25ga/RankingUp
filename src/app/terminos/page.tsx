import React from "react";
import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function TerminosPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Cabecera */}
      <div className="flex justify-between items-center border-b border-zinc-800 pb-5">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-bold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Inicio
        </Link>
        <span className="text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full flex items-center gap-1">
          <Scale className="w-3.5 h-3.5" />
          Términos de Servicio
        </span>
      </div>

      {/* Contenido Legal */}
      <article className="prose prose-invert max-w-none space-y-6">
        <h1 className="text-3xl font-black text-white">
          Términos y Condiciones de Uso
        </h1>
        <p className="text-sm text-zinc-400 font-semibold">
          Última actualización: Agosto 2026
        </p>

        <section className="space-y-3">
          <h2 className="text-lg font-extrabold text-white">1. Aceptación de los Términos</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Al utilizar e interactuar con la plataforma web **{siteConfig.name}** (disponible en {siteConfig.domain}), aceptas de manera automática e irrevocable las presentes condiciones de uso. Si no estás de acuerdo con alguno de los puntos establecidos en este documento, te solicitamos abstenerte de realizar pujas o crear anuncios en nuestro portal.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-extrabold text-white">2. Funcionamiento de la Subasta en Tiempo Real</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            **{siteConfig.name}** opera bajo un modelo de subasta publicitaria auto-service. El anunciante que realiza la puja aprobada más alta se posiciona automáticamente en el **Puesto #1** de la grilla principal. 
            Al ingresar una puja superior por parte de otro usuario, los anuncios anteriores se desplazan un nivel hacia abajo en la jerarquía (del puesto 1 al 2, del 2 al 3, etc.).
            No se garantizan tiempos mínimos de permanencia en ninguna de las posiciones, ya que el sistema depende exclusivamente del comportamiento dinámico de los usuarios y las pujas del mercado.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-extrabold text-white">3. Política de Reembolso y Devoluciones</h2>
          <p className="text-xs text-red-400 font-semibold leading-relaxed">
            IMPORTANTE: Debido a la naturaleza dinámica e inmediata del servicio de subasta publicitaria, todos los pagos realizados a través de transferencias bancarias o pasarelas de pago (Mercado Pago u otros) son definitivos y NO reembolsables. Una vez acreditado el pago, el espacio publicitario se asigna y consume en tiempo real, lo que impide revertir la transacción.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-extrabold text-white">4. Espacios Publicitarios de Terceros y Redes de Anuncios (Google AdSense / Banners)</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            La plataforma **{siteConfig.name}** incorpora espacios publicitarios automatizados gestionados por redes de publicidad de terceros (incluyendo Google AdSense y plataformas programáticas aliadas). 
            Estos anuncios se presentan en forma de **bloques nativos intercalados en la grilla de posiciones (posiciones #4 y #7)** y como **banners fijos inferiores (Sticky Footer Ads)**.
          </p>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Dichos anuncios son servidos de manera independiente y automatizada según las políticas de las redes publicitarias. **{siteConfig.name}** no comercializa ni garantiza directamente los productos, bienes o servicios exhibidos dentro de dichos bloques publicitarios de terceros.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-extrabold text-white">5. Reglas de Contenido y Conducta</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Los anunciantes son los únicos responsables de los títulos, descripciones y enlaces (URLs) que registren en la plataforma. Está estrictamente prohibido anunciar:
          </p>
          <ul className="list-disc pl-5 text-xs text-zinc-400 space-y-1.5">
            <li>Contenido explícito para adultos o pornografía.</li>
            <li>Productos o servicios ilegales según las leyes de la República Argentina.</li>
            <li>Apuestas ilegales, estafas piramidales o esquemas fraudulentos de enriquecimiento rápido.</li>
            <li>Mensajes que promuevan el odio, la violencia, la discriminación o la difamación.</li>
            <li>Enlaces que contengan software malicioso (malware, phishing, virus).</li>
          </ul>
          <p className="text-xs text-zinc-400 leading-relaxed">
            El administrador del sitio se reserva el derecho de retirar de forma inmediata y sin derecho a reembolso cualquier anuncio que infrinja estas normas de contenido.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-extrabold text-white">6. Limitación de Responsabilidad</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            **{siteConfig.name}** no se responsabiliza por los daños directos o indirectos que el anunciante o sus visitantes sufran a raíz del uso del sitio web enlazado. No controlamos los destinos web externos y no avalamos los contenidos o servicios de terceros.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-extrabold text-white">7. Modificaciones de los Términos</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Nos reservamos el derecho de modificar estos términos de servicio en cualquier momento. Cualquier cambio será publicado de inmediato en esta misma dirección web.
          </p>
        </section>
      </article>

      {/* Pie legal */}
      <div className="text-center pt-8 border-t border-zinc-800 text-xs text-zinc-500">
        Para dudas de carácter legal, por favor contáctanos en: {siteConfig.contactEmail}
      </div>
    </div>
  );
}

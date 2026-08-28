import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Cabecera */}
      <div className="flex justify-between items-center border-b border-gray-150 dark:border-zinc-800 pb-5">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-bold text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Inicio
        </Link>
        <span className="text-xs font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 px-3 py-1 rounded-full flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          Políticas de Privacidad
        </span>
      </div>

      {/* Contenido de Privacidad */}
      <article className="prose prose-zinc dark:prose-invert max-w-none space-y-6">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">
          Políticas de Privacidad
        </h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 font-semibold">
          Última actualización: Agosto 2026
        </p>

        <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
          En **{siteConfig.name}**, valoramos tu confianza y nos comprometemos firmemente a proteger tu privacidad. En este documento detallamos qué información recolectamos de ti, cómo la procesamos y qué medidas de seguridad aplicamos en nuestro portal.
        </p>

        <section className="space-y-3">
          <h2 className="text-lg font-extrabold text-gray-950 dark:text-white">1. Información que Recolectamos</h2>
          <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
            Para ofrecer nuestro servicio publicitario ágil de auto-servicio, únicamente solicitamos la información mínima necesaria:
          </p>
          <ul className="list-disc pl-5 text-xs text-gray-600 dark:text-zinc-400 space-y-1.5">
            <li>**Dirección de correo electrónico (Email):** Usada para enviarte tu token de acceso seguro (que te permite editar tus anuncios sin contraseña) y las notificaciones automáticas de pérdida del Puesto #1.</li>
            <li>**Detalles del Anuncio:** Título, descripción corta, URL de destino y plataforma de red social seleccionada.</li>
            <li>**Datos de Transacciones:** Registramos los IDs de transacciones y estados aprobados por Mercado Pago para validar tu posición. **NUNCA recolectamos ni almacenamos datos de tus tarjetas de crédito, débito o cuentas bancarias**, las cuales son procesadas con cifrado de extremo a extremo directamente por la pasarela de pagos.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-extrabold text-gray-950 dark:text-white">2. Uso de la Información</h2>
          <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
            La información recolectada se utiliza exclusivamente para:
          </p>
          <ul className="list-disc pl-5 text-xs text-gray-600 dark:text-zinc-400 space-y-1.5">
            <li>Publicar y renderizar tu tarjeta informativa en la grilla del sitio.</li>
            <li>Gestionar el reordenamiento automático de puestos y procesar Webhooks.</li>
            <li>Brindarte soporte técnico cuando lo solicites a través de nuestro email de contacto.</li>
            <li>Enviarte las alertas de reenganche en tiempo real al ser superado por otro anunciante.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-extrabold text-gray-950 dark:text-white">3. Cookies y Publicidad de Terceros (Google AdSense)</h2>
          <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
            Utilizamos cookies esenciales para el correcto funcionamiento del portal y el almacenamiento del modo oscuro/claro de tu navegador.
          </p>
          <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
            Adicionalmente, proveedores terceros, incluido Google, utilizan cookies para publicar anuncios de AdSense en nuestro portal basándose en tus visitas previas a este u otros sitios web de internet. Puedes inhabilitar la publicidad personalizada configurando los ajustes de anuncios de Google o mediante plataformas como optout.aboutads.info.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-extrabold text-gray-950 dark:text-white">4. Almacenamiento y Protección de Datos</h2>
          <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
            Los datos de tu anuncio se alojan de forma segura en una base de datos relacional protegida bajo credenciales cifradas y accesos restringidos de servidor. Al no utilizar contraseñas, limitamos la superficie de ataques por robo de credenciales tradicionales. Tu token secreto es la única vía de modificación de la tarjeta, por lo que te sugerimos no compartirlo.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-extrabold text-gray-950 dark:text-white">5. Tus Derechos sobre tus Datos</h2>
          <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
            Si deseas que eliminemos permanentemente tu anuncio y dirección de correo de nuestros servidores, puedes solicitar la baja escribiéndonos un correo a nuestro contacto desde la casilla de email asociada al anuncio.
          </p>
        </section>
      </article>

      {/* Pie legal */}
      <div className="text-center pt-8 border-t border-gray-150 dark:border-zinc-800 text-xs text-gray-400">
        Para dudas de carácter legal, por favor contáctanos en: {siteConfig.contactEmail}
      </div>
    </div>
  );
}

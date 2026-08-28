import React, { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import CardWizard from "@/components/CardWizard";
import { siteConfig } from "@/config/site";

// Necesario para leer query parameters en App Router
interface PageProps {
  searchParams: Promise<{
    cardId?: string;
    token?: string;
    error?: string;
  }>;
}

export default async function CrearPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const cardId = resolvedParams.cardId || null;
  const token = resolvedParams.token || null;
  const error = resolvedParams.error || null;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      {/* Cabecera */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-bold text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la grilla
        </Link>
        <span className="text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full flex items-center gap-1">
          <Sparkles className="w-3 h-3 fill-current" />
          {siteConfig.name} Auto-Service
        </span>
      </div>

      {/* Componente del Wizard con Suspense para soporte de lectura de searchParams en cliente */}
      <div className="relative">
        {error && (
          <div role="alert" className="max-w-4xl mx-auto mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error === "payment_failed"
              ? "El pago no se completó. Puedes revisar los datos e intentarlo nuevamente."
              : error === "payment_pending"
                ? "El pago está pendiente de confirmación. Conserva este enlace y revisa tu correo."
                : "No se pudo completar la operación. Revisa los datos e inténtalo nuevamente."}
          </div>
        )}
        <Suspense
          fallback={
            <div className="w-full max-w-4xl mx-auto bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-12 shadow-xl flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-4 font-semibold">
                Cargando el editor de anuncios...
              </p>
            </div>
          }
        >
          <CardWizard initialCardId={cardId} initialToken={token} />
        </Suspense>
      </div>
    </div>
  );
}

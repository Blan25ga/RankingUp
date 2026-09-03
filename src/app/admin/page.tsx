"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  ShieldCheck, 
  CheckCircle2, 
  Trash2, 
  RefreshCw, 
  Lock, 
  ExternalLink, 
  ArrowLeft,
  Award,
  AlertCircle
} from "lucide-react";
import { siteConfig } from "@/config/site";

type AdminCard = {
  id: string;
  currentBid: number;
  views?: number;
  title: string;
  description: string;
  targetUrl: string;
  ctaText: string;
  platform: string;
  position?: number;
  email: string;
  editToken: string;
  createdAt: string | Date;
  bids?: Array<{ amount: number }>;
};

function AdminContent() {
  const searchParams = useSearchParams();
  const keyParam = searchParams.get("key");
  const [adminKey, setAdminKey] = useState<string>(keyParam ?? "");
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [cards, setCards] = useState<AdminCard[]>([]);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Cargar tarjetas si hay una clave
  const fetchCards = async (keyToUse: string) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/cards?key=${encodeURIComponent(keyToUse)}`);
      const data = await res.json();
      if (res.ok) {
        setCards(data.cards || []);
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
        setMessage({ text: data.error || "Clave de administrador incorrecta", type: "error" });
      }
    } catch {
      setMessage({ text: "Error de red al consultar el servidor", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!keyParam) return;

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setMessage(null);

      try {
        const res = await fetch(`/api/admin/cards?key=${encodeURIComponent(keyParam)}`);
        const data = await res.json();

        if (cancelled) return;

        if (res.ok) {
          setCards(data.cards || []);
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
          setMessage({ text: data.error || "Clave de administrador incorrecta", type: "error" });
        }
      } catch {
        if (!cancelled) {
          setMessage({ text: "Error de red al consultar el servidor", type: "error" });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [keyParam]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCards(adminKey);
  };

  // Aprobar un pago de transferencia
  const handleApprove = async (cardId: string, amount: number) => {
    if (!confirm(`¿Confirmas que recibiste la transferencia de ${siteConfig.currencySymbol}${amount.toLocaleString('es-AR')}? Esta acción posicionará el anuncio de inmediato.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: adminKey, action: "approve", cardId, amount }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: data.message || "Pago aprobado con éxito", type: "success" });
        fetchCards(adminKey);
      } else {
        setMessage({ text: data.error || "Error al aprobar", type: "error" });
      }
    } catch {
      setMessage({ text: "Error de red al aprobar tarjeta", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Eliminar tarjeta
  const handleDelete = async (cardId: string, title: string) => {
    if (!confirm(`¿Estás seguro de eliminar el anuncio "${title}"?`)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: adminKey, action: "delete", cardId }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: "Anuncio eliminado correctamente", type: "success" });
        fetchCards(adminKey);
      } else {
        setMessage({ text: data.error || "Error al eliminar", type: "error" });
      }
    } catch {
      setMessage({ text: "Error de red al eliminar", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const activeCards = cards.filter((c) => c.currentBid > 0);
  const pendingCards = cards.filter((c) => c.currentBid === 0);
  const totalViews = cards.reduce((acc, c) => acc + (c.views || 0), 0);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              Panel de Administración
            </h1>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Ingresa tu clave secreta de administración para gestionar pagos y posiciones.
            </p>
          </div>

          {message && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-300 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                Clave Secreta (ADMIN_SECRET_KEY)
              </label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Ingresa tu ADMIN_SECRET_KEY"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-850 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-extrabold text-sm rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Acceder al Panel"}
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              Volver a la web pública
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Cabecera del Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              Panel de Control {siteConfig.name}
            </h1>
            <span className="text-xs bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Activo
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Aprueba transferencias directas y gestiona la grilla de posiciones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchCards(adminKey)}
            disabled={loading}
            className="p-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-850 font-bold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refrescar</span>
          </button>
          <Link
            href="/"
            target="_blank"
            className="py-2.5 px-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <span>Ver Grilla en Vivo</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between text-sm font-semibold ${
          message.type === "success" 
            ? "bg-green-50 text-green-800 border-green-200 dark:bg-green-950/20 dark:text-green-300 dark:border-green-800/30"
            : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-800/30"
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xs underline">Cerrar</button>
        </div>
      )}

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-bold uppercase text-gray-400">Transferencias Pendientes</span>
          <div className="text-3xl font-black text-amber-500 mt-1">{pendingCards.length}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-bold uppercase text-gray-400">Anuncios Activos</span>
          <div className="text-3xl font-black text-gray-900 dark:text-white mt-1">{activeCards.length}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-bold uppercase text-gray-400">Puja Máxima (#1)</span>
          <div className="text-3xl font-black text-gray-900 dark:text-white mt-1">
            {siteConfig.currencySymbol}{activeCards[0]?.currentBid?.toLocaleString('es-AR') || 0}
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs font-bold uppercase text-gray-400">Vistas Totales Acumuladas</span>
          <div className="text-3xl font-black text-cyan-500 mt-1">{totalViews.toLocaleString('es-AR')}</div>
        </div>
      </div>

      {/* SECCIÓN 1: TRANSFERENCIAS PENDIENTES */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
          Transferencias Bancarias Pendientes ({pendingCards.length})
        </h2>

        {pendingCards.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-400">
            No hay transferencias pendientes de verificación en este momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-zinc-850 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Anuncio</th>
                  <th className="p-3">Contacto</th>
                  <th className="p-3">Plataforma</th>
                  <th className="p-3">Monto Ofertado</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3 text-right">Acción Rápida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 font-medium">
                {pendingCards.map((card) => {
                  const lastBid = card.bids?.[0]?.amount ?? siteConfig.baseMinBid;
                  return (
                    <tr key={card.id} className="hover:bg-gray-50 dark:hover:bg-zinc-850/50 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-gray-900 dark:text-white">{card.title}</div>
                        <div className="text-gray-400 line-clamp-1 max-w-xs">{card.description}</div>
                        <a href={card.targetUrl} target="_blank" className="text-blue-500 hover:underline flex items-center gap-1 mt-0.5">
                          {card.ctaText} <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </td>
                      <td className="p-3 font-mono text-gray-600 dark:text-zinc-400">{card.email}</td>
                      <td className="p-3 uppercase font-bold text-[10px] text-gray-500">{card.platform}</td>
                      <td className="p-3 font-black text-sm text-amber-600 dark:text-amber-400">
                        {siteConfig.currencySymbol}{lastBid.toLocaleString('es-AR')}
                      </td>
                      <td className="p-3 text-gray-400">{new Date(card.createdAt).toLocaleString("es-AR")}</td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleApprove(card.id, lastBid)}
                          className="py-2 px-3 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-lg transition-colors inline-flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Aprobar Pago</span>
                        </button>
                        <button
                          onClick={() => handleDelete(card.id, card.title)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECCIÓN 2: GRILLA ACTIVA EN VIVO */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500 fill-current" />
          Anuncios Activos en Grilla ({activeCards.length})
        </h2>

        {activeCards.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-400">
            La grilla está vacía actualmente.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-zinc-850 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Posición</th>
                  <th className="p-3">Anuncio</th>
                  <th className="p-3">Vistas</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Puja Activa</th>
                  <th className="p-3">Token Secreto</th>
                  <th className="p-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 font-medium">
                {activeCards.map((card) => (
                  <tr key={card.id} className="hover:bg-gray-50 dark:hover:bg-zinc-850/50 transition-colors">
                    <td className="p-3 font-black text-sm">
                      <span className={`px-2.5 py-1 rounded-full ${
                        card.position === 1 ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 font-black" : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300"
                      }`}>
                        #{card.position}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-gray-900 dark:text-white">{card.title}</div>
                      <div className="text-gray-400 line-clamp-1 max-w-xs">{card.description}</div>
                    </td>
                    <td className="p-3 font-bold text-cyan-400">
                      👁️ {(card.views || 0).toLocaleString('es-AR')}
                    </td>
                    <td className="p-3 font-mono text-gray-600 dark:text-zinc-400">{card.email}</td>
                    <td className="p-3 font-black text-gray-900 dark:text-zinc-100">
                      {siteConfig.currencySymbol}{card.currentBid.toLocaleString('es-AR')}
                    </td>
                    <td className="p-3 font-mono text-[10px] text-gray-400 select-all">{card.editToken}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDelete(card.id, card.title)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
          <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
          <p className="text-xs text-gray-500 mt-3 font-semibold">Cargando Panel de Administración...</p>
        </div>
      }
    >
      <AdminContent />
    </Suspense>
  );
}

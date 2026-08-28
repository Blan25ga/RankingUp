"use client";
import React, { useState, useEffect } from "react";
import { 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle,
  Loader2,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { InstagramIcon, XIcon, YoutubeIcon, GlobeIcon } from "@/components/BrandIcons";
import CardItem from "./CardItem";
import { siteConfig } from "@/config/site";

interface CardWizardProps {
  initialCardId?: string | null;
  initialToken?: string | null;
}

export default function CardWizard({ initialCardId, initialToken }: CardWizardProps) {

  // Estados del Wizard
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [minBid, setMinBid] = useState<number>(siteConfig.baseMinBid);

  // Estados del Formulario
  const [platform, setPlatform] = useState<string>("instagram");
  const [targetUrl, setTargetUrl] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [ctaText, setCtaText] = useState<string>("Seguir");
  const [email, setEmail] = useState<string>("");
  const [bidAmount, setBidAmount] = useState<string>("");

  // Modo edición/re-puja
  const isEditing = !!initialCardId && !!initialToken;

  // 1. Cargar datos si estamos en modo re-puja/edición
  useEffect(() => {
    async function fetchCardDetails() {
      if (!isEditing) {
        // Cargar puja mínima actual para nueva tarjeta
        try {
          const res = await fetch("/api/cards");
          const data = await res.json();
          if (data.minBidForNumberOne) {
            setMinBid(data.minBidForNumberOne);
            setBidAmount(data.minBidForNumberOne.toString());
          }
        } catch (e) {
          console.error("Error al obtener puja mínima:", e);
        }
        return;
      }

      setLoading(true);
      try {
        // Cargar datos de la tarjeta a editar
        const cardRes = await fetch(`/api/cards/${initialCardId}?token=${initialToken}`);
        const cardData = await cardRes.json();

        if (cardRes.ok) {
          setPlatform(cardData.platform);
          setTargetUrl(cardData.targetUrl);
          setTitle(cardData.title);
          setDescription(cardData.description);
          setCtaText(cardData.ctaText);
          setEmail(cardData.email);
          
          // Cargar puja mínima requerida para recuperar puesto #1
          const mainRes = await fetch("/api/cards");
          const mainData = await mainRes.json();
          if (mainData.minBidForNumberOne) {
            setMinBid(mainData.minBidForNumberOne);
            setBidAmount(Math.max(mainData.minBidForNumberOne, cardData.currentBid + siteConfig.minBidStep).toString());
          }
          
          // Ir directo al paso 3 de puja
          setStep(3);
        } else {
          setError(cardData.error || "No se pudo cargar la tarjeta de reenganche");
        }
      } catch {
        setError("Error de red al conectar con el servidor");
      } finally {
        setLoading(false);
      }
    }

    fetchCardDetails();
  }, [initialCardId, initialToken, isEditing]);

  // Manejar cambio de plataforma e inicializar CTA común
  const handlePlatformChange = (p: string) => {
    setPlatform(p);
    if (p === "instagram") setCtaText("Ver Perfil");
    else if (p === "x" || p === "twitter") setCtaText("Ver Perfil");
    else if (p === "youtube") setCtaText("Suscribirse");
    else setCtaText("Visitar Web");
  };

  // Validaciones de Pasos
  const validateStep1 = () => {
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      setError("La URL de destino debe comenzar con http:// o https://");
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep2 = () => {
    if (!title.trim() || title.length > 38) {
      setError("El título es obligatorio y no puede superar los 38 caracteres");
      return false;
    }
    if (!description.trim() || description.length > 110) {
      setError("La descripción es obligatoria y no puede superar los 110 caracteres");
      return false;
    }
    if (!ctaText.trim() || ctaText.length > 20) {
      setError("El botón de acción es obligatorio y no puede superar los 20 caracteres");
      return false;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Introduce una dirección de correo electrónico válida");
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep3 = () => {
    const amount = Number(bidAmount);
    if (isNaN(amount) || amount < minBid) {
      setError(`La puja debe ser un número igual o superior a ${siteConfig.currencySymbol}${minBid.toLocaleString('es-AR')}`);
      return false;
    }
    setError(null);
    return true;
  };

  // Navegación
  const nextStep = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const prevStep = () => {
    setError(null);
    if (step > 1) setStep(step - 1);
  };

  // Enviar y procesar checkout de Mercado Pago
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          ctaText,
          targetUrl,
          platform,
          email,
          amount: Number(bidAmount),
          cardId: initialCardId,
          token: initialToken,
        }),
      });

      const data = await response.json();

      if (response.ok && data.initPoint) {
        // Redirigir a Mercado Pago para realizar el pago de forma segura
        window.location.href = data.initPoint;
      } else {
        setError(data.error || "Ocurrió un error al procesar el checkout");
      }
    } catch {
      setError("Error de red. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xl">
      {/* Indicador de pasos */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-100 dark:border-zinc-800 pb-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
            {isEditing ? "Modo Re-puja Segura" : "Crea tu Anuncio"}
          </span>
          <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mt-1">
            {isEditing ? "Recupera tu posición" : "Consigue tu puesto en la grilla"}
          </h2>
        </div>
        <div className="flex items-center gap-1.5 font-bold text-sm bg-gray-50 dark:bg-zinc-850 px-3 py-1.5 rounded-full text-gray-500 dark:text-zinc-400">
          <span className={step >= 1 ? "text-gray-900 dark:text-white" : ""}>1</span>
          <span className="text-gray-300">/</span>
          <span className={step >= 2 ? "text-gray-900 dark:text-white" : ""}>2</span>
          <span className="text-gray-300">/</span>
          <span className={step >= 3 ? "text-gray-900 dark:text-white" : ""}>3</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 rounded-r-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <span className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</span>
        </div>
      )}

      {loading && step === 1 && isEditing ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          <p className="text-sm text-gray-500 mt-4">Cargando datos de tu anuncio...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Formulario (Columna Izquierda) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* PASO 1: DESTINO */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-3">
                    1. Selecciona la plataforma
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: "instagram", icon: <InstagramIcon className="w-5 h-5" />, label: "Instagram" },
                      { id: "x", icon: <XIcon className="w-5 h-5" />, label: "X / Twitter" },
                      { id: "youtube", icon: <YoutubeIcon className="w-5 h-5" />, label: "YouTube" },
                      { id: "web", icon: <GlobeIcon className="w-5 h-5" />, label: "Web / Otro" }
                    ].map((plat) => (
                      <button
                        key={plat.id}
                        type="button"
                        onClick={() => handlePlatformChange(plat.id)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 font-bold text-sm transition-all ${
                          platform === plat.id
                            ? "border-amber-500 bg-amber-500/5 text-amber-600 dark:text-amber-400"
                            : "border-gray-150 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-850"
                        }`}
                      >
                        {plat.icon}
                        {plat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="targetUrl" className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-2">
                    2. Enlace / URL destino del botón
                  </label>
                  <input
                    type="url"
                    id="targetUrl"
                    placeholder="https://instagram.com/tu_usuario"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-amber-500 outline-none transition-all text-sm font-medium"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    La dirección exacta a donde se dirigirá el usuario al hacer clic en el botón de tu tarjeta.
                  </p>
                </div>
              </div>
            )}

            {/* PASO 2: CONTENIDO */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="title" className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                      Título del Anuncio
                    </label>
                    <span className={`text-xs ${title.length > 38 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                      {title.length}/38
                    </span>
                  </div>
                  <input
                    type="text"
                    id="title"
                    maxLength={38}
                    placeholder="Ej. Hamburguesería Craft Puesto #1"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-amber-500 outline-none transition-all text-sm font-medium"
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="description" className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                      Descripción corta
                    </label>
                    <span className={`text-xs ${description.length > 110 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                      {description.length}/110
                    </span>
                  </div>
                  <textarea
                    id="description"
                    maxLength={110}
                    rows={3}
                    placeholder="Ej. Las mejores smash de la ciudad. Con ingredientes 100% locales y pan de papa horneado a diario."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-amber-500 outline-none transition-all text-sm font-medium resize-none"
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="ctaText" className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                      Texto del botón (CTA)
                    </label>
                    <span className={`text-xs ${ctaText.length > 20 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                      {ctaText.length}/20
                    </span>
                  </div>
                  <input
                    type="text"
                    id="ctaText"
                    maxLength={20}
                    placeholder="Ej. Ver Menú"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-amber-500 outline-none transition-all text-sm font-medium"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-2">
                    Tu Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="socio@hamburguesas.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-amber-500 outline-none transition-all text-sm font-medium"
                    required
                    disabled={isEditing} // En reenganche, mantenemos el email original para mantener consistencia
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
                    Te enviaremos el código de edición de tu tarjeta y notificaciones inmediatas si alguien supera tu puja.
                  </p>
                </div>
              </div>
            )}

            {/* PASO 3: PUJA */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <span>Monto requerido para el Puesto #1</span>
                  </div>
                  <p className="text-xs text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                    Para posicionar tu anuncio en la primera posición de la grilla principal, tu puja debe superar la puja actual por el salto mínimo de {siteConfig.currencySymbol}{siteConfig.minBidStep}.
                  </p>
                  <div className="text-xl font-extrabold text-amber-900 dark:text-amber-200">
                    Puja mínima: {siteConfig.currencySymbol}{minBid.toLocaleString('es-AR')} {siteConfig.currency}
                  </div>
                </div>

                <div>
                  <label htmlFor="bidAmount" className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-2">
                    Introduce el monto de tu puja ({siteConfig.currencySymbol})
                  </label>
                  <input
                    type="number"
                    id="bidAmount"
                    min={minBid}
                    step={siteConfig.minBidStep}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl border-2 border-amber-500 bg-white dark:bg-zinc-900 focus:ring-4 focus:ring-amber-500/20 outline-none text-2xl font-black text-amber-600 dark:text-amber-400"
                    placeholder={minBid.toString()}
                    required
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Las transacciones se procesan de forma inmediata a través de la pasarela segura. Tu puesto se actualizará al instante de acreditarse.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-extrabold text-base transition-all hover:brightness-105 active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Procesando pago seguro...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Ir a Pagar con Mercado Pago</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Controles de Navegación del Wizard */}
            {step < 3 && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={prevStep}
                  className={`flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-850 ${
                    step === 1 ? "opacity-0 pointer-events-none" : ""
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-1.5 text-sm font-extrabold px-6 py-2.5 rounded-xl bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-gray-800 dark:hover:bg-zinc-200 shadow-sm"
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="flex items-center justify-start pt-2">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Editar contenidos
                </button>
              </div>
            )}

          </div>

          {/* Vista Previa Interactiva (Columna Derecha) */}
          <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-current" />
              Vista Previa en Tiempo Real
            </h4>
            <div className="border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-3xl p-4 bg-gray-50/50 dark:bg-zinc-950/20">
              <CardItem
                position={1} // Simulamos la primera posición para la vista previa
                title={title || "Tu Título Aquí"}
                description={description || "Aquí aparecerá la descripción corta de tu marca, negocio o perfil. Cuida los límites de caracteres para captar la atención."}
                ctaText={ctaText || "Seguir"}
                targetUrl={targetUrl || "#"}
                platform={platform}
                currentBid={Number(bidAmount) || minBid}
              />
            </div>
            <p className="text-[11px] text-gray-400 text-center leading-relaxed px-4">
              Así es exactamente como los usuarios verán tu tarjeta en la grilla principal de {siteConfig.name} una vez que el pago sea acreditado.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

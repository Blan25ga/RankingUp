"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle,
  Loader2,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Building2,
  MessageCircle,
  Play,
  Zap
} from "lucide-react";
import { InstagramIcon, XIcon, YoutubeIcon, GlobeIcon } from "@/components/BrandIcons";
import CardItem from "./CardItem";
import { siteConfig } from "@/config/site";

interface CardWizardProps {
  initialCardId?: string | null;
  initialToken?: string | null;
}

export default function CardWizard({ initialCardId, initialToken }: CardWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

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
  const [ctaText, setCtaText] = useState<string>("Ver Perfil");
  const [email, setEmail] = useState<string>("");
  const [bidAmount, setBidAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"transfer" | "demo" | "mercadopago">("transfer");

  // Estados de copia
  const [copiedAlias, setCopiedAlias] = useState(false);
  const [copiedCbu, setCopiedCbu] = useState(false);

  // Modo edición/re-puja
  const isEditing = !!initialCardId && !!initialToken;

  // 1. Cargar datos si estamos en modo re-puja/edición
  useEffect(() => {
    async function fetchCardDetails() {
      if (!isEditing) {
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
        const cardRes = await fetch(`/api/cards/${initialCardId}?token=${initialToken}`);
        const cardData = await cardRes.json();

        if (cardRes.ok) {
          setPlatform(cardData.platform);
          setTargetUrl(cardData.targetUrl);
          setTitle(cardData.title);
          setDescription(cardData.description);
          setCtaText(cardData.ctaText);
          setEmail(cardData.email);
          
          const mainRes = await fetch("/api/cards");
          const mainData = await mainRes.json();
          if (mainData.minBidForNumberOne) {
            setMinBid(mainData.minBidForNumberOne);
            setBidAmount(Math.max(mainData.minBidForNumberOne, cardData.currentBid + siteConfig.minBidStep).toString());
          }
          
          setStep(3);
        } else {
          setError(cardData.error || "No se pudo cargar la tarjeta de reenganche");
        }
      } catch (err) {
        setError("Error de red al conectar con el servidor");
      } finally {
        setLoading(false);
      }
    }

    fetchCardDetails();
  }, [initialCardId, initialToken, isEditing]);

  const handlePlatformChange = (p: string) => {
    setPlatform(p);
    if (p === "instagram") setCtaText("Ver Perfil");
    else if (p === "x" || p === "twitter") setCtaText("Ver Perfil");
    else if (p === "youtube") setCtaText("Suscribirse");
    else setCtaText("Visitar Web");
  };

  const copyToClipboard = (text: string, type: "alias" | "cbu") => {
    navigator.clipboard.writeText(text);
    if (type === "alias") {
      setCopiedAlias(true);
      setTimeout(() => setCopiedAlias(false), 2000);
    } else {
      setCopiedCbu(true);
      setTimeout(() => setCopiedCbu(false), 2000);
    }
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

  const nextStep = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const prevStep = () => {
    setError(null);
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
          paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Ocurrió un error al procesar el anuncio");
        setLoading(false);
        return;
      }

      if (data.method === "transfer" || data.method === "demo") {
        router.push(`/crear/exito?cardId=${data.cardId}&token=${data.token}`);
        return;
      }

      if (data.initPoint) {
        window.location.href = data.initPoint;
      } else {
        router.push(`/crear/exito?cardId=${data.cardId}&token=${data.token}`);
      }
    } catch (err) {
      setError("Error de red. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const getWhatsappUrl = () => {
    const text = `¡Hola! Quiero confirmar mi transferencia de $${Number(bidAmount || minBid).toLocaleString('es-AR')} para mi anuncio "${title || 'Sin Título'}" en ${siteConfig.name}. Mi email es: ${email}`;
    return `https://wa.me/${siteConfig.bankDetails.whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  // Obtener estilo de botón de plataforma
  const getPlatformButtonStyle = (platId: string) => {
    const isSelected = platform === platId;
    if (!isSelected) {
      return "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-850 hover:text-zinc-200";
    }
    if (platId === "instagram") {
      return "border-pink-500 bg-pink-500/15 text-pink-300 shadow-lg shadow-pink-500/20";
    }
    if (platId === "x") {
      return "border-zinc-300 bg-zinc-800 text-white shadow-lg shadow-zinc-500/20";
    }
    if (platId === "youtube") {
      return "border-red-500 bg-red-500/15 text-red-300 shadow-lg shadow-red-500/20";
    }
    return "border-cyan-500 bg-cyan-500/15 text-cyan-300 shadow-lg shadow-cyan-500/20";
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-zinc-900/90 backdrop-blur-2xl border border-zinc-800/80 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
      
      {/* Resplandor decorativo en la esquina */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Indicador de pasos */}
      <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-5 relative z-10">
        <div>
          <span className="text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            {isEditing ? "Modo Re-puja Segura" : "Auto-Service en 3 Pasos"}
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white mt-1">
            {isEditing ? "Recupera el Puesto #1" : "Conquista tu Posición en la Grilla"}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                step === num
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 shadow-md shadow-amber-500/30 scale-110"
                  : step > num
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-zinc-800 text-zinc-500 border border-zinc-700"
              }`}
            >
              {step > num ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : num}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-950/40 border-l-4 border-red-500 rounded-r-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <span className="text-sm text-red-300 font-semibold">{error}</span>
        </div>
      )}

      {loading && step === 1 && isEditing ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
          <p className="text-sm text-zinc-400 mt-4 font-semibold">Cargando datos de tu anuncio...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
          
          {/* Formulario (Columna Izquierda) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* PASO 1: DESTINO */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-3">
                    1. Plataforma de destino
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: "instagram", icon: <InstagramIcon className="w-5 h-5" />, label: "Instagram" },
                      { id: "x", icon: <XIcon className="w-5 h-5" />, label: "X / Twitter" },
                      { id: "youtube", icon: <YoutubeIcon className="w-5 h-5" />, label: "YouTube" },
                      { id: "web", icon: <GlobeIcon className="w-5 h-5" />, label: "Web / Link" }
                    ].map((plat) => (
                      <button
                        key={plat.id}
                        type="button"
                        onClick={() => handlePlatformChange(plat.id)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 font-black text-xs transition-all ${getPlatformButtonStyle(plat.id)}`}
                      >
                        {plat.icon}
                        <span>{plat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="targetUrl" className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-2">
                    2. Enlace / URL destino
                  </label>
                  <input
                    type="url"
                    id="targetUrl"
                    placeholder="https://instagram.com/tu_marca"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-zinc-800 bg-zinc-950/80 text-white placeholder-zinc-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-sm font-medium"
                    required
                  />
                  <p className="text-[11px] text-zinc-500 mt-2">
                    Dirección web directa a la que irá el usuario al hacer clic en el botón de tu anuncio.
                  </p>
                </div>
              </div>
            )}

            {/* PASO 2: CONTENIDO */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="title" className="text-xs font-black uppercase tracking-wider text-zinc-300">
                      Título del Anuncio
                    </label>
                    <span className={`text-[11px] font-mono ${title.length > 38 ? 'text-red-400 font-bold' : 'text-zinc-500'}`}>
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
                    className="w-full px-4 py-3.5 rounded-xl border border-zinc-800 bg-zinc-950/80 text-white placeholder-zinc-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-sm font-medium"
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="description" className="text-xs font-black uppercase tracking-wider text-zinc-300">
                      Descripción Corta
                    </label>
                    <span className={`text-[11px] font-mono ${description.length > 110 ? 'text-red-400 font-bold' : 'text-zinc-500'}`}>
                      {description.length}/110
                    </span>
                  </div>
                  <textarea
                    id="description"
                    maxLength={110}
                    rows={3}
                    placeholder="Ej. Las mejores smash de la ciudad. 100% carne fresca y pan de papa horneado a diario."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-zinc-800 bg-zinc-950/80 text-white placeholder-zinc-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-sm font-medium resize-none"
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="ctaText" className="text-xs font-black uppercase tracking-wider text-zinc-300">
                      Texto del Botón (CTA)
                    </label>
                    <span className={`text-[11px] font-mono ${ctaText.length > 20 ? 'text-red-400 font-bold' : 'text-zinc-500'}`}>
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
                    className="w-full px-4 py-3.5 rounded-xl border border-zinc-800 bg-zinc-950/80 text-white placeholder-zinc-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-sm font-medium"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-2">
                    Tu Correo Electrónico
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="socio@marca.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-zinc-800 bg-zinc-950/80 text-white placeholder-zinc-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-sm font-medium"
                    required
                    disabled={isEditing}
                  />
                  <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
                    Te enviaremos el enlace secreto de edición y las alertas inmediatas si alguien supera tu puja.
                  </p>
                </div>
              </div>
            )}

            {/* PASO 3: PUJA Y PAGO */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Caja de Puja Mínima */}
                <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 border border-amber-500/30 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Monto requerido para el Puesto #1</span>
                  </div>
                  <div className="text-2xl font-black text-white">
                    Puja mínima:{" "}
                    <span className="bg-gradient-to-r from-amber-300 to-yellow-200 bg-clip-text text-transparent">
                      {siteConfig.currencySymbol}{minBid.toLocaleString('es-AR')} {siteConfig.currency}
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="bidAmount" className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-2">
                    Monto de tu puja ({siteConfig.currencySymbol})
                  </label>
                  <input
                    type="number"
                    id="bidAmount"
                    min={minBid}
                    step={siteConfig.minBidStep}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl border-2 border-amber-500 bg-zinc-950 text-white focus:ring-4 focus:ring-amber-500/20 outline-none text-2xl font-black"
                    placeholder={minBid.toString()}
                    required
                  />
                </div>

                {/* Selección de Método de Pago */}
                <div className="space-y-3">
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-400">
                    Forma de Pago
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("transfer")}
                      className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3 ${
                        paymentMethod === "transfer"
                          ? "border-amber-500 bg-amber-500/10 text-white shadow-lg shadow-amber-500/10"
                          : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      <Building2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-sm text-white">Transferencia Directa</div>
                        <div className="text-[11px] text-amber-400/80 font-medium">Alias / CBU (0% Comisiones)</div>
                      </div>
                    </button>

                    {process.env.NODE_ENV !== "production" && (
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("demo")}
                        className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3 ${
                          paymentMethod === "demo"
                            ? "border-emerald-500 bg-emerald-500/10 text-white shadow-lg shadow-emerald-500/10"
                            : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        <Play className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-sm text-white">Modo Demo Instantáneo</div>
                          <div className="text-[11px] text-emerald-400/80 font-medium">Prueba rápida sin costo</div>
                        </div>
                      </button>
                    )}
                  </div>
                </div>

                {/* DETALLES DE TRANSFERENCIA BANCARIA */}
                {paymentMethod === "transfer" && (
                  <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                      <span className="text-xs font-black text-zinc-400 uppercase tracking-wider">Datos de Transferencia</span>
                      <span className="text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                        {siteConfig.bankDetails.bank}
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      {/* Alias */}
                      <div className="flex items-center justify-between bg-zinc-900 p-3.5 rounded-xl border border-zinc-800">
                        <div>
                          <span className="text-[10px] text-zinc-500 block font-bold uppercase">ALIAS</span>
                          <span className="font-mono font-black text-sm text-amber-400">
                            {siteConfig.bankDetails.alias}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(siteConfig.bankDetails.alias, "alias")}
                          className="py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-200 transition-colors flex items-center gap-1.5 font-bold text-xs"
                        >
                          {copiedAlias ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedAlias ? "Copiado" : "Copiar"}</span>
                        </button>
                      </div>

                      {/* CBU */}
                      <div className="flex items-center justify-between bg-zinc-900 p-3.5 rounded-xl border border-zinc-800">
                        <div>
                          <span className="text-[10px] text-zinc-500 block font-bold uppercase">CBU</span>
                          <span className="font-mono text-xs text-zinc-300">
                            {siteConfig.bankDetails.cbu}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(siteConfig.bankDetails.cbu, "cbu")}
                          className="py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-200 transition-colors flex items-center gap-1.5 font-bold text-xs"
                        >
                          {copiedCbu ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedCbu ? "Copiado" : "Copiar"}</span>
                        </button>
                      </div>

                      {/* Cuenta */}
                      <div className="text-[11px] text-zinc-400 pt-1">
                        N° de Cuenta: <span className="font-mono font-bold text-zinc-200">{siteConfig.bankDetails.accountNumber}</span>
                      </div>
                    </div>

                    {/* Botón WhatsApp */}
                    <a
                      href={getWhatsappUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      <span>Enviar Comprobante por WhatsApp</span>
                    </a>
                  </div>
                )}

                {/* Botón de Enviar */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 hover:brightness-110 text-zinc-950 rounded-xl font-black text-base transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 disabled:opacity-50 active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : paymentMethod === "demo" ? (
                    <>
                      <Play className="w-5 h-5 fill-current" />
                      <span>Activar en Modo Demo (Instantáneo)</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Confirmar y Ver Mi Anuncio / Kit Viral</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Controles de Navegación del Wizard */}
            {step < 3 && (
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={prevStep}
                  className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:bg-zinc-800 ${
                    step === 1 ? "opacity-0 pointer-events-none" : ""
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-1.5 text-xs font-black px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 hover:brightness-110 shadow-md shadow-amber-500/20"
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
                  className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Editar contenidos del anuncio
                </button>
              </div>
            )}

          </div>

          {/* Vista Previa Interactiva (Columna Derecha) */}
          <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              Vista Previa en Tiempo Real
            </h4>
            <div className="border border-amber-500/20 rounded-3xl p-3 bg-zinc-950/60 backdrop-blur-md shadow-xl">
              <CardItem
                position={1}
                title={title || "Tu Título Aquí"}
                description={description || "Aquí aparecerá la descripción corta de tu marca, negocio o perfil. Cuida los límites de caracteres para captar la atención."}
                ctaText={ctaText || "Ver Perfil"}
                targetUrl={targetUrl || "#"}
                platform={platform}
                currentBid={Number(bidAmount) || minBid}
              />
            </div>
            <p className="text-[11px] text-zinc-500 text-center leading-relaxed px-4">
              Así lucirá exactamente tu tarjeta con el resplandor dorado del Puesto #1 en {siteConfig.name}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

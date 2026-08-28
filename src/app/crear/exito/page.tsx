"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Check, 
  Copy, 
  Download, 
  Code, 
  Share2, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Loader2
} from "lucide-react";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

interface CardDetails {
  id: string;
  title: string;
  description: string;
  ctaText: string;
  targetUrl: string;
  platform: string;
  currentBid: number;
}



export default function ExitoPage() {
  const router = useRouter();
  const query = typeof window === "undefined" ? null : new URLSearchParams(window.location.search);
  const cardId = query?.get("cardId");
  const token = query?.get("token");

  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState<CardDetails | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedWidget, setCopiedWidget] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 1. Cargar datos de la tarjeta recién creada/pujada
  useEffect(() => {
    if (!cardId || !token) {
      router.push("/");
      return;
    }

    async function loadCard() {
      try {
        const res = await fetch(`/api/cards/${cardId}?token=${token}`);
        const data = await res.json();
        if (res.ok) {
          setCard(data);
        } else {
          console.error("Error al cargar tarjeta:", data.error);
        }

      } catch (err) {
        console.error("Error de red:", err);
      } finally {
        setLoading(false);
      }

    }

    loadCard();
  }, [cardId, token, router]);

  // 2. Generar y dibujar la imagen para historias de Instagram en Canvas
  useEffect(() => {
    if (!card) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Dimensiones de Instagram Story (1080x1920)
    canvas.width = 1080;
    canvas.height = 1920;

    // Fondo: Gradiente Premium
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#18181b"); // zinc-900
    gradient.addColorStop(0.5, "#09090b"); // zinc-950
    gradient.addColorStop(1, "#f59e0b"); // amber-500
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Círculos decorativos brillantes de fondo
    ctx.fillStyle = "rgba(245, 158, 11, 0.08)";
    ctx.beginPath();
    ctx.arc(540, 200, 400, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    ctx.beginPath();
    ctx.arc(100, 1000, 300, 0, Math.PI * 2);
    ctx.fill();

    // Textos Principales
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Subtítulo / Logo
    ctx.font = "bold 36px sans-serif";
    ctx.fillStyle = "#f59e0b"; // color amber-500
    ctx.fillText(siteConfig.name.toUpperCase(), 540, 180);

    // Título Principal
    ctx.font = "black 76px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("¡SOMOS EL PUESTO #1!", 540, 300);

    ctx.font = "bold 42px sans-serif";
    ctx.fillStyle = "#e4e4e7"; // zinc-300
    ctx.fillText(`Destacados en ${siteConfig.domain}`, 540, 380);

    // Dibujar tarjeta (Caja contenedora de la previsualización del anuncio)
    const cardX = 90;
    const cardY = 520;
    const cardWidth = 900;
    const cardHeight = 650;
    const cardRadius = 40;

    // Caja de la tarjeta (Fondo Blanco)
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 40;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 20;

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect?.(cardX, cardY, cardWidth, cardHeight, cardRadius);
    ctx.fill();

    // Resetear sombra para los siguientes elementos
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    // Puesto #1 Badge
    ctx.fillStyle = "#fef3c7"; // amber-100
    ctx.beginPath();
    ctx.roundRect?.(cardX + 50, cardY + 50, 280, 70, 35);
    ctx.fill();

    ctx.font = "bold 28px sans-serif";
    ctx.fillStyle = "#92400e"; // amber-800
    ctx.fillText("PUESTO #1", cardX + 190, cardY + 85);

    // Título del anuncio
    ctx.textAlign = "left";
    ctx.font = "bold 56px sans-serif";
    ctx.fillStyle = "#18181b"; // zinc-900
    ctx.fillText(card.title, cardX + 60, cardY + 220);

    // Descripción del anuncio
    ctx.font = "medium 34px sans-serif";
    ctx.fillStyle = "#52525b"; // zinc-600
    
    // Ajustar texto largo en múltiples líneas
    const descWords = card.description.split(" ");
    let line = "";
    let lineY = cardY + 310;
    const maxWidth = cardWidth - 120;
    const lineHeight = 50;

    for (let n = 0; n < descWords.length; n++) {
      const testLine = line + descWords[n] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, cardX + 60, lineY);
        line = descWords[n] + " ";
        lineY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, cardX + 60, lineY);

    // Botón de CTA simulado en la tarjeta
    const btnX = cardX + 60;
    const btnY = cardY + 500;
    const btnWidth = cardWidth - 120;
    const btnHeight = 90;
    const btnRadius = 25;

    ctx.fillStyle = "#18181b";
    ctx.beginPath();
    ctx.roundRect?.(btnX, btnY, btnWidth, btnHeight, btnRadius);
    ctx.fill();

    ctx.textAlign = "center";
    ctx.font = "bold 32px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(card.ctaText, btnX + btnWidth / 2, btnY + btnHeight / 2);

    // Cargar y dibujar el Código QR
    const qrImage = new Image();
    qrImage.crossOrigin = "anonymous";
    // Usamos el API público de qrserver para generar el QR dinámico apuntando al dominio
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${siteConfig.domain}`;
    qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(siteUrl)}`;

    qrImage.onload = () => {
      // Dibujar caja contenedora del QR
      const qrBoxSize = 340;
      const qrBoxX = 540 - qrBoxSize / 2;
      const qrBoxY = 1350;

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect?.(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 35);
      ctx.fill();

      // Dibujar el código QR
      ctx.drawImage(qrImage, qrBoxX + 30, qrBoxY + 30, qrBoxSize - 60, qrBoxSize - 60);

      // Texto de llamado a la acción del QR
      ctx.font = "bold 30px sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("Escanea para ver la grilla en vivo", 540, 1750);
    };
  }, [card]);

  // Copiar token de edición al portapapeles
  const handleCopyToken = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  // Copiar código del Widget Iframe
  const handleCopyWidget = () => {
    if (!cardId) return;
    const widgetCode = `<iframe src="${window.location.origin}/widget?cardId=${cardId}" width="100%" height="180" style="border:none; max-width:400px; border-radius:16px; overflow:hidden;" scrolling="no"></iframe>`;
    navigator.clipboard.writeText(widgetCode);
    setCopiedWidget(true);
    setTimeout(() => setCopiedWidget(false), 2000);
  };

  // Descargar la imagen del Story generada
  const handleDownloadStory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `rankinguponline_puesto_1_${card?.title.toLowerCase().replace(/\s+/g, "_")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
        <p className="mt-4 text-sm text-gray-500 dark:text-zinc-400 font-bold">
          Verificando tu pago en Mercado Pago...
        </p>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="text-red-500 text-5xl mb-4 font-bold">¡Ups!</div>
        <p className="text-gray-600 dark:text-zinc-400 max-w-md mb-6">
          No pudimos verificar la información del anuncio. Esto puede ocurrir si el enlace es inválido o el pago aún está en proceso de acreditación.
        </p>
        <Link href="/" className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold">
          Volver al Inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      
      {/* Sección 1: Éxito y Felicitaciones */}
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 bg-green-100 dark:bg-green-950/30 rounded-full border border-green-200 dark:border-green-800/30 text-green-600 dark:text-green-400 mb-2">
          <Check className="w-8 h-8 stroke-[3]" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
          ¡Tu puja ha sido procesada!
        </h1>
        <p className="text-gray-600 dark:text-zinc-400 text-base max-w-2xl mx-auto">
          Felicitaciones. Tu anuncio <strong>&quot;{card.title}&quot;</strong> se ha actualizado en la grilla principal. Tu puesto depende del monto de tu puja frente a tus competidores.
        </p>
      </div>

      {/* Grid de Secciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Lado Izquierdo: Gestión de Anuncio y Widget */}
        <div className="space-y-6">
          
          {/* Tarjeta del Token de Acceso */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 shadow-md space-y-4">
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 fill-current" />
              Tu Enlace de Acceso Seguro
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
              No necesitas contraseñas. Para editar la información de tu anuncio o realizar una puja mayor para defender tu posición, guarda el siguiente token o utiliza el link que te enviamos a <strong>{card.platform === 'instagram' ? 'tu correo' : card.ctaText}</strong>.
            </p>
            
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={token || ""}
                className="flex-1 bg-gray-50 dark:bg-zinc-850 px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-800 text-xs font-mono text-gray-600 dark:text-zinc-300 outline-none"
              />
              <button
                onClick={handleCopyToken}
                className="p-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center"
                title="Copiar token"
              >
                {copiedToken ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            
            <div className="pt-2">
              <Link
                href={`/crear?cardId=${card.id}&token=${token}`}
                className="inline-flex items-center gap-1 text-sm font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                Probar editor de inmediato
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Tarjeta del Widget Embebible */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 shadow-md space-y-4">
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-500" />
              Widget HTML Embebible
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
              Presume tu posicionamiento insertando este banner dinámico directamente en tu sitio web. Esto aumentará la visibilidad de tu marca y te generará backlinks útiles.
            </p>

            <div className="bg-gray-50 dark:bg-zinc-850 p-3 rounded-xl border border-gray-200 dark:border-zinc-800 relative">
              <pre className="text-[10px] font-mono text-gray-600 dark:text-zinc-300 overflow-x-auto whitespace-pre-wrap">
                {`<iframe src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget?cardId=${card.id}" width="100%" height="180" style="border:none; max-width:400px; border-radius:16px; overflow:hidden;" scrolling="no"></iframe>`}
              </pre>
            </div>

            <button
              onClick={handleCopyWidget}
              className="w-full py-3 bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors font-bold text-sm rounded-xl flex items-center justify-center gap-2"
            >
              {copiedWidget ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Código Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Código Iframe</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Lado Derecho: Generador de Kit para Redes Sociales */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 shadow-md space-y-5 text-center">
          <div className="space-y-1">
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white flex items-center justify-center gap-2">
              <Share2 className="w-5 h-5 text-pink-500" />
              Kit de Compartido Viral
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Imagen lista para descargar en formato <strong>Instagram Story (9:16)</strong> con tu puesto #1 y código QR a la plataforma.
            </p>
          </div>

          {/* Canvas oculto usado para la generación del archivo PNG */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Renderizado de Previsualización de la Imagen */}
          <div className="aspect-[9/16] max-w-[280px] mx-auto rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-lg relative bg-zinc-950 flex flex-col justify-between p-4 text-white">
            {/* Cabecera story mock */}
            <div className="flex justify-between items-center text-[8px] tracking-wider text-amber-500 font-bold uppercase">
              <span>{siteConfig.name}</span>
              <span className="bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">Story Kit</span>
            </div>

            {/* Cuerpo story mock */}
            <div className="my-auto space-y-3">
              <div className="space-y-1">
                <span className="text-[16px] font-black text-white block">¡SOMOS EL #1!</span>
                <span className="text-[8px] text-gray-300 block">Destacados en {siteConfig.domain}</span>
              </div>
              
              {/* Tarjeta miniatura mock */}
              <div className="bg-white text-zinc-900 rounded-xl p-3 text-left space-y-2 shadow-md">
                <span className="text-[7px] font-extrabold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                  PUESTO #1
                </span>
                <h5 className="text-[11px] font-bold line-clamp-1">{card.title}</h5>
                <p className="text-[8px] text-zinc-500 line-clamp-2 leading-tight">
                  {card.description}
                </p>
                <div className="w-full bg-zinc-900 text-white text-[8px] font-bold py-1 rounded text-center">
                  {card.ctaText}
                </div>
              </div>
            </div>

            {/* Pie story mock (QR) */}
            <div className="space-y-2">
              <div className="w-16 h-16 bg-white mx-auto rounded-lg flex items-center justify-center p-1.5">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(process.env.NEXT_PUBLIC_SITE_URL || `https://${siteConfig.domain}`)}`}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[8px] text-gray-400 block font-medium">Escanea para ver la grilla</span>
            </div>
          </div>

          <button
            onClick={handleDownloadStory}
            className="w-full py-3.5 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white font-extrabold text-sm rounded-xl hover:brightness-105 transition-all flex items-center justify-center gap-2 shadow-md shadow-red-500/10"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Story de Instagram</span>
          </button>
        </div>

      </div>

      {/* Volver a la grilla */}
      <div className="text-center pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-base rounded-2xl transition-all shadow-md"
        >
          Volver a la Grilla de Posiciones
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}

"use client";
import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  Loader2,
  CheckCircle2,
  Award
} from "lucide-react";
import { siteConfig } from "@/config/site";

interface CardDetails {
  id: string;
  title: string;
  description: string;
  ctaText: string;
  targetUrl: string;
  platform: string;
  currentBid: number;
}

function ExitoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const cardId = searchParams.get("cardId");
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState<CardDetails | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedWidget, setCopiedWidget] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

  // Generar y dibujar la imagen para historias de Instagram en Canvas
  useEffect(() => {
    if (!card) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1920;

    // Fondo: Gradiente Premium Oscuro con resplandor
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#09090b");
    gradient.addColorStop(0.5, "#18181b");
    gradient.addColorStop(1, "#f59e0b");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar Fuegos Artificiales y Destellos Festivos
    const fireworksCenters = [
      { x: 200, y: 220, color: "#f59e0b", radius: 80 },
      { x: 880, y: 240, color: "#ec4899", radius: 90 },
      { x: 540, y: 140, color: "#fbbf24", radius: 100 },
      { x: 150, y: 420, color: "#8b5cf6", radius: 70 },
      { x: 920, y: 440, color: "#10b981", radius: 75 },
    ];

    fireworksCenters.forEach((fw) => {
      // Rayos de fuegos artificiales
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI * 2) / 12;
        const x2 = fw.x + Math.cos(angle) * fw.radius;
        const y2 = fw.y + Math.sin(angle) * fw.radius;

        ctx.strokeStyle = fw.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(fw.x, fw.y);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Partículas circulares en las puntas
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x2, y2, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.fillStyle = "rgba(245, 158, 11, 0.15)";
    ctx.beginPath();
    ctx.arc(540, 280, 480, 0, Math.PI * 2);
    ctx.fill();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = "bold 38px sans-serif";
    ctx.fillStyle = "#f59e0b";
    ctx.fillText(`✨ ${siteConfig.name.toUpperCase()} ✨`, 540, 180);

    ctx.font = "black 78px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("¡SOMOS EL PUESTO #1!", 540, 300);

    ctx.font = "bold 40px sans-serif";
    ctx.fillStyle = "#fbbf24";
    ctx.fillText(`👑 Destacados en ${siteConfig.domain} 👑`, 540, 380);

    const cardX = 90;
    const cardY = 500;
    const cardWidth = 900;
    const cardHeight = 670;
    const cardRadius = 40;

    ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
    ctx.shadowBlur = 50;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 25;

    ctx.fillStyle = "#18181b";
    ctx.beginPath();
    ctx.roundRect?.(cardX, cardY, cardWidth, cardHeight, cardRadius);
    ctx.fill();

    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#fef3c7";
    ctx.beginPath();
    ctx.roundRect?.(cardX + 50, cardY + 50, 280, 70, 35);
    ctx.fill();

    ctx.font = "bold 30px sans-serif";
    ctx.fillStyle = "#92400e";
    ctx.fillText("PUESTO #1", cardX + 190, cardY + 85);

    ctx.textAlign = "left";
    ctx.font = "bold 56px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(card.title, cardX + 60, cardY + 220);

    ctx.font = "medium 34px sans-serif";
    ctx.fillStyle = "#a1a1aa";
    
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

    const btnX = cardX + 60;
    const btnY = cardY + 520;
    const btnWidth = cardWidth - 120;
    const btnHeight = 90;
    const btnRadius = 25;

    const btnGrad = ctx.createLinearGradient(btnX, 0, btnX + btnWidth, 0);
    btnGrad.addColorStop(0, "#f59e0b");
    btnGrad.addColorStop(1, "#ea580c");
    ctx.fillStyle = btnGrad;
    ctx.beginPath();
    ctx.roundRect?.(btnX, btnY, btnWidth, btnHeight, btnRadius);
    ctx.fill();

    ctx.textAlign = "center";
    ctx.font = "bold 36px sans-serif";
    ctx.fillStyle = "#09090b";
    ctx.fillText(card.ctaText, btnX + btnWidth / 2, btnY + btnHeight / 2);

    const qrImage = new Image();
    qrImage.crossOrigin = "anonymous";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${siteConfig.domain}`;
    qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(siteUrl)}`;

    qrImage.onload = () => {
      const qrBoxSize = 340;
      const qrBoxX = 540 - qrBoxSize / 2;
      const qrBoxY = 1350;

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect?.(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 35);
      ctx.fill();

      ctx.drawImage(qrImage, qrBoxX + 30, qrBoxY + 30, qrBoxSize - 60, qrBoxSize - 60);

      ctx.font = "bold 32px sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("Escanea para ver la grilla en vivo", 540, 1750);
    };
  }, [card]);

  const handleCopyToken = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleCopyWidget = () => {
    if (!cardId) return;
    const widgetCode = `<iframe src="${window.location.origin}/widget?cardId=${cardId}" width="100%" height="180" style="border:none; max-width:400px; border-radius:16px; overflow:hidden;" scrolling="no"></iframe>`;
    navigator.clipboard.writeText(widgetCode);
    setCopiedWidget(true);
    setTimeout(() => setCopiedWidget(false), 2000);
  };

  const handleDownloadStory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `rankeandoup_puesto_1_${card?.title.toLowerCase().replace(/\s+/g, "_")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
        <p className="mt-4 text-sm text-zinc-400 font-bold">
          Verificando información del anuncio...
        </p>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <div className="text-red-400 text-5xl mb-4 font-bold">¡Ups!</div>
        <p className="text-zinc-400 max-w-md mb-6">
          No pudimos verificar la información del anuncio. Esto puede ocurrir si el enlace es inválido o la solicitud expiró.
        </p>
        <Link href="/" className="px-6 py-3 bg-zinc-900 border border-zinc-800 text-white rounded-xl font-bold">
          Volver al Inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      
      {/* Sección 1: Éxito y Felicitaciones */}
      <div className="text-center space-y-3">
        <div className="inline-flex p-3.5 bg-emerald-500/10 rounded-full border border-emerald-500/30 text-emerald-400 mb-2 shadow-lg shadow-emerald-500/10">
          <Check className="w-8 h-8 stroke-[3]" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          ¡Tu anuncio ha sido registrado!
        </h1>
        <p className="text-zinc-400 text-base max-w-2xl mx-auto leading-relaxed">
          Felicitaciones por publicar <strong>&quot;{card.title}&quot;</strong>. Si transferiste por Alias/CBU, tu anuncio tomará su puesto tan pronto confirmemos la transferencia.
        </p>
      </div>

      {/* Grid de Secciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Lado Izquierdo: Gestión de Anuncio y Widget */}
        <div className="space-y-6">
          
          {/* Tarjeta del Token de Acceso */}
          <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400 fill-current" />
              Tu Enlace de Acceso Secreto
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              No requieres contraseñas. Para editar la información de tu anuncio o realizar una puja mayor cuando seas superado, guarda este token:
            </p>
            
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={token || ""}
                className="flex-1 bg-zinc-950 px-4 py-3 rounded-xl border border-zinc-800 text-xs font-mono text-amber-300 outline-none select-all"
              />
              <button
                onClick={handleCopyToken}
                className="p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors flex items-center justify-center border border-zinc-700"
                title="Copiar token"
              >
                {copiedToken ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            
            <div className="pt-2">
              <Link
                href={`/crear?cardId=${card.id}&token=${token}`}
                className="inline-flex items-center gap-1 text-sm font-bold text-amber-400 hover:underline"
              >
                <span>Probar editor de inmediato</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Tarjeta del Widget Embebible */}
          <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-cyan-400" />
              Widget HTML Embebible
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Presume tu posición insertando este badge dinámico en tu sitio web para captar confianza y backlinks hacia tu marca.
            </p>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 relative">
              <pre className="text-[10px] font-mono text-zinc-400 overflow-x-auto whitespace-pre-wrap">
                {`<iframe src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget?cardId=${card.id}" width="100%" height="180" style="border:none; max-width:400px; border-radius:16px; overflow:hidden;" scrolling="no"></iframe>`}
              </pre>
            </div>

            <button
              onClick={handleCopyWidget}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-zinc-700"
            >
              {copiedWidget ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
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
        <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-5 text-center">
          <div className="space-y-1">
            <h3 className="font-extrabold text-lg text-white flex items-center justify-center gap-2">
              <Share2 className="w-5 h-5 text-pink-400" />
              Kit de Redes Sociales (Story 9:16)
            </h3>
            <p className="text-xs text-zinc-400">
              Imagen descargable en formato <strong>Instagram Story</strong> con tu Puesto #1 y código QR a la plataforma.
            </p>
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* Renderizado de Previsualización */}
          <div className="aspect-[9/16] max-w-[260px] mx-auto rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-2xl relative bg-zinc-950 flex flex-col justify-between p-4 text-white">
            <div className="flex justify-between items-center text-[8px] tracking-wider text-amber-400 font-black uppercase">
              <span>{siteConfig.name}</span>
              <span className="bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">Story Kit</span>
            </div>

            <div className="my-auto space-y-3">
              <div className="space-y-0.5">
                <span className="text-[15px] font-black text-white block">¡SOMOS EL #1!</span>
                <span className="text-[8px] text-zinc-400 block">{siteConfig.domain}</span>
              </div>
              
              <div className="bg-zinc-900 border border-amber-500/30 rounded-xl p-3 text-left space-y-2 shadow-lg">
                <span className="text-[7px] font-black bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded-full uppercase">
                  PUESTO #1
                </span>
                <h5 className="text-[11px] font-black text-white line-clamp-1">{card.title}</h5>
                <p className="text-[8px] text-zinc-400 line-clamp-2 leading-tight">
                  {card.description}
                </p>
                <div className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 text-[8px] font-black py-1.5 rounded-lg text-center">
                  {card.ctaText}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="w-16 h-16 bg-white mx-auto rounded-lg flex items-center justify-center p-1">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(process.env.NEXT_PUBLIC_SITE_URL || `https://${siteConfig.domain}`)}`}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[7px] text-zinc-400 block font-medium">Escanea para ver la grilla</span>
            </div>
          </div>

          <button
            onClick={handleDownloadStory}
            className="w-full py-3.5 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-black text-sm rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Story de Instagram</span>
          </button>
        </div>

      </div>

      {/* Volver a la grilla */}
      <div className="text-center pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 text-white font-black text-sm rounded-2xl transition-all shadow-xl hover:scale-105"
        >
          <span>Volver a la Grilla de Posiciones</span>
          <ExternalLink className="w-4 h-4 text-amber-400" />
        </Link>
      </div>

    </div>
  );
}

export default function ExitoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
          <p className="text-xs text-zinc-400 mt-3 font-semibold">Cargando...</p>
        </div>
      }
    >
      <ExitoContent />
    </Suspense>
  );
}

"use client";
import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function FireworksTrigger() {
  useEffect(() => {
    // Lanzar ráfaga inicial de fuegos artificiales dorados y festivos
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    // Colores festivos: Oro, Naranja, Ámbar, Violeta, Esmeralda
    const colors = ["#f59e0b", "#fbbf24", "#ea580c", "#8b5cf6", "#10b981", "#ffffff"];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    // Disparo central estrellado hacia el puesto #1
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 100,
        origin: { y: 0.4 },
        colors: ["#f59e0b", "#fbbf24", "#ffffff"],
        shapes: ["star"],
      });
    }, 400);
  }, []);

  return null;
}

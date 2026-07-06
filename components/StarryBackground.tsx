"use client";

import { useEffect, useRef, useState } from "react";

type Star = { id: number; top: number; left: number; size: number; delay: number; duration: number };

type Comet = {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number;
};

export default function StarryBackground({ showBackdrop = true }: { showBackdrop?: boolean }) {
  const [stars, setStars] = useState<Star[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setStars(Array.from({ length: 90 }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 4,
      duration: Math.random() * 3 + 2,
    })));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const c2d: CanvasRenderingContext2D = ctx;
    const cvs: HTMLCanvasElement = canvas;

    let width = 0;
    let height = 0;

    function resize() {
      const parent = cvs.parentElement;
      width = parent?.clientWidth || cvs.offsetWidth || window.innerWidth;
      height = parent?.clientHeight || cvs.offsetHeight || window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      cvs.width = width * dpr;
      cvs.height = height * dpr;
      cvs.style.width = `${width}px`;
      cvs.style.height = `${height}px`;
      c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    const parent = cvs.parentElement;
    const resizeObserver = parent ? new ResizeObserver(resize) : null;
    if (parent && resizeObserver) resizeObserver.observe(parent);
    window.addEventListener("resize", resize);

    let comets: Comet[] = [];
    let rafId: number;
    let spawnTimeout: ReturnType<typeof setTimeout>;

    function spawnComet() {
      const startFromLeft = Math.random() > 0.5;
      const angle = (20 + Math.random() * 30) * (Math.PI / 180);
      const speed = 6 + Math.random() * 5;
      comets.push({
        x: startFromLeft ? Math.random() * width * 0.4 : Math.random() * width,
        y: -20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 40 + Math.random() * 20,
      });
      spawnTimeout = setTimeout(spawnComet, 900 + Math.random() * 2200);
    }
    spawnTimeout = setTimeout(spawnComet, 500);

    function draw() {
      c2d.globalCompositeOperation = "destination-out";
      c2d.fillStyle = "rgba(0,0,0,0.12)";
      c2d.fillRect(0, 0, width, height);
      c2d.globalCompositeOperation = "source-over";

      comets = comets.filter(c => c.life < c.maxLife && c.y < height + 50 && c.x < width + 50);

      for (const c of comets) {
        c.x += c.vx;
        c.y += c.vy;
        c.life += 1;

        const fadeIn = Math.min(c.life / 6, 1);
        const fadeOut = Math.max(0, 1 - Math.max(0, c.life - (c.maxLife - 10)) / 10);
        const opacity = fadeIn * fadeOut;

        const gradient = c2d.createRadialGradient(c.x, c.y, 0, c.x, c.y, 6);
        gradient.addColorStop(0, `rgba(255,255,255,${opacity})`);
        gradient.addColorStop(0.4, `rgba(200,150,240,${opacity * 0.6})`);
        gradient.addColorStop(1, "rgba(155,79,221,0)");

        c2d.beginPath();
        c2d.fillStyle = gradient;
        c2d.arc(c.x, c.y, 6, 0, Math.PI * 2);
        c2d.fill();
      }

      rafId = requestAnimationFrame(draw);
    }
    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(spawnTimeout);
      window.removeEventListener("resize", resize);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  return (
    <>
      {showBackdrop && (
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `
            radial-gradient(circle at 20% 15%, rgba(107,31,173,0.25), transparent 40%),
            radial-gradient(circle at 80% 10%, rgba(155,79,221,0.18), transparent 35%),
            radial-gradient(circle at 50% 100%, rgba(107,31,173,0.22), transparent 50%),
            linear-gradient(180deg, #05050a 0%, #0b0614 60%, #0d0714 100%)
          `,
        }} />
      )}

      {stars.map(s => (
        <div key={s.id} style={{
          position: "absolute", top: `${s.top}%`, left: `${s.left}%`,
          width: s.size, height: s.size, borderRadius: "50%",
          background: "#fff", pointerEvents: "none",
          animation: `staro-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
        }} />
      ))}

      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />

      <style>{`
        @keyframes staro-twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
      `}</style>
    </>
  );
}

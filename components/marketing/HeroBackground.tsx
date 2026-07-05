"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

const BG_DEEP = "#05010f";
const VIOLET = "#6d28d9";
const BLUE = "#1e3a8a";

type Star = {
  x: number;
  y: number;
  radius: number;
  baseOpacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
};

type ShootingStar = {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  active: boolean;
  delay: number;
};

const STAR_COUNT = 220;
const SHOOTING_STAR_COUNT = 4;

function createStars(width: number, height: number): Star[] {
  return Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.2 + 0.2,
    baseOpacity: Math.random() * 0.6 + 0.2,
    twinkleSpeed: Math.random() * 0.02 + 0.005,
    twinklePhase: Math.random() * Math.PI * 2,
  }));
}

function createShootingStar(width: number, height: number, delay: number): ShootingStar {
  return {
    x: Math.random() * width,
    y: Math.random() * height * 0.4,
    length: Math.random() * 120 + 80,
    speed: Math.random() * 8 + 6,
    angle: (Math.PI / 4) * (Math.random() * 0.3 + 0.85),
    opacity: 0,
    active: false,
    delay,
  };
}

function StarsCanvas({ reduced }: { reduced: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let shootingStars: ShootingStar[] = [];
    let frame = 0;
    let animationId: number;

    const resize = () => {
      const parent = canvas.parentElement;
      width = parent?.clientWidth ?? window.innerWidth;
      height = parent?.clientHeight ?? window.innerHeight;
      canvas.width = width * devicePixelRatio;
      canvas.height = height * devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      stars = createStars(width, height);
      shootingStars = Array.from({ length: SHOOTING_STAR_COUNT }, (_, i) =>
        createShootingStar(width, height, i * 140 + Math.random() * 200)
      );
    };

    resize();
    window.addEventListener("resize", resize);

    if (reduced) {
      ctx.clearRect(0, 0, width, height);
      for (const s of stars) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.baseOpacity})`;
        ctx.fill();
      }
      return () => window.removeEventListener("resize", resize);
    }

    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      for (const s of stars) {
        const twinkle = Math.sin(frame * s.twinkleSpeed + s.twinklePhase) * 0.35 + 0.65;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.baseOpacity * twinkle})`;
        ctx.fill();
      }

      for (const star of shootingStars) {
        if (frame < star.delay) continue;

        if (!star.active) {
          star.active = true;
          star.x = Math.random() * width;
          star.y = Math.random() * height * 0.35;
          star.opacity = 1;
        }

        const dx = Math.cos(star.angle) * star.speed;
        const dy = Math.sin(star.angle) * star.speed;
        star.x += dx;
        star.y += dy;
        star.opacity -= 0.012;

        if (star.opacity > 0) {
          const tailX = star.x - Math.cos(star.angle) * star.length;
          const tailY = star.y - Math.sin(star.angle) * star.length;
          const grad = ctx.createLinearGradient(star.x, star.y, tailX, tailY);
          grad.addColorStop(0, `rgba(255,255,255,${star.opacity})`);
          grad.addColorStop(0.4, `rgba(199,178,255,${star.opacity * 0.5})`);
          grad.addColorStop(1, "rgba(199,178,255,0)");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();
        } else {
          star.active = false;
          star.delay = frame + Math.random() * 400 + 200;
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}

function Nebula({ reduced }: { reduced: boolean }) {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div
        className={reduced ? undefined : "staro-nebula-blob staro-nebula-1"}
        style={{
          position: "absolute",
          top: "-20%",
          left: "-10%",
          width: 640,
          height: 640,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${VIOLET}66, transparent 70%)`,
          filter: "blur(90px)",
        }}
      />
      <div
        className={reduced ? undefined : "staro-nebula-blob staro-nebula-2"}
        style={{
          position: "absolute",
          top: "20%",
          right: "-15%",
          width: 560,
          height: 560,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${BLUE}55, transparent 70%)`,
          filter: "blur(100px)",
        }}
      />
      <div
        className={reduced ? undefined : "staro-nebula-blob staro-nebula-3"}
        style={{
          position: "absolute",
          bottom: "-25%",
          left: "30%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${VIOLET}44, transparent 70%)`,
          filter: "blur(80px)",
        }}
      />
    </div>
  );
}

export default function HeroBackground() {
  const reduced = !!useReducedMotion();

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        background: BG_DEEP,
        zIndex: 0,
      }}
    >
      <Nebula reduced={reduced} />
      <StarsCanvas reduced={reduced} />

      <style>{`
        .staro-nebula-blob {
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }
        .staro-nebula-1 { animation-name: staro-nebula-drift-1; animation-duration: 14s; }
        .staro-nebula-2 { animation-name: staro-nebula-drift-2; animation-duration: 18s; }
        .staro-nebula-3 { animation-name: staro-nebula-drift-3; animation-duration: 16s; }

        @keyframes staro-nebula-drift-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, 30px) scale(1.1); }
        }
        @keyframes staro-nebula-drift-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 40px) scale(1.08); }
        }
        @keyframes staro-nebula-drift-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -30px) scale(1.05); }
        }
      `}</style>
    </div>
  );
}

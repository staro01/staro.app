"use client";

import { useEffect, useState } from "react";

type Star = { id: number; top: number; left: number; size: number; delay: number; duration: number };
type ShootingStar = { id: number; top: number; left: number; angle: number; length: number; duration: number };

export default function StarryBackground() {
  const [stars, setStars] = useState<Star[]>([]);
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);

  // Étoiles fixes scintillantes, générées une fois côté client (évite les erreurs d'hydratation SSR)
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

  // Étoiles filantes générées dynamiquement, une par une, à des positions/moments aléatoires sur tout l'écran
  useEffect(() => {
    let nextId = 0;

    function spawnShootingStar() {
      const id = nextId++;
      const angle = 20 + Math.random() * 40; // toujours en diagonale descendante, angle variable
      const duration = 1.2 + Math.random() * 1;
      const star: ShootingStar = {
        id,
        top: Math.random() * 85,
        left: Math.random() * 95,
        angle,
        length: 60 + Math.random() * 60,
        duration,
      };
      setShootingStars(prev => [...prev, star]);
      setTimeout(() => {
        setShootingStars(prev => prev.filter(s => s.id !== id));
      }, duration * 1000 + 100);
    }

    function scheduleNext() {
      const wait = 800 + Math.random() * 2500;
      const timeout = setTimeout(() => {
        spawnShootingStar();
        scheduleNext();
      }, wait);
      return timeout;
    }

    const timeout = scheduleNext();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `
          radial-gradient(circle at 20% 15%, rgba(107,31,173,0.25), transparent 40%),
          radial-gradient(circle at 80% 10%, rgba(155,79,221,0.18), transparent 35%),
          radial-gradient(circle at 50% 100%, rgba(107,31,173,0.22), transparent 50%),
          linear-gradient(180deg, #05050a 0%, #0b0614 60%, #0d0714 100%)
        `,
      }} />

      {stars.map(s => (
        <div key={s.id} style={{
          position: "absolute", top: `${s.top}%`, left: `${s.left}%`,
          width: s.size, height: s.size, borderRadius: "50%",
          background: "#fff", pointerEvents: "none",
          animation: `staro-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
        }} />
      ))}

      {shootingStars.map(s => {
        const rad = (s.angle * Math.PI) / 180;
        const dx = Math.cos(rad) * 400;
        const dy = Math.sin(rad) * 400;
        return (
          <div key={s.id} style={{
            position: "absolute", top: `${s.top}%`, left: `${s.left}%`,
            width: 1, height: 1, pointerEvents: "none",
            animation: `staro-fly-${s.id} ${s.duration}s ease-in forwards`,
          }}>
            <div style={{
              width: s.length, height: 2, borderRadius: 2,
              background: "linear-gradient(90deg, transparent, rgba(155,79,221,0.6), #fff)",
              transform: `rotate(${s.angle}deg)`,
              transformOrigin: "left center",
              boxShadow: "0 0 6px 1px rgba(255,255,255,0.7)",
            }} />
            <style>{`
              @keyframes staro-fly-${s.id} {
                0% { transform: translate(0, 0); opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { transform: translate(${dx}px, ${dy}px); opacity: 0; }
              }
            `}</style>
          </div>
        );
      })}

      <style>{`
        @keyframes staro-twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
      `}</style>
    </>
  );
}

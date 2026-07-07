"use client";

import { useRef, useState } from "react";
import FloatingHeader from "../../components/FloatingHeader";
import Footer from "../../components/marketing/Footer";
import DemoAvatar from "../../components/marketing/DemoAvatar";
import { DEMO_PERSONAS } from "../../components/marketing/demoPersonas";
import { colors } from "../../components/marketing/theme";

export default function DemoPage() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleClick = (id: string, src: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playingId === id) {
      audio.pause();
      setPlayingId(null);
      return;
    }

    audio.src = src;
    audio.play().catch(() => {});
    setPlayingId(id);
  };

  return (
    <div style={{ background: colors.bgDeep, minHeight: "100vh" }}>
      <FloatingHeader />
      <audio ref={audioRef} onEnded={() => setPlayingId(null)} onPause={() => setPlayingId(null)} />

      <section style={{ padding: "150px 20px 40px", textAlign: "center" }}>
        <h1 style={{ color: "#fff", fontSize: 38, fontWeight: 900, maxWidth: 720, margin: "0 auto 16px" }}>
          Choisissez votre style pour votre commerce
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: 560, margin: "0 auto", fontSize: 16 }}>
          Cliquez sur un profil pour écouter comment votre assistant vocal pourrait accueillir vos clients.
        </p>
      </section>

      <section
        style={{
          maxWidth: 980,
          margin: "0 auto",
          padding: "20px 20px 100px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 24,
        }}
      >
        {DEMO_PERSONAS.map((persona) => (
          <DemoAvatar
            key={persona.id}
            persona={persona}
            isPlaying={playingId === persona.id}
            onClick={() => handleClick(persona.id, persona.audioSrc)}
          />
        ))}
      </section>

      <Footer />
    </div>
  );
}

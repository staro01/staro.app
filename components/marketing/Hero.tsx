"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";
import { colors, container, btnPrimary, btnSecondary, gradient } from "./theme";
import { PhoneIcon, CheckBadgeIcon } from "./icons";
import HeroBackground from "./HeroBackground";
import HeroOverlay from "./HeroOverlay";

const TITLE = "Ne ratez plus aucun appel.";
const TITLE_WORDS = TITLE.split(" ");

const STATIC_DOTS = Array.from({ length: 26 }, (_, i) => ({
  top: (i * 37) % 100,
  left: (i * 53 + 7) % 100,
  size: (i % 3) + 1,
  opacity: 0.15 + ((i * 13) % 40) / 100,
}));

const AURORA_BLOBS = [
  { color: "rgba(107,31,173,0.55)", size: 620, top: "-14%", left: "-8%", duration: 9 },
  { color: "rgba(26,10,46,0.85)", size: 700, top: "35%", left: "55%", duration: 11 },
  { color: "rgba(107,31,173,0.3)", size: 520, top: "62%", left: "5%", duration: 10 },
];

const TRANSCRIPT: { speaker: "agent" | "client"; text: string }[] = [
  { speaker: "agent", text: "Bonjour, que puis-je faire pour vous ?" },
  { speaker: "client", text: "Je voudrais passer une commande / prendre un rendez-vous." },
  { speaker: "agent", text: "Bien noté, je m'en occupe." },
];

type Phase = "ringing" | "connected" | "typing" | "saved" | "fading";

function AuroraBackground({ reduced }: { reduced: boolean }) {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {AURORA_BLOBS.map((b, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            top: b.top,
            left: b.left,
            width: b.size,
            height: b.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${b.color}, transparent 70%)`,
            filter: "blur(80px)",
          }}
          animate={reduced ? undefined : { x: [0, 30, -20, 0], y: [0, -20, 20, 0] }}
          transition={reduced ? undefined : { duration: b.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      {STATIC_DOTS.map((d, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: `${d.top}%`,
            left: `${d.left}%`,
            width: d.size,
            height: d.size,
            borderRadius: "50%",
            background: "#fff",
            opacity: d.opacity,
          }}
        />
      ))}
    </div>
  );
}

function CallSimulationCard({ reduced }: { reduced: boolean }) {
  const [phase, setPhase] = useState<Phase>("ringing");
  const [lines, setLines] = useState<string[]>([]);
  const rotateX = useSpring(0, { stiffness: 150, damping: 20, mass: 0.5 });
  const rotateY = useSpring(-3, { stiffness: 150, damping: 20, mass: 0.5 });
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 861px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reduced) {
      setPhase("saved");
      setLines(TRANSCRIPT.map(l => l.text));
      return;
    }

    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) =>
      new Promise<void>(resolve => {
        timeouts.push(setTimeout(resolve, ms));
      });

    async function typeLine(lineIndex: number, text: string) {
      for (let i = 1; i <= text.length; i++) {
        if (cancelled) return;
        setLines(prev => {
          const next = [...prev];
          next[lineIndex] = text.slice(0, i);
          return next;
        });
        await wait(60);
      }
    }

    async function runCycle() {
      while (!cancelled) {
        setPhase("ringing");
        setLines([]);
        await wait(1000);
        if (cancelled) return;

        setPhase("connected");
        await wait(600);
        if (cancelled) return;

        setPhase("typing");
        for (let i = 0; i < TRANSCRIPT.length; i++) {
          if (cancelled) return;
          setLines(prev => [...prev, ""]);
          await typeLine(i, TRANSCRIPT[i].text);
          if (cancelled) return;
          await wait(500);
        }
        if (cancelled) return;

        setPhase("saved");
        await wait(1800);
        if (cancelled) return;

        setPhase("fading");
        await wait(500);
      }
    }

    runCycle();
    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, [reduced]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduced || !isDesktop) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(-3 + px * 4);
    rotateX.set(-py * 5);
  }

  function handleMouseLeave() {
    rotateY.set(isDesktop ? -3 : 0);
    rotateX.set(0);
  }

  const isConnected = phase !== "ringing";
  const showSaved = phase === "saved" || phase === "fading";

  return (
    <div style={{ perspective: isDesktop ? 1000 : undefined, width: "100%", maxWidth: 400 }}>
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: 16,
          padding: 24,
          minHeight: 280,
          boxShadow: "0 25px 70px rgba(0,0,0,0.45), 0 0 50px rgba(107,31,173,0.15)",
        }}
      >
        <motion.div animate={{ opacity: phase === "fading" ? 0 : 1 }} transition={{ duration: 0.5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <motion.div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: gradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
              animate={!reduced && phase === "ringing" ? { scale: [1, 1.12, 1] } : { scale: 1 }}
              transition={
                !reduced && phase === "ringing"
                  ? { duration: 1, repeat: Infinity, ease: "easeInOut" }
                  : undefined
              }
            >
              <PhoneIcon size={18} color="#fff" />
            </motion.div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: isConnected ? "#4ade80" : colors.textSecondary }}>
                {isConnected ? "Agent connecté" : "Appel entrant..."}
              </div>
              <div style={{ fontSize: 12, color: colors.textMuted }}>06 •• •• •• ••</div>
            </div>
            <span
              style={{
                marginLeft: "auto",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: isConnected ? "#4ade80" : colors.purple2,
                boxShadow: `0 0 8px ${isConnected ? "#4ade80" : colors.purple2}`,
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 90 }}>
            {lines.map((text, i) => (
              <div key={i} style={{ display: "flex", gap: 8 }}>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    color: TRANSCRIPT[i].speaker === "agent" ? colors.purple2 : colors.textMuted,
                    minWidth: 44,
                    flexShrink: 0,
                    paddingTop: 1,
                  }}
                >
                  {TRANSCRIPT[i].speaker === "agent" ? "AGENT" : "CLIENT"}
                </span>
                <span style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 1.5 }}>{text}</span>
              </div>
            ))}
          </div>

          <AnimatePresence>
            {showSaved && (
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  marginTop: 16,
                  background: "rgba(107,31,173,0.1)",
                  border: `1px solid ${colors.border}`,
                  borderRadius: 12,
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <CheckBadgeIcon size={16} color="#fff" />
                </div>
                <div>
                  <div style={{ color: colors.text, fontWeight: 800, fontSize: 13 }}>Demande enregistrée</div>
                  <div style={{ color: "#4ade80", fontSize: 12, fontWeight: 700 }}>Transmis au commerce</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const reduced = !!prefersReducedMotion;

  const spotlightX = useMotionValue(0);
  const spotlightY = useMotionValue(0);
  const spotlightBg = useMotionTemplate`radial-gradient(650px circle at ${spotlightX}px ${spotlightY}px, rgba(155,79,221,0.1), transparent 70%)`;
  const sectionRef = useRef<HTMLElement>(null);

  function handleSectionMouseMove(e: React.MouseEvent<HTMLElement>) {
    if (reduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    spotlightX.set(e.clientX - rect.left);
    spotlightY.set(e.clientY - rect.top);
  }

  const wordDelay = 0.1;
  const ctaDelay = TITLE_WORDS.length * wordDelay + 0.35;

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleSectionMouseMove}
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "88vh",
        display: "flex",
        alignItems: "center",
        background: colors.bgDeep,
      }}
    >
      <HeroBackground />

      {!reduced && (
        <motion.div aria-hidden style={{ position: "absolute", inset: 0, background: spotlightBg, pointerEvents: "none" }} />
      )}

      <div
        style={{
          ...container,
          position: "relative",
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr",
          gap: 48,
          alignItems: "center",
          padding: "90px 20px",
        }}
        className="staro-hero-grid"
      >
        <div>
          {reduced ? (
            <h1
              style={{
                fontSize: "clamp(36px, 6vw, 60px)",
                fontWeight: 900,
                color: colors.text,
                margin: "0 0 20px",
                lineHeight: 1.1,
              }}
            >
              {TITLE}
            </h1>
          ) : (
            <motion.h1
              style={{
                fontSize: "clamp(36px, 6vw, 60px)",
                fontWeight: 900,
                color: colors.text,
                margin: "0 0 20px",
                lineHeight: 1.1,
              }}
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: wordDelay } } }}
            >
              {TITLE_WORDS.map((word, i) => (
                <motion.span
                  key={i}
                  style={{ display: "inline-block", marginRight: "0.28em" }}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.h1>
          )}

          <motion.p
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: reduced ? 0 : ctaDelay - 0.15 }}
            className="staro-hero-subtitle"
            style={{
              fontSize: "clamp(16px, 2vw, 19px)",
              color: colors.textSecondary,
              margin: "0 0 28px",
              maxWidth: 520,
              lineHeight: 1.6,
            }}
          >
            Staro répond pour votre entreprise 24/7 — un agent vocal IA qui prend les appels, note les demandes et
            suit tout, pendant que vous vous concentrez sur votre métier.
          </motion.p>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: reduced ? 0 : ctaDelay }}
            className="staro-hero-cta"
            style={{ display: "flex", gap: 16, flexWrap: "wrap" }}
          >
            <Link href="/contact" style={btnPrimary}>
              Nous contacter
            </Link>
            <Link href="#services" style={btnSecondary}>
              Nos services
            </Link>
          </motion.div>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }} className="staro-hero-card-col">
          <CallSimulationCard reduced={reduced} />
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .staro-hero-grid { grid-template-columns: 1fr !important; text-align: center; }
          .staro-hero-card-col { margin-top: 8px; }
          .staro-hero-subtitle { margin-left: auto !important; margin-right: auto !important; }
          .staro-hero-cta { justify-content: center; }
        }
      `}</style>
      <HeroOverlay />
    </section>
  );
}

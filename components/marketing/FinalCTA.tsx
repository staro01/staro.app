import Link from "next/link";
import StarryBackground from "../StarryBackground";
import { container, gradient, colors } from "./theme";

export default function FinalCTA({
  title = "Prêt à ne plus jamais rater un appel ?",
  description = "Parlons de votre commerce — nous vous montrons comment Staro peut répondre à votre place, dès aujourd'hui.",
  ctaLabel = "Réserver un appel gratuit",
  ctaHref = "/reserver-un-appel",
  fadeTop = false,
}: {
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  fadeTop?: boolean;
}) {
  return (
    <section style={{ padding: "20px", position: "relative" }}>
      {fadeTop && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 140,
            background: `linear-gradient(to bottom, ${colors.bgDeep} 0%, transparent 100%)`,
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      )}
      <div
        style={{
          ...container,
          position: "relative",
          overflow: "hidden",
          background: gradient,
          borderRadius: 28,
          padding: "88px 32px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          boxShadow: "0 30px 90px rgba(107,31,173,0.4), 0 10px 30px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ position: "absolute", inset: 0 }}>
          <StarryBackground showBackdrop={false} />
        </div>
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 50% 120%, rgba(0,0,0,0.35), transparent 60%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.75)", letterSpacing: 1.5 }}>
            STARO.APP
          </span>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, color: "#fff", margin: 0, maxWidth: 640, lineHeight: 1.2 }}>
            {title}
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.85)", margin: 0, maxWidth: 460, lineHeight: 1.6 }}>
            {description}
          </p>
          <div style={{ position: "relative", marginTop: 8 }}>
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: -20,
                background: "radial-gradient(circle, rgba(255,255,255,0.35), transparent 70%)",
                filter: "blur(20px)",
                pointerEvents: "none",
              }}
            />
            <Link
              href={ctaHref}
              style={{
                position: "relative",
                display: "inline-flex",
                background: "#fff",
                color: colors.purple1,
                fontWeight: 900,
                fontSize: 15,
                padding: "17px 36px",
                borderRadius: 14,
                textDecoration: "none",
                boxShadow: "0 15px 40px rgba(0,0,0,0.3)",
              }}
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

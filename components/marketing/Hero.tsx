import Link from "next/link";
import StarryBackground from "../StarryBackground";
import { colors, container, btnPrimary, btnSecondary } from "./theme";

export default function Hero() {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "88vh",
        display: "flex",
        alignItems: "center",
        background: colors.bgDeep,
      }}
    >
      <StarryBackground />

      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 560,
          height: 560,
          borderRadius: "50%",
          border: `70px solid rgba(155,79,221,0.14)`,
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          ...container,
          position: "relative",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          padding: "100px 20px",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(36px, 6vw, 64px)",
            fontWeight: 900,
            color: colors.text,
            margin: 0,
            lineHeight: 1.1,
            maxWidth: 780,
          }}
        >
          Ne ratez plus aucun appel.
        </h1>
        <p
          style={{
            fontSize: "clamp(16px, 2vw, 20px)",
            color: colors.textSecondary,
            margin: 0,
            maxWidth: 620,
            lineHeight: 1.6,
          }}
        >
          Staro répond pour votre entreprise 24/7 — un agent vocal IA qui prend les appels, note les demandes et suit tout, pendant que vous vous concentrez sur votre métier.
        </p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
          <Link href="/contact" style={btnPrimary}>
            Nous contacter
          </Link>
          <Link href="#services" style={btnSecondary}>
            Nos services
          </Link>
        </div>
      </div>
    </section>
  );
}

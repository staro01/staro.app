import Link from "next/link";
import { colors, btnPrimary } from "../components/marketing/theme";
import StarryBackground from "../components/StarryBackground";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      background: colors.bgDeep, gap: 20, position: "relative", overflow: "hidden", padding: 20, textAlign: "center",
    }}>
      <StarryBackground />
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <img src="/logo-badge.png" alt="Staro.app" width={40} height={40} style={{ borderRadius: 10 }} />
        <span style={{ fontSize: 22, fontWeight: 900, color: colors.text }}>Staro.app</span>
      </div>
      <h1 style={{ position: "relative", fontSize: "clamp(32px, 6vw, 48px)", fontWeight: 900, color: colors.text, margin: 0 }}>
        404 — Page introuvable
      </h1>
      <p style={{ position: "relative", color: colors.textMuted, fontSize: 16, maxWidth: 440, margin: 0 }}>
        Cette page n&apos;existe pas ou plus. Retournez à l&apos;accueil pour continuer votre navigation.
      </p>
      <Link href="/" style={{ ...btnPrimary, position: "relative", marginTop: 12 }}>
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}

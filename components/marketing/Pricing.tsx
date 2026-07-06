"use client";

import { useState } from "react";
import { Section, sectionTitle, sectionSubtitle, colors, gradient, btnPrimary } from "./theme";
import { ReceiptIcon } from "./icons";

const INCLUSIONS = [
  "Prise d'appel automatique 7j/7",
  "Personnalisation avancée (ton, phrases, voix, options)",
  "Suivi visible sur la plateforme Staro",
  "SMS automatiques au client",
  "Réponses aux questions courantes (horaires, adresse, etc.)",
];

export function PricingCard() {
  const [annual, setAnnual] = useState(true);
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: annual ? "annual" : "monthly" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setLoading(false);
        alert("Une erreur est survenue, réessayez plus tard.");
      }
    } catch {
      setLoading(false);
      alert("Une erreur est survenue, réessayez plus tard.");
    }
  }

  return (
    <div style={{ position: "relative" }}>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: "-40px",
          background: "radial-gradient(circle, rgba(155,79,221,0.28), transparent 70%)",
          filter: "blur(30px)",
          pointerEvents: "none",
        }}
      />

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 40, position: "relative" }}>
        <div
          style={{
            display: "inline-flex",
            background: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            padding: 4,
          }}
        >
          {(["Mensuel", "Annuel"] as const).map(label => {
            const isAnnual = label === "Annuel";
            const active = annual === isAnnual;
            return (
              <button
                key={label}
                onClick={() => setAnnual(isAnnual)}
                style={{
                  padding: "10px 22px",
                  borderRadius: 9,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 800,
                  background: active ? gradient : "transparent",
                  color: active ? "#fff" : colors.textMuted,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
        <div style={{ position: "relative", maxWidth: 440, width: "100%" }}>
          <div
            style={{
              position: "absolute",
              top: -16,
              left: "50%",
              transform: "translateX(-50%)",
              background: gradient,
              borderRadius: 20,
              padding: "7px 20px",
              fontSize: 12,
              fontWeight: 800,
              color: "#fff",
              boxShadow: "0 8px 24px rgba(155,79,221,0.5)",
              zIndex: 2,
              whiteSpace: "nowrap",
            }}
          >
            ★ RECOMMANDÉ
          </div>

          <div
            style={{
              background: gradient,
              borderRadius: 24,
              padding: 2,
            }}
          >
            <div
              style={{
                background: colors.card,
                borderRadius: 22,
                padding: 40,
                boxShadow: "0 25px 70px rgba(0,0,0,0.45)",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: colors.purple2, letterSpacing: 1, marginBottom: 22, marginTop: 6 }}>
                ESSENTIEL
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "rgba(107,31,173,0.1)",
                  border: `1px solid ${colors.border}`,
                  borderRadius: 12,
                  padding: "14px 16px",
                  marginBottom: 20,
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
                  <ReceiptIcon size={16} color="#fff" />
                </div>
                <div>
                  <div style={{ color: colors.text, fontWeight: 900, fontSize: 15 }}>499€ de mise en place</div>
                  <div style={{ color: colors.textMuted, fontSize: 12.5 }}>Facturés une seule fois, à la souscription</div>
                </div>
              </div>

              <div
                style={{
                  border: `1px solid ${colors.border}`,
                  borderRadius: 12,
                  padding: "20px 16px",
                  marginBottom: 24,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 800, color: colors.textMuted, letterSpacing: 1, marginBottom: 10 }}>
                  ABONNEMENT
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 44, fontWeight: 900, color: colors.text }}>{annual ? "700€" : "60€"}</span>
                  <span style={{ fontSize: 15, color: colors.textMuted }}>{annual ? "/ an" : "/ mois"}</span>
                </div>
                {annual && <div style={{ fontSize: 13, color: colors.textMuted }}>soit environ 58€/mois</div>}
                {!annual && <div style={{ fontSize: 13, color: colors.textMuted }}>720€/an au total</div>}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
                {INCLUSIONS.map(item => (
                  <div key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ color: colors.purple2, fontWeight: 900 }}>✓</span>
                    <span style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                style={{ ...btnPrimary, width: "100%", boxShadow: "0 12px 40px rgba(155,79,221,0.45)", border: "none", opacity: loading ? 0.6 : 1 }}
              >
                {loading ? "Redirection..." : "Commencer maintenant"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Pricing() {
  return (
    <Section id="pricing">
      <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 40px" }}>
        <h2 style={sectionTitle}>Prix</h2>
        <p style={sectionSubtitle}>Une offre simple, sans surprise.</p>
      </div>
      <PricingCard />
    </Section>
  );
}

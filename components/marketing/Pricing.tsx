"use client";

import { useState } from "react";
import { Section, sectionTitle, sectionSubtitle, colors, gradient, btnPrimary, btnSecondary } from "./theme";
import { CheckBadgeIcon } from "./icons";
import { PLAN_TIERS, PlanTier } from "../../lib/stripe";

const FEATURES: Record<PlanTier, string[]> = {
  essentiel: [
    "Prise d'appel automatique 7j/7",
    "Personnalisation du ton et des réponses",
    "Suivi visible sur la plateforme Staro",
    "SMS automatiques au client",
  ],
  pro: [
    "Tout ce qui est inclus dans Essentiel",
    "Support prioritaire — réponse sous 4h",
    "Point mensuel de 15 min pour ajuster votre config",
  ],
  premium: [
    "Tout ce qui est inclus dans Pro",
    "Rapport de performance mensuel personnalisé",
    "Révision trimestrielle approfondie avec Hugo",
    "Accompagnement prioritaire sur toute demande",
  ],
};

const TIER_ORDER: PlanTier[] = ["essentiel", "pro", "premium"];

export function PricingCard() {
  const [annual, setAnnual] = useState(true);
  const [loadingTier, setLoadingTier] = useState<PlanTier | null>(null);

  function handleCheckout(tier: PlanTier) {
    setLoadingTier(tier);
    const plan = `${tier}_${annual ? "annual" : "monthly"}`;
    window.location.href = `/sign-up?plan=${plan}`;
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

      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, alignItems: "start", position: "relative" }}
        className="staro-pricing-grid"
      >
        {TIER_ORDER.map(tier => {
          const info = PLAN_TIERS[tier];
          const isRecommended = tier === "pro";
          const price = annual ? info.annual : info.monthly;
          const monthlyEquivalent = annual ? Math.round(info.annual / 12) : null;

          return (
            <div key={tier} style={{ position: "relative" }}>
              {isRecommended && (
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
              )}

              <div
                style={{
                  background: isRecommended ? gradient : colors.border,
                  borderRadius: 24,
                  padding: 2,
                  height: "100%",
                }}
              >
                <div
                  style={{
                    background: colors.card,
                    borderRadius: 22,
                    padding: 32,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: isRecommended ? "0 25px 70px rgba(0,0,0,0.45)" : undefined,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 800, color: colors.purple2Text, letterSpacing: 1, marginBottom: 18, marginTop: isRecommended ? 6 : 0 }}>
                    {info.label.toUpperCase()}
                  </div>

                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 38, fontWeight: 900, color: colors.text }}>
                      {annual ? monthlyEquivalent : price}€
                    </span>
                    <span style={{ fontSize: 14, color: colors.textMuted }}>/ mois</span>
                  </div>
                  {annual ? (
                    <div style={{ fontSize: 12.5, color: colors.textMuted, marginBottom: 20 }}>
                      Facturé {price}€/an — soit un mois offert
                    </div>
                  ) : (
                    <div style={{ fontSize: 12.5, color: colors.textMuted, marginBottom: 20 }}>Sans engagement</div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28, flex: 1 }}>
                    {FEATURES[tier].map(item => (
                      <div key={item} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                        <CheckBadgeIcon size={16} color={colors.purple2Text} />
                        <span style={{ color: colors.textSecondary, fontSize: 13.5, lineHeight: 1.5 }}>{item}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleCheckout(tier)}
                    disabled={loadingTier !== null}
                    style={{
                      ...(isRecommended ? btnPrimary : btnSecondary),
                      width: "100%",
                      opacity: loadingTier !== null ? 0.6 : 1,
                    }}
                  >
                    {loadingTier === tier ? "Redirection..." : "Commencer"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: "center", marginTop: 28, position: "relative" }}>
        <p style={{ color: colors.textMuted, fontSize: 13.5, margin: 0 }}>
          499€ de mise en place, facturés une seule fois — identiques sur les 3 formules. 7 jours d'essai gratuit avant tout prélèvement.
        </p>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .staro-pricing-grid { grid-template-columns: 1fr !important; max-width: 380px; margin: 0 auto; }
        }
      `}</style>
    </div>
  );
}

export default function Pricing() {
  return (
    <Section id="pricing">
      <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 40px" }}>
        <h2 style={sectionTitle}>Prix</h2>
        <p style={sectionSubtitle}>Trois formules, un seul agent vocal — la différence se fait sur l'accompagnement.</p>
      </div>
      <PricingCard />
    </Section>
  );
}

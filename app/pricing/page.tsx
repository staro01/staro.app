"use client";

import { useState } from "react";
import FloatingHeader from "../../components/FloatingHeader";
import PageHero from "../../components/marketing/PageHero";
import FinalCTA from "../../components/marketing/FinalCTA";
import Footer from "../../components/marketing/Footer";
import FaqJsonLd from "../../components/seo/FaqJsonLd";
import { PricingCard } from "../../components/marketing/Pricing";
import { LossCalculator } from "../../components/marketing/LossCalculator";
import { Section, sectionTitle, sectionSubtitle, sectionHeader, card, colors } from "../../components/marketing/theme";

const PRICING_QUESTIONS = [
  {
    q: "Que couvre le frais de mise en place de 499€ ?",
    a: "Il couvre la configuration complète de votre agent vocal : personnalisation de la voix et du ton, mise en place de votre carte ou de vos services, connexion de votre numéro et paramétrage des réponses aux questions courantes de votre commerce.",
  },
  {
    q: "Quelle est la différence entre l'abonnement mensuel et annuel ?",
    a: "Les deux formules incluent exactement les mêmes fonctionnalités. L'abonnement annuel (700€/an, soit environ 58€/mois) revient légèrement moins cher que le mensuel (60€/mois, soit 720€/an sur une année).",
  },
  {
    q: "Puis-je changer de formule plus tard ?",
    a: "Oui, vous pouvez passer du mensuel à l'annuel (ou inversement) en nous contactant depuis votre espace Staro.",
  },
  {
    q: "Y a-t-il des frais cachés en plus de l'abonnement ?",
    a: "Non. En dehors du frais de mise en place unique et de l'abonnement choisi (mensuel ou annuel), il n'y a pas de coût supplémentaire pour les fonctionnalités listées sur cette page.",
  },
  {
    q: "Quel est l'engagement ?",
    a: "Vous choisissez une facturation mensuelle ou annuelle selon vos besoins — il n'y a pas d'engagement caché au-delà de la période que vous avez choisie.",
  },
];

export default function PricingPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div style={{ background: colors.bg }}>
      <FaqJsonLd items={PRICING_QUESTIONS} />
      <FloatingHeader />

      <PageHero style={{ paddingBottom: 40 }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, color: colors.text, margin: "0 0 16px" }}>
            Une offre simple, sans surprise
          </h1>
          <p style={{ color: colors.textSecondary, fontSize: 17, lineHeight: 1.7, margin: 0 }}>
            Un seul palier, pensé pour tous les commerces locaux — pizzeria, salon de coiffure, artisan, et bien
            d'autres métiers.
          </p>
        </div>
      </PageHero>

      <Section>
        <LossCalculator />
      </Section>

      <Section style={{ background: colors.bgDeep }}>
        <PricingCard />
      </Section>

      <Section style={{ background: colors.bgDeep }}>
        <div style={sectionHeader}>
          <h2 style={sectionTitle}>Questions sur le prix</h2>
          <p style={sectionSubtitle}>Tout ce qu'il faut savoir sur la facturation Staro.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 760, margin: "0 auto" }}>
          {PRICING_QUESTIONS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i} style={{ ...card, overflow: "hidden" }}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "20px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  <span style={{ color: colors.text, fontWeight: 800, fontSize: 15 }}>{item.q}</span>
                  <span style={{ color: colors.purple2, fontSize: 18, flexShrink: 0 }}>{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <div style={{ padding: "0 24px 20px", color: colors.textMuted, fontSize: 14, lineHeight: 1.7 }}>{item.a}</div>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      <FinalCTA
        fadeTop
        title="Prêt à démarrer avec Staro ?"
        description="Réservez un appel gratuit et voyons ensemble si Staro correspond à votre commerce."
        ctaLabel="Réserver un appel gratuit"
        ctaHref="/reserver-un-appel"
      />

      <Footer />
    </div>
  );
}

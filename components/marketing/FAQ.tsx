"use client";

import { useState } from "react";
import { Section, sectionHeader, sectionTitle, sectionSubtitle, card, colors } from "./theme";
import FaqJsonLd from "../seo/FaqJsonLd";

const QUESTIONS = [
  {
    q: "Est-ce que Staro répond vraiment à tous les appels ?",
    a: "Oui. L'agent vocal décroche systématiquement, y compris en simultané, en dehors des heures d'ouverture, et pendant les pics d'activité.",
  },
  {
    q: "Est-ce que Staro peut vraiment traiter des demandes complètes (commande / rendez-vous) ?",
    a: "Oui. L'agent comprend la demande du client, pose les questions nécessaires et enregistre une commande ou un rendez-vous complet directement dans votre espace Staro.",
  },
  {
    q: "Est-ce que je dois changer ma façon de travailler ?",
    a: "Non. Staro s'intègre à votre activité telle qu'elle est aujourd'hui — vous consultez simplement les demandes sur la plateforme, comme un carnet de commandes ou un agenda numérique.",
  },
  {
    q: "Comment je récupère et gère les commandes/RDV ?",
    a: "Tout apparaît en temps réel sur votre tableau de bord Staro, avec un statut clair pour chaque demande (reçue, en traitement, prête).",
  },
  {
    q: "Est-ce que mes clients sont informés de l'avancement ?",
    a: "Oui, un SMS automatique est envoyé au client dès que sa commande est prête ou son rendez-vous confirmé.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="faq" style={{ background: colors.bgDeep }}>
      <FaqJsonLd items={QUESTIONS} />
      <div style={sectionHeader}>
        <h2 style={sectionTitle}>Questions fréquentes</h2>
        <p style={sectionSubtitle}>Tout ce qu'il faut savoir avant de se lancer.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 760, margin: "0 auto" }}>
        {QUESTIONS.map((item, i) => {
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
  );
}

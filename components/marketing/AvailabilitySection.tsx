"use client";

import { useState } from "react";
import { colors, card, Section, sectionTitle, sectionSubtitle, sectionHeader } from "./theme";
import { CheckBadgeIcon, ClockIcon } from "./icons";

type SubItem = {
  label: string;
  detail: string;
  available: boolean;
};

type Group = {
  id: string;
  label: string;
  items: SubItem[];
};

const GROUPS: Group[] = [
  {
    id: "restauration",
    label: "Restauration",
    items: [
      { label: "À emporter & livraison", detail: "Pizzerias, kebabs, sandwicheries, snacking...", available: true },
      { label: "Service à table", detail: "Réservation de table, gestion de salle", available: false },
    ],
  },
  {
    id: "artisans",
    label: "Artisans",
    items: [
      { label: "Paysagistes", detail: "Prise de contact, qualification de projet", available: true },
      { label: "Électriciens", detail: "Qualification de la demande, transfert immédiat en cas d'urgence", available: true },
      { label: "Plombiers", detail: "Qualification de la demande, transfert immédiat en cas d'urgence", available: true },
    ],
  },
];

const STANDALONE: SubItem[] = [
  { label: "Coiffure & instituts", detail: "Prise de rendez-vous, horaires, prestations", available: true },
];

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}
    >
      <path d="M4 6l4 4 4-4" fill="none" stroke={colors.textMuted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Row({ item }: { item: SubItem }) {
  return (
    <div
      style={{
        ...card,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "18px 22px",
        opacity: item.available ? 1 : 0.45,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: item.available ? "rgba(107,31,173,0.15)" : "rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {item.available ? (
          <CheckBadgeIcon size={18} color={colors.purple2Text ?? "#c9a6f0"} />
        ) : (
          <ClockIcon size={18} color={colors.textMuted} />
        )}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ color: item.available ? colors.text : colors.textMuted, fontWeight: 800, fontSize: 15 }}>
          {item.label}
        </div>
        <div style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>{item.detail}</div>
      </div>

      {!item.available && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: colors.textMuted,
            background: "rgba(255,255,255,0.06)",
            border: `1px solid ${colors.border}`,
            borderRadius: 999,
            padding: "4px 10px",
            whiteSpace: "nowrap",
          }}
        >
          Bientôt disponible
        </span>
      )}
    </div>
  );
}

export default function AvailabilitySection() {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <Section>
      <div style={sectionHeader}>
        <h2 style={sectionTitle}>Où Staro est disponible aujourd&apos;hui</h2>
        <p style={sectionSubtitle}>On élargit progressivement les secteurs couverts par l&apos;agent vocal.</p>
      </div>

      <div style={{ maxWidth: 640, margin: "32px auto 0", display: "flex", flexDirection: "column", gap: 12 }}>
        {GROUPS.map((group) => {
          const isOpen = !!open[group.id];
          const availableCount = group.items.filter((i) => i.available).length;

          return (
            <div key={group.id} style={{ ...card, padding: 0, overflow: "hidden" }}>
              <button
                onClick={() => toggle(group.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "18px 22px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: availableCount > 0 ? "rgba(107,31,173,0.15)" : "rgba(255,255,255,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {availableCount > 0 ? (
                    <CheckBadgeIcon size={18} color={colors.purple2Text ?? "#c9a6f0"} />
                  ) : (
                    <ClockIcon size={18} color={colors.textMuted} />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ color: colors.text, fontWeight: 800, fontSize: 15 }}>{group.label}</div>
                  <div style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>
                    {availableCount}/{group.items.length} disponible{availableCount > 1 ? "s" : ""}
                  </div>
                </div>

                <Chevron open={isOpen} />
              </button>

              {isOpen && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 12px 12px" }}>
                  {group.items.map((item) => (
                    <Row key={item.label} item={item} />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {STANDALONE.map((item) => (
          <Row key={item.label} item={item} />
        ))}
      </div>
    </Section>
  );
}

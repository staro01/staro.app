import { colors, card, Section, sectionTitle, sectionSubtitle, sectionHeader } from "./theme";
import { CheckBadgeIcon, ClockIcon } from "./icons";

type Availability = {
  label: string;
  detail: string;
  available: boolean;
};

const VERTICALS: Availability[] = [
  {
    label: "Restauration à emporter & livraison",
    detail: "Pizzerias, kebabs, sandwicheries, snacking...",
    available: true,
  },
  {
    label: "Coiffure & instituts",
    detail: "Prise de rendez-vous, horaires, prestations",
    available: true,
  },
  {
    label: "Paysagistes",
    detail: "Prise de contact, qualification de projet",
    available: true,
  },
  {
    label: "Électriciens",
    detail: "Qualification de la demande, transfert immédiat en cas d'urgence",
    available: true,
  },
  {
    label: "Restauration avec service à table",
    detail: "Réservation de table, gestion de salle",
    available: false,
  },
  {
    label: "Autres artisans",
    detail: "Plombiers et autres corps de métier arrivent progressivement",
    available: false,
  },
];

export default function AvailabilitySection() {
  return (
    <Section>
      <div style={sectionHeader}>
        <h2 style={sectionTitle}>Où Staro est disponible aujourd&apos;hui</h2>
        <p style={sectionSubtitle}>On élargit progressivement les secteurs couverts par l&apos;agent vocal.</p>
      </div>

      <div style={{ maxWidth: 640, margin: "32px auto 0", display: "flex", flexDirection: "column", gap: 12 }}>
        {VERTICALS.map((v) => (
          <div
            key={v.label}
            style={{
              ...card,
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "18px 22px",
              opacity: v.available ? 1 : 0.45,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: v.available ? "rgba(107,31,173,0.15)" : "rgba(255,255,255,0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {v.available ? (
                <CheckBadgeIcon size={18} color={colors.purple2Text ?? "#c9a6f0"} />
              ) : (
                <ClockIcon size={18} color={colors.textMuted} />
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ color: v.available ? colors.text : colors.textMuted, fontWeight: 800, fontSize: 15 }}>
                {v.label}
              </div>
              <div style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>{v.detail}</div>
            </div>

            {!v.available && (
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
        ))}
      </div>
    </Section>
  );
}

import { Section, sectionTitle, sectionSubtitle, card, colors } from "./theme";
import { CheckBadgeIcon } from "./icons";

const GUARANTEES = [
  {
    title: "7 jours d'essai gratuit",
    description: "Testez Staro sans engagement. Aucune carte bancaire débitée avant la fin de l'essai.",
  },
  {
    title: "Sans engagement",
    description: "Résiliable à tout moment, en un clic depuis votre espace client. Pas de contrat caché.",
  },
  {
    title: "Mise en place en 15 minutes",
    description: "Votre agent vocal est configuré et opérationnel le jour même, sans compétence technique requise.",
  },
];

export default function Testimonials() {
  return (
    <Section id="testimonials">
      <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 40px" }}>
        <h2 style={sectionTitle}>Pourquoi essayer Staro sans risque</h2>
        <p style={sectionSubtitle}>Des garanties concrètes, pas des promesses.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }} className="staro-testimonials-grid">
        {GUARANTEES.map((g, i) => (
          <div key={i} style={{ ...card, padding: 26, display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              style={{
                width: 40, height: 40, borderRadius: 10,
                background: `${colors.purple2}22`, border: `1px solid ${colors.purple2}55`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <CheckBadgeIcon size={20} color={colors.purple2} />
            </div>
            <div style={{ color: colors.text, fontWeight: 800, fontSize: 16 }}>{g.title}</div>
            <p style={{ color: colors.textMuted, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{g.description}</p>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .staro-testimonials-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Section>
  );
}

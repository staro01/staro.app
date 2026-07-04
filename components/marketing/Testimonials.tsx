import { Section, sectionTitle, sectionSubtitle, card, colors } from "./theme";
import { InfoIcon, StarIcon } from "./icons";

const EXAMPLES = [
  {
    quote: "Voici le type de retour que nous espérons obtenir : plus aucun appel manqué pendant le coup de feu du midi.",
    name: "Exemple illustratif",
    role: "Gérant, Pizzeria",
  },
  {
    quote: "Un exemple de témoignage à venir : mes clientes sont prévenues automatiquement dès que leur créneau approche.",
    name: "Exemple illustratif",
    role: "Coiffeuse, Salon",
  },
  {
    quote: "Ceci est un exemple de mise en page — les avis réels de nos premiers clients seront publiés ici prochainement.",
    name: "Exemple illustratif",
    role: "Artisan",
  },
];

export default function Testimonials() {
  return (
    <Section id="testimonials">
      <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 20px" }}>
        <h2 style={sectionTitle}>Avis clients</h2>
        <p style={sectionSubtitle}>Ce que nos clients pourraient dire de Staro.</p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          textAlign: "center",
          fontSize: 13,
          color: colors.textMuted,
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: 10,
          padding: "10px 16px",
          maxWidth: 560,
          margin: "0 auto 40px",
        }}
      >
        <InfoIcon size={15} color={colors.textMuted} />
        Exemples illustratifs — les premiers avis clients réels seront publiés ici dès que disponibles.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }} className="staro-testimonials-grid">
        {EXAMPLES.map((t, i) => (
          <div key={i} style={{ ...card, padding: 26, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 3 }}>
              {Array.from({ length: 5 }).map((_, s) => (
                <StarIcon key={s} size={15} />
              ))}
            </div>
            <p style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>&ldquo;{t.quote}&rdquo;</p>
            <div>
              <div style={{ color: colors.text, fontWeight: 800, fontSize: 14 }}>{t.name}</div>
              <div style={{ color: colors.textMuted, fontSize: 13 }}>{t.role}</div>
            </div>
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

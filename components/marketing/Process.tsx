import { Section, sectionHeader, sectionTitle, sectionSubtitle, card, colors, gradient } from "./theme";
import { PhoneIcon, ClipboardIcon, ChartIcon, MessageIcon } from "./icons";

const STEPS = [
  {
    Icon: PhoneIcon,
    title: "Réponse à l'appel",
    description: "Staro décroche immédiatement, même en heures de pointe — plus aucun appel manqué ni client qui raccroche.",
  },
  {
    Icon: ClipboardIcon,
    title: "Demande prise et enregistrée",
    description: "La commande ou le rendez-vous est noté avec tous les détails utiles, directement selon les besoins de votre métier.",
  },
  {
    Icon: ChartIcon,
    title: "Suivi en temps réel",
    description: "Depuis la plateforme Staro, vous voyez chaque demande et son statut en un coup d'œil, à tout moment.",
  },
  {
    Icon: MessageIcon,
    title: "Client informé automatiquement",
    description: "Un SMS de confirmation est envoyé au client — commande prête ou rendez-vous confirmé selon votre activité.",
  },
];

export default function Process() {
  return (
    <Section id="process" style={{ background: colors.bgDeep }}>
      <div style={sectionHeader}>
        <h2 style={sectionTitle}>Notre processus</h2>
        <p style={sectionSubtitle}>De l'appel jusqu'au client informé, tout se passe automatiquement.</p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 24,
        }}
        className="staro-process-grid"
      >
        {STEPS.map((step, i) => (
          <div key={step.title} style={{ ...card, padding: 24, position: "relative" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: gradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <step.Icon size={20} color="#fff" />
            </div>
            <div style={{ fontSize: 12, fontWeight: 800, color: colors.purple2, marginBottom: 8 }}>ÉTAPE {i + 1}</div>
            <h3 style={{ fontSize: 17, fontWeight: 900, color: colors.text, margin: "0 0 10px" }}>{step.title}</h3>
            <p style={{ color: colors.textMuted, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{step.description}</p>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .staro-process-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 560px) {
          .staro-process-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Section>
  );
}

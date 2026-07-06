import { Section, sectionHeader, sectionTitle, sectionSubtitle, card, colors, gradient } from "./theme";
import { BoltIcon, CheckBadgeIcon, ClockIcon, CoinIcon, TargetIcon, TrendingUpIcon } from "./icons";

const BENEFITS = [
  { Icon: BoltIcon, title: "Plus aucun appel manqué", description: "Chaque appel obtient une réponse, à n'importe quelle heure." },
  { Icon: CheckBadgeIcon, title: "Une réponse claire et professionnelle", description: "Un ton posé et cohérent avec l'image de votre commerce." },
  { Icon: ClockIcon, title: "Disponible 24/7, sans interruption", description: "Nuits, week-ends, jours fériés — Staro ne s'arrête jamais." },
  { Icon: CoinIcon, title: "Moins de temps perdu au téléphone", description: "Vous vous concentrez sur votre métier, pas sur le combiné." },
  { Icon: TargetIcon, title: "Des demandes mieux qualifiées", description: "Les informations utiles sont prises dès le premier échange." },
  { Icon: TrendingUpIcon, title: "Un service qui s'adapte à votre activité", description: "Pizzeria, salon, artisan... Staro s'ajuste à votre métier." },
];

export default function Benefits() {
  return (
    <Section id="benefits">
      <div style={sectionHeader}>
        <h2 style={sectionTitle}>Avantages</h2>
        <p style={sectionSubtitle}>Ce que Staro change concrètement pour votre commerce.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }} className="staro-benefits-grid">
        {BENEFITS.map(b => (
          <div key={b.title} style={{ ...card, padding: 26 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: gradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <b.Icon size={22} color="#fff" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: colors.text, margin: "0 0 8px" }}>{b.title}</h3>
            <p style={{ color: colors.textMuted, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{b.description}</p>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .staro-benefits-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 560px) {
          .staro-benefits-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Section>
  );
}

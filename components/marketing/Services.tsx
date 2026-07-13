import { Section, sectionHeader, card, colors } from "./theme";
import { PhoneIcon, ReceiptIcon, CalendarIcon, ListIcon } from "./icons";

function StatusDot({ color }: { color: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 8px ${color}`,
      }}
    />
  );
}

function MockupLabel({ Icon, children }: { Icon: typeof PhoneIcon; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 800, color: colors.textMuted }}>
      <Icon size={14} color={colors.purple2} />
      {children}
    </div>
  );
}

function MockupCallScreen() {
  return (
    <div style={{ ...card, padding: 20, width: "100%", maxWidth: 380 }}>
      <MockupLabel Icon={PhoneIcon}>APPELS ENTRANTS</MockupLabel>
      <div style={{ marginTop: 12 }}>
        {[
          { name: "Client — 06 12 34 56 78", status: "En cours", color: "#c9a6f0" },
          { name: "Client — 06 98 76 54 32", status: "Terminé", color: "#4ade80" },
        ].map((row, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 0",
              borderTop: i > 0 ? `1px solid ${colors.border}` : "none",
            }}
          >
            <span style={{ color: colors.textSecondary, fontSize: 13 }}>{row.name}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: row.color }}>
              <StatusDot color={row.color} />
              {row.status}
            </span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 18 }}>
        <MockupLabel Icon={ReceiptIcon}>DEMANDES EN COURS</MockupLabel>
      </div>
      {["Demande #124 — Reçue", "Demande #123 — En traitement"].map((row, i) => (
        <div
          key={i}
          style={{
            padding: "10px 0",
            borderTop: i > 0 ? `1px solid ${colors.border}` : "none",
            color: colors.textSecondary,
            fontSize: 13,
          }}
        >
          {row}
        </div>
      ))}
    </div>
  );
}

function MockupAgenda() {
  const rows = [
    { time: "09:00", label: "Marie L. — Coupe + brushing", tag: "Confirmé", color: "#4ade80" },
    { time: "09:30", label: "Commande à emporter — 2 pizzas", tag: "En cours", color: "#c9a6f0" },
    { time: "10:15", label: "Julien D. — Coloration", tag: "Confirmé", color: "#4ade80" },
    { time: "12:00", label: "Rush du midi — 6 demandes", tag: "Pic d'activité", color: "#f5a623" },
  ];
  return (
    <div style={{ ...card, padding: 20, width: "100%", maxWidth: 380 }}>
      <MockupLabel Icon={CalendarIcon}>AGENDA DU JOUR</MockupLabel>
      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        {rows.map((row, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "#1e1430",
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
              padding: "10px 12px",
            }}
          >
            <span style={{ color: colors.purple2Text, fontSize: 12, fontWeight: 800, minWidth: 40 }}>{row.time}</span>
            <span style={{ color: colors.textSecondary, fontSize: 12.5, flex: 1 }}>{row.label}</span>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 800,
                color: row.color,
                background: `${row.color}22`,
                border: `1px solid ${row.color}55`,
                padding: "3px 8px",
                borderRadius: 20,
                whiteSpace: "nowrap",
              }}
            >
              {row.tag}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockupTracking() {
  const rows = [
    { label: "Demande #128", status: "Reçu", color: "#c9a6f0" },
    { label: "Demande #127", status: "En traitement", color: "#f5a623" },
    { label: "Demande #126", status: "Prêt", color: "#4ade80" },
  ];
  return (
    <div style={{ ...card, padding: 20, width: "100%", maxWidth: 380 }}>
      <MockupLabel Icon={ListIcon}>SUIVI DES DEMANDES</MockupLabel>
      <div style={{ marginTop: 12 }}>
        {rows.map((row, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 0",
              borderTop: i > 0 ? `1px solid ${colors.border}` : "none",
            }}
          >
            <span style={{ color: colors.textSecondary, fontSize: 13 }}>{row.label}</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: row.color,
                background: `${row.color}22`,
                border: `1px solid ${row.color}55`,
                padding: "4px 10px",
                borderRadius: 20,
              }}
            >
              {row.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const BLOCKS = [
  {
    title: "Standard téléphonique intelligent",
    description:
      "Dès la première sonnerie, l'agent Staro répond, comprend la demande de votre client et prend toutes les informations utiles — sans jamais interrompre votre travail, que vous soyez au four, aux ciseaux ou sur un chantier.",
    Mockup: MockupCallScreen,
  },
  {
    title: "Un système pensé pour le rythme de votre métier",
    description:
      "Coup de feu du midi, clients pressés, plusieurs demandes en même temps : Staro s'adapte au rythme de votre activité et enregistre chaque demande sans erreur, quel que soit votre secteur.",
    Mockup: MockupAgenda,
  },
  {
    title: "Les demandes sont prises, sans stress",
    description:
      "Chaque commande ou rendez-vous est enregistré et suivi automatiquement, avec un statut clair à chaque étape — vous savez toujours où vous en êtes, sans avoir à courir après le téléphone.",
    Mockup: MockupTracking,
  },
];

export default function Services() {
  return (
    <Section id="services">
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "200px",
          background: "linear-gradient(to bottom, rgba(5,1,15,0.8) 0%, rgba(0,0,0,0) 100%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ ...sectionHeader, position: "relative", zIndex: 1 }}>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 900, color: colors.text, margin: "0 0 16px", lineHeight: 1.15 }}>
          Nos services
        </h2>
        <p style={{ fontSize: 17, color: colors.textMuted, lineHeight: 1.6, margin: 0 }}>
          Un agent vocal qui prend le relais au téléphone, pour tous les commerces locaux.
        </p>
      </div>

      <div className="staro-services-list" style={{ display: "flex", flexDirection: "column", gap: 64, position: "relative", zIndex: 1 }}>
        {BLOCKS.map((block, i) => (
          <div
            key={block.title}
            style={{
              display: "flex",
              flexDirection: i % 2 === 1 ? "row-reverse" : "row",
              alignItems: "flex-start",
              gap: 48,
              flexWrap: "wrap",
            }}
            className="staro-service-row"
          >
            <div className="staro-service-text" style={{ flex: "1 1 320px", minWidth: 280 }}>
              <h3 style={{ fontSize: 24, fontWeight: 900, color: colors.text, margin: "0 0 14px" }}>{block.title}</h3>
              <p style={{ color: colors.textMuted, fontSize: 15, lineHeight: 1.7, margin: 0 }}>{block.description}</p>
            </div>
            <div className="staro-service-mockup" style={{ flex: "1 1 320px", minWidth: 280, display: "flex", justifyContent: "center" }}>
              <block.Mockup />
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 640px) {
          .staro-service-text, .staro-service-mockup {
            min-width: 0 !important;
            width: 100% !important;
            flex-basis: 100% !important;
          }
        }
      `}</style>
    </Section>
  );
}

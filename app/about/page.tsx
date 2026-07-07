import FloatingHeader from "../../components/FloatingHeader";
import PageHero from "../../components/marketing/PageHero";
import FinalCTA from "../../components/marketing/FinalCTA";
import Footer from "../../components/marketing/Footer";
import AvailabilitySection from "../../components/marketing/AvailabilitySection";
import { colors, card, gradient, Section, sectionTitle, sectionSubtitle, sectionHeader } from "../../components/marketing/theme";
import { BoltIcon, CheckBadgeIcon, ClockIcon, PhoneIcon, MessageIcon, TargetIcon } from "../../components/marketing/icons";

const RELIABILITY = [
  {
    Icon: PhoneIcon,
    title: "Téléphonie professionnelle",
    description: "Une infrastructure d'appel de niveau professionnel, pensée pour tenir la charge même lors des pics d'activité.",
  },
  {
    Icon: MessageIcon,
    title: "IA conversationnelle avancée",
    description: "Des modèles d'intelligence artificielle de pointe comprennent la demande du client et y répondent naturellement.",
  },
  {
    Icon: ClockIcon,
    title: "Disponibilité continue",
    description: "Le service tourne 24/7, sans pause ni jour de repos, pour ne jamais laisser un appel sans réponse.",
  },
  {
    Icon: CheckBadgeIcon,
    title: "Données traitées avec rigueur",
    description: "Les informations de vos clients transitent et sont stockées avec le même niveau d'exigence que sur votre plateforme Staro.",
  },
];

const WHY_STARO = [
  {
    Icon: BoltIcon,
    title: "Une conversation, pas un menu",
    description: "Pas de \"tapez 1 pour...\" : le client parle naturellement, comme à un vrai interlocuteur.",
  },
  {
    Icon: TargetIcon,
    title: "Pensé pour votre métier",
    description: "Contrairement à un standard générique, Staro s'adapte au vocabulaire et aux besoins de votre secteur.",
  },
  {
    Icon: CheckBadgeIcon,
    title: "Tout est déjà connecté",
    description: "Suivi des demandes, statuts, SMS client : tout est inclus dans la même plateforme, sans outil supplémentaire à gérer.",
  },
  {
    Icon: ClockIcon,
    title: "Opérationnel rapidement",
    description: "Pas besoin de recruter ni de former quelqu'un : Staro est configuré pour votre activité en quelques échanges.",
  },
];

export default function AboutPage() {
  return (
    <div style={{ background: colors.bg }}>
      <FloatingHeader />

      <PageHero>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, color: colors.text, margin: "0 0 20px" }}>
            À propos de Staro
          </h1>
          <p style={{ color: colors.textSecondary, fontSize: 17, lineHeight: 1.7, margin: 0 }}>
            L'agent vocal IA qui répond au téléphone pour les commerces locaux, comme le ferait un membre de
            l'équipe — à toute heure, sans jamais se fatiguer.
          </p>
        </div>
      </PageHero>

      <Section>
        <div style={{ display: "flex", gap: 48, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: "1 1 320px", minWidth: 280 }}>
            <h2 style={{ ...sectionTitle, fontSize: "clamp(24px, 3vw, 32px)" }}>Notre histoire</h2>
            <p style={{ color: colors.textMuted, fontSize: 15, lineHeight: 1.75, margin: "0 0 16px" }}>
              Le constat de départ est simple : dans un commerce local, le téléphone sonne souvent au pire moment —
              pendant le coup de feu du midi, les mains dans la pâte, ou entre deux clients. Chaque appel manqué,
              c'est une commande perdue, un rendez-vous qui part chez le concurrent, une opportunité qui ne revient pas.
            </p>
            <p style={{ color: colors.textMuted, fontSize: 15, lineHeight: 1.75, margin: 0 }}>
              Nous avons construit Staro pour régler ce problème concrètement : un agent vocal capable de décrocher
              immédiatement, de comprendre une demande comme le ferait un humain, et de la transmettre directement
              au commerçant — sans jamais interrompre son travail.
            </p>
          </div>
          <div style={{ flex: "1 1 280px", minWidth: 260, display: "flex", alignItems: "stretch", justifyContent: "center" }}>
            <div style={{ ...card, padding: 32, maxWidth: 360, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <h3 style={{ color: colors.text, fontSize: 17, fontWeight: 900, margin: "0 0 12px" }}>Notre mission</h3>
              <p style={{ color: colors.textMuted, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                Donner à chaque commerçant local les moyens d'un standard téléphonique professionnel, disponible
                24/7, sans avoir à recruter ni à décrocher entre deux clients.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section style={{ background: colors.bgDeep }}>
        <div style={sectionHeader}>
          <h2 style={{ ...sectionTitle, fontSize: "clamp(24px, 3vw, 32px)" }}>Une infrastructure fiable</h2>
          <p style={sectionSubtitle}>Ce qui fait tourner Staro derrière chaque appel.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }} className="staro-about-grid">
          {RELIABILITY.map(item => (
            <div key={item.title} style={{ ...card, padding: 26, display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: gradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <item.Icon size={20} color="#fff" />
              </div>
              <div>
                <h3 style={{ color: colors.text, fontSize: 15, fontWeight: 900, margin: "0 0 6px" }}>{item.title}</h3>
                <p style={{ color: colors.textMuted, fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <div
            style={{
              ...card,
              padding: "36px 40px",
              position: "relative",
            }}
          >
            <div style={{ fontSize: 40, color: colors.purple2, lineHeight: 1, marginBottom: 12 }}>&ldquo;</div>
            <p style={{ color: colors.textSecondary, fontSize: 16, lineHeight: 1.8, margin: "0 0 16px", fontStyle: "italic" }}>
              Nous construisons Staro parce que nous croyons qu'un commerce local ne devrait jamais perdre un client
              simplement parce que personne n'a pu répondre au téléphone à temps. Chaque fonctionnalité que nous
              ajoutons part de ce principe : faire gagner du temps aux commerçants, sans jamais leur compliquer la vie.
            </p>
            <div style={{ color: colors.textMuted, fontSize: 13, fontWeight: 700 }}>— L'équipe Staro</div>
          </div>
        </div>
      </Section>

      <Section style={{ background: colors.bgDeep }}>
        <div style={sectionHeader}>
          <h2 style={{ ...sectionTitle, fontSize: "clamp(24px, 3vw, 32px)" }}>Pourquoi choisir Staro</h2>
          <p style={sectionSubtitle}>Face à un répondeur classique, un standard externalisé, ou ne rien faire.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }} className="staro-about-grid">
          {WHY_STARO.map(item => (
            <div key={item.title} style={{ ...card, padding: 26 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: gradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                }}
              >
                <item.Icon size={20} color="#fff" />
              </div>
              <h3 style={{ color: colors.text, fontSize: 15, fontWeight: 900, margin: "0 0 8px" }}>{item.title}</h3>
              <p style={{ color: colors.textMuted, fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>{item.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <AvailabilitySection />

      <FinalCTA
        fadeTop
        title="Prêt à faire l'essai avec Staro ?"
        description="Discutons de votre commerce et voyons ensemble comment Staro peut répondre à votre place, dès aujourd'hui."
        ctaLabel="Nous contacter"
        ctaHref="/contact"
      />

      <Footer />

      <style>{`
        @media (max-width: 700px) {
          .staro-about-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

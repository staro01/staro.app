import type { Metadata } from "next";
import FloatingHeader from "../../components/FloatingHeader";
import PageHero from "../../components/marketing/PageHero";
import Footer from "../../components/marketing/Footer";
import { colors } from "../../components/marketing/theme";

export const metadata: Metadata = {
  title: "CGU/CGV",
  description: "Conditions générales d'utilisation et de vente de Staro.app.",
  alternates: { canonical: "/cgu-cgv" },
  robots: { index: true, follow: true },
};

const h2: React.CSSProperties = { fontSize: 20, fontWeight: 900, color: colors.text, margin: "40px 0 14px" };
const p: React.CSSProperties = { color: colors.textMuted, fontSize: 15, lineHeight: 1.75, margin: "0 0 14px" };

export default function CguCgvPage() {
  return (
    <div style={{ background: colors.bg }}>
      <FloatingHeader />

      <PageHero style={{ padding: "150px 20px 60px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 900, color: colors.text, margin: 0 }}>
            Conditions générales d&apos;utilisation et de vente
          </h1>
        </div>
      </PageHero>

      <section style={{ padding: "0 20px 90px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <h2 style={{ ...h2, marginTop: 0 }}>Objet</h2>
          <p style={p}>
            Les présentes conditions générales régissent l&apos;utilisation du service Staro, un agent vocal
            propulsé par intelligence artificielle destiné aux commerces locaux, édité par Hugo Muller
            (SIRET 932 350 994 00012).
          </p>

          <h2 style={h2}>Description du service</h2>
          <p style={p}>
            Staro répond aux appels téléphoniques entrants pour le compte du client professionnel, comprend la
            demande formulée par l&apos;appelant, l&apos;enregistre dans l&apos;espace Staro du client, et informe
            le cas échéant l&apos;appelant par SMS de l&apos;avancement de sa demande.
          </p>

          <h2 style={h2}>Création de compte</h2>
          <p style={p}>
            L&apos;accès au service nécessite la création d&apos;un compte. Le client s&apos;engage à fournir des
            informations exactes et à jour, et à préserver la confidentialité de ses identifiants.
          </p>

          <h2 style={h2}>Tarifs et paiement</h2>
          <p style={p}>
            Staro propose trois formules d&apos;abonnement : Essentiel (60€ par mois ou 660€ par an), Pro (90€
            par mois ou 990€ par an) et Premium (120€ par mois ou 1320€ par an). Chaque formule est soumise à
            des frais de mise en place uniques de 499€, facturés une seule fois, identiques quelle que soit la
            formule choisie. Les tarifs en vigueur sont précisés sur la page /pricing du site. Le paiement
            s&apos;effectue selon les modalités communiquées lors de la souscription.
          </p>

          <h2 style={h2}>Durée et résiliation</h2>
          <p style={p}>
            L&apos;abonnement est souscrit pour la durée choisie (mensuelle ou annuelle) et se renouvelle
            tacitement sauf résiliation par le client, dans les conditions communiquées lors de la souscription.
          </p>

          <h2 style={h2}>Responsabilité</h2>
          <p style={p}>
            Staro met en œuvre les moyens raisonnables pour assurer la disponibilité et la qualité du service,
            sans garantir une disponibilité continue et sans interruption. La responsabilité de Staro ne saurait
            être engagée en cas de dommage indirect résultant de l&apos;utilisation du service.
          </p>

          <h2 style={h2}>Propriété intellectuelle</h2>
          <p style={p}>
            L&apos;ensemble des éléments techniques et logiciels composant le service Staro demeure la propriété
            exclusive de l&apos;éditeur. Aucune cession de droits n&apos;est consentie au client au-delà du droit
            d&apos;usage du service.
          </p>

          <h2 style={h2}>Droit applicable et juridiction</h2>
          <p style={p}>
            Les présentes conditions sont soumises au droit français. En cas de litige, et à défaut de résolution
            amiable, les tribunaux compétents du ressort de Paris seront seuls compétents.
          </p>

          <h2 style={h2}>Contact</h2>
          <p style={p}>Pour toute question relative aux présentes conditions : contact@staro.app.</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

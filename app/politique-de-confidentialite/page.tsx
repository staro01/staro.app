import type { Metadata } from "next";
import FloatingHeader from "../../components/FloatingHeader";
import PageHero from "../../components/marketing/PageHero";
import Footer from "../../components/marketing/Footer";
import { colors } from "../../components/marketing/theme";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité et protection des données de Staro.app.",
  alternates: { canonical: "/politique-de-confidentialite" },
  robots: { index: true, follow: true },
};

const h2: React.CSSProperties = { fontSize: 20, fontWeight: 900, color: colors.text, margin: "40px 0 14px" };
const p: React.CSSProperties = { color: colors.textMuted, fontSize: 15, lineHeight: 1.75, margin: "0 0 14px" };
const li: React.CSSProperties = { color: colors.textMuted, fontSize: 15, lineHeight: 1.75, marginBottom: 8 };

export default function PolitiqueConfidentialitePage() {
  return (
    <div style={{ background: colors.bg }}>
      <FloatingHeader />

      <PageHero style={{ padding: "150px 20px 60px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 900, color: colors.text, margin: 0 }}>
            Politique de confidentialité
          </h1>
        </div>
      </PageHero>

      <section style={{ padding: "0 20px 90px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div
            style={{
              background: "rgba(245,166,35,0.08)",
              border: "1px solid rgba(245,166,35,0.4)",
              borderRadius: 12,
              padding: "16px 20px",
              marginBottom: 40,
              color: "#f5a623",
              fontSize: 13.5,
              lineHeight: 1.6,
            }}
          >
            ⚠️ Ce contenu est un modèle indicatif fourni à titre de base de travail. Il doit être relu et validé
            par un professionnel du droit avant d&apos;être considéré comme définitif, en particulier concernant
            le traitement des données vocales de vos clients.
          </div>

          <h2 style={{ ...h2, marginTop: 0 }}>Responsable du traitement</h2>
          <p style={p}>
            Hugo Muller, entrepreneur individuel (SIRET 932 350 994 00012), 229 rue Saint-Honoré, 75001 Paris,
            est responsable du traitement des données collectées via le site Staro.app.
          </p>
          <p style={p}>Contact : contact@staro.app</p>

          <h2 style={h2}>Données collectées</h2>
          <p style={p}>Selon votre utilisation du site, nous collectons :</p>
          <ul style={{ margin: "0 0 14px", paddingLeft: 20 }}>
            <li style={li}>
              <strong style={{ color: colors.text }}>Formulaire de contact</strong> : nom, adresse email, contenu
              du message.
            </li>
            <li style={li}>
              <strong style={{ color: colors.text }}>Newsletter</strong> : adresse email.
            </li>
            <li style={li}>
              <strong style={{ color: colors.text }}>Création de compte</strong> : adresse email et informations
              d&apos;authentification, gérées via notre prestataire Clerk.
            </li>
            <li style={li}>
              <strong style={{ color: colors.text }}>Prise de rendez-vous</strong> : nom, email, et le cas échéant
              numéro de téléphone, via notre prestataire Calendly.
            </li>
            <li style={li}>
              <strong style={{ color: colors.text }}>Utilisation du service Staro par nos clients professionnels</strong>{" "}
              : dans le cadre de l&apos;exploitation de l&apos;agent vocal, les appels téléphoniques des clients
              finaux de nos clients commerçants sont traités (voix, numéro de téléphone, contenu de la demande).
              Dans ce cadre, Staro agit en tant que <strong style={{ color: colors.text }}>sous-traitant</strong>{" "}
              au sens du RGPD, pour le compte du commerçant qui reste responsable de traitement vis-à-vis de ses
              propres clients.
            </li>
          </ul>

          <h2 style={h2}>Finalités et bases légales</h2>
          <p style={p}>
            Ces données sont traitées afin de répondre à vos demandes, gérer votre compte et l&apos;exécution du
            contrat, fournir et améliorer le service Staro, et respecter nos obligations légales. Le traitement
            repose selon les cas sur votre consentement, l&apos;exécution du contrat, ou notre intérêt légitime.
          </p>

          <h2 style={h2}>Durée de conservation</h2>
          <p style={p}>
            Les données issues du formulaire de contact sont conservées 3 ans à compter du dernier échange. Les
            données de compte sont conservées pendant toute la durée du contrat, puis archivées selon les
            obligations légales applicables. Les données liées aux appels téléphoniques sont conservées pendant
            la durée nécessaire à la fourniture du service, dans les limites fixées avec chaque client
            professionnel.
          </p>

          <h2 style={h2}>Destinataires et sous-traitants</h2>
          <p style={p}>
            Certaines données sont transmises à nos prestataires techniques, agissant en tant que sous-traitants :
            Clerk (authentification), Vercel (hébergement), Neon (base de données), Twilio (téléphonie), Calendly
            (prise de rendez-vous), ainsi que nos prestataires de synthèse et de traitement vocal par IA.
          </p>

          <h2 style={h2}>Transferts hors Union européenne</h2>
          <p style={p}>
            Certains de nos prestataires (notamment Vercel, Clerk et Twilio) sont basés aux États-Unis. Ces
            transferts sont encadrés par des clauses contractuelles types ou tout autre mécanisme reconnu par le
            RGPD comme garantissant un niveau de protection adéquat.
          </p>

          <h2 style={h2}>Cookies</h2>
          <p style={p}>
            Le site utilise des cookies strictement nécessaires à son fonctionnement, ainsi que des cookies tiers
            soumis à votre consentement (notamment ceux déposés par Calendly lors de l&apos;utilisation du module
            de réservation). Vous pouvez gérer votre consentement via la bannière affichée sur le site.
          </p>

          <h2 style={h2}>Vos droits</h2>
          <p style={p}>
            Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement,
            de limitation, de portabilité et d&apos;opposition sur vos données personnelles. Vous pouvez exercer
            ces droits en nous contactant à contact@staro.app. Vous disposez également du droit d&apos;introduire
            une réclamation auprès de la CNIL (www.cnil.fr).
          </p>

          <h2 style={h2}>Sécurité</h2>
          <p style={p}>
            Nous mettons en œuvre des mesures techniques et organisationnelles raisonnables pour protéger vos
            données contre l&apos;accès non autorisé, la perte ou la divulgation.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

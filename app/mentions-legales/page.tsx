import FloatingHeader from "../../components/FloatingHeader";
import PageHero from "../../components/marketing/PageHero";
import Footer from "../../components/marketing/Footer";
import { colors } from "../../components/marketing/theme";

const h2: React.CSSProperties = { fontSize: 20, fontWeight: 900, color: colors.text, margin: "40px 0 14px" };
const p: React.CSSProperties = { color: colors.textMuted, fontSize: 15, lineHeight: 1.75, margin: "0 0 14px" };

export default function MentionsLegalesPage() {
  return (
    <div style={{ background: colors.bg }}>
      <FloatingHeader />

      <PageHero style={{ padding: "150px 20px 60px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 900, color: colors.text, margin: 0 }}>
            Mentions légales
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
            par un professionnel du droit avant d&apos;être considéré comme définitif.
          </div>

          <h2 style={{ ...h2, marginTop: 0 }}>Éditeur du site</h2>
          <p style={p}>
            Le site Staro.app est édité par Hugo Muller, entrepreneur individuel (micro-entreprise), immatriculé
            sous le numéro SIRET 932 350 994 00012.
          </p>
          <p style={p}>
            Adresse : 229 rue Saint-Honoré, 75001 Paris, France.
            <br />
            Email : contact@staro.app
            <br />
            Téléphone : 07 67 71 91 21
          </p>
          <p style={p}>Directeur de la publication : Hugo Muller.</p>

          <h2 style={h2}>Hébergement</h2>
          <p style={p}>
            Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.
            <br />
            Site web : https://vercel.com
          </p>

          <h2 style={h2}>Propriété intellectuelle</h2>
          <p style={p}>
            L&apos;ensemble des contenus présents sur le site Staro.app (textes, images, logos, éléments
            graphiques, structure) est protégé par le droit de la propriété intellectuelle. Toute reproduction,
            représentation, modification ou exploitation, totale ou partielle, sans autorisation préalable, est
            interdite.
          </p>

          <h2 style={h2}>Responsabilité</h2>
          <p style={p}>
            L&apos;éditeur s&apos;efforce de fournir des informations aussi précises que possible sur le site,
            mais ne peut garantir l&apos;exactitude, la complétude ou l&apos;actualité de l&apos;ensemble des
            informations mises à disposition. L&apos;éditeur ne saurait être tenu responsable des dommages
            directs ou indirects résultant de l&apos;accès ou de l&apos;utilisation du site.
          </p>

          <h2 style={h2}>Contact</h2>
          <p style={p}>
            Pour toute question relative aux présentes mentions légales, vous pouvez nous contacter à l&apos;adresse
            contact@staro.app.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

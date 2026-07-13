import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import FloatingHeader from "../../components/FloatingHeader";
import PageHero from "../../components/marketing/PageHero";
import FinalCTA from "../../components/marketing/FinalCTA";
import Footer from "../../components/marketing/Footer";
import FaqJsonLd from "../../components/seo/FaqJsonLd";
import { VERTICALS, VerticalSlug } from "../../components/marketing/verticalContent";
import { colors, card, gradient, btnPrimary, Section, sectionTitle, sectionSubtitle, sectionHeader } from "../../components/marketing/theme";
import { BoltIcon } from "../../components/marketing/icons";

export function generateStaticParams() {
  return Object.keys(VERTICALS).map((slug) => ({ vertical: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ vertical: string }> }): Promise<Metadata> {
  const { vertical } = await params;
  const content = VERTICALS[vertical as VerticalSlug];
  if (!content) return {};

  return {
    title: content.title,
    description: content.metaDescription,
    alternates: { canonical: `/${content.slug}` },
    openGraph: {
      title: content.title,
      description: content.metaDescription,
      url: `https://www.staro.app/${content.slug}`,
    },
  };
}

export default async function VerticalPage({ params }: { params: Promise<{ vertical: string }> }) {
  const { vertical } = await params;
  const content = VERTICALS[vertical as VerticalSlug];
  if (!content) notFound();

  return (
    <div style={{ background: colors.bg }}>
      <FloatingHeader />

      <PageHero>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          {content.urgency && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(107,31,173,0.15)",
                border: `1px solid ${colors.border}`,
                borderRadius: 999,
                padding: "7px 16px",
                fontSize: 12.5,
                fontWeight: 800,
                color: colors.purple2Text,
                marginBottom: 20,
              }}
            >
              <BoltIcon size={14} color={colors.purple2Text} />
              Détection d&apos;urgence incluse
            </div>
          )}
          <h1 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, color: colors.text, margin: "0 0 20px", lineHeight: 1.15 }}>
            {content.heroTitle}
          </h1>
          <p style={{ color: colors.textSecondary, fontSize: 17, lineHeight: 1.7, margin: "0 0 32px" }}>
            {content.heroDescription}
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/contact" style={btnPrimary}>
              Nous contacter
            </Link>
            <Link href="/pricing" style={{ ...btnPrimary, background: "transparent", border: `1px solid ${colors.border}`, boxShadow: "none" }}>
              Voir les tarifs
            </Link>
          </div>
        </div>
      </PageHero>

      <Section>
        <div style={sectionHeader}>
          <h2 style={{ ...sectionTitle, fontSize: "clamp(24px, 3vw, 32px)" }}>
            Ce que vivent les {content.metierPluriel} au quotidien
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }} className="staro-vertical-grid">
          {content.painPoints.map((p) => (
            <div key={p.title} style={{ ...card, padding: 26 }}>
              <h3 style={{ color: colors.text, fontSize: 15, fontWeight: 900, margin: "0 0 10px" }}>{p.title}</h3>
              <p style={{ color: colors.textMuted, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{p.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section style={{ background: colors.bgDeep }}>
        <div style={sectionHeader}>
          <h2 style={{ ...sectionTitle, fontSize: "clamp(24px, 3vw, 32px)" }}>Comment Staro répond à votre métier</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }} className="staro-vertical-grid-2">
          {content.features.map((f) => (
            <div key={f.title} style={{ ...card, padding: 26, display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 40, height: 40, borderRadius: 10, background: gradient,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}
              >
                <f.Icon size={20} color="#fff" />
              </div>
              <div>
                <h3 style={{ color: colors.text, fontSize: 15, fontWeight: 900, margin: "0 0 6px" }}>{f.title}</h3>
                <p style={{ color: colors.textMuted, fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="faq">
        <FaqJsonLd items={content.faq} />
        <div style={sectionHeader}>
          <h2 style={sectionTitle}>Questions fréquentes</h2>
          <p style={sectionSubtitle}>Pour les {content.metierPluriel} qui découvrent Staro.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 760, margin: "0 auto" }}>
          {content.faq.map((item) => (
            <div key={item.q} style={{ ...card, padding: "20px 24px" }}>
              <h3 style={{ color: colors.text, fontWeight: 800, fontSize: 15, margin: "0 0 8px" }}>{item.q}</h3>
              <p style={{ color: colors.textMuted, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{item.a}</p>
            </div>
          ))}
        </div>
      </Section>

      <FinalCTA
        fadeTop
        title={`Prêt à ne plus rater un appel, ${content.metier} ?`}
        description="Discutons de votre activité et voyons ensemble comment Staro peut répondre à votre place, dès aujourd'hui."
        ctaLabel="Nous contacter"
        ctaHref="/contact"
      />

      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .staro-vertical-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 700px) {
          .staro-vertical-grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

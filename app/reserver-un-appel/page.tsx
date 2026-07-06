"use client";

import Script from "next/script";
import FloatingHeader from "../../components/FloatingHeader";
import PageHero from "../../components/marketing/PageHero";
import Footer from "../../components/marketing/Footer";
import { colors, gradient } from "../../components/marketing/theme";

const CALENDLY_URL = "https://calendly.com/staro-app/nouvelle-reunion?hide_gdpr_banner=1";

export default function ReserverUnAppelPage() {
  return (
    <div style={{ background: colors.bg }}>
      <FloatingHeader />

      <PageHero>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, color: colors.text, margin: "0 0 16px" }}>
            Réservez un appel
          </h1>
          <p style={{ color: colors.textSecondary, fontSize: 17, lineHeight: 1.7, margin: 0 }}>
            Choisissez le créneau qui vous arrange — nous discutons de votre commerce et de comment Staro peut
            répondre à votre place.
          </p>
        </div>
      </PageHero>

      <section style={{ padding: "0 20px 90px" }}>
        <div
          style={{
            maxWidth: 920,
            margin: "0 auto",
            padding: 2,
            borderRadius: 24,
            background: gradient,
            boxShadow: "0 30px 90px rgba(107,31,173,0.35), 0 10px 30px rgba(0,0,0,0.4)",
          }}
        >
          <div
            style={{
              borderRadius: 22,
              overflow: "hidden",
              background: "#fff",
            }}
          >
            <div
              className="calendly-inline-widget"
              data-url={CALENDLY_URL}
              style={{ minWidth: "320px", height: "720px" }}
            />
          </div>
        </div>

        <p
          style={{
            textAlign: "center",
            color: colors.textMuted,
            fontSize: 13,
            margin: "20px auto 0",
            maxWidth: 500,
          }}
        >
          Aucun engagement — l&apos;appel dure 15 minutes et nous répondons à toutes vos questions.
        </p>
      </section>

      <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="lazyOnload" />

      <Footer />
    </div>
  );
}

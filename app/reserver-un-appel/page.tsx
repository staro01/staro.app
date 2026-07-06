"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import FloatingHeader from "../../components/FloatingHeader";
import PageHero from "../../components/marketing/PageHero";
import Footer from "../../components/marketing/Footer";
import { colors, gradient, btnPrimary } from "../../components/marketing/theme";
import { getCookieConsent, setCookieConsent } from "../../components/CookieConsent";

const CALENDLY_URL = "https://calendly.com/staro-app/nouvelle-reunion?hide_gdpr_banner=1";

export default function ReserverUnAppelPage() {
  const [consent, setConsent] = useState<"accepted" | "rejected" | null>(null);

  useEffect(() => {
    setConsent(getCookieConsent());
    function onChange() {
      setConsent(getCookieConsent());
    }
    window.addEventListener("staro-consent-change", onChange);
    return () => window.removeEventListener("staro-consent-change", onChange);
  }, []);

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
            {consent === "accepted" ? (
              <>
                <div
                  className="calendly-inline-widget"
                  data-url={CALENDLY_URL}
                  style={{ minWidth: "320px", height: "720px" }}
                />
                <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="lazyOnload" />
              </>
            ) : (
              <div
                style={{
                  minHeight: 400,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 18,
                  padding: 40,
                  textAlign: "center",
                }}
              >
                <p style={{ color: "#333", fontSize: 15, maxWidth: 420, margin: 0, lineHeight: 1.6 }}>
                  Le calendrier de réservation est fourni par Calendly, un service tiers qui dépose des cookies.
                  Acceptez les cookies non essentiels pour afficher le calendrier.
                </p>
                <button
                  onClick={() => setCookieConsent("accepted")}
                  style={{ ...btnPrimary, border: "none" }}
                >
                  Accepter et afficher le calendrier
                </button>
              </div>
            )}
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

      <Footer />
    </div>
  );
}

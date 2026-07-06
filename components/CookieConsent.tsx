"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { colors, gradient } from "./marketing/theme";

const CONSENT_KEY = "staro_cookie_consent";

export function getCookieConsent(): "accepted" | "rejected" | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(CONSENT_KEY);
  if (v === "accepted" || v === "rejected") return v;
  return null;
}

export function setCookieConsent(value: "accepted" | "rejected") {
  window.localStorage.setItem(CONSENT_KEY, value);
  window.dispatchEvent(new Event("staro-consent-change"));
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getCookieConsent()) setVisible(true);
    function onChange() {
      setVisible(!getCookieConsent());
    }
    window.addEventListener("staro-consent-change", onChange);
    return () => window.removeEventListener("staro-consent-change", onChange);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        padding: 16,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          maxWidth: 720,
          width: "100%",
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: 16,
          padding: "20px 24px",
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          alignItems: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <p style={{ flex: "1 1 320px", color: colors.textSecondary, fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
          Nous utilisons des cookies nécessaires au fonctionnement du site et, avec votre accord, des cookies
          tiers (notamment pour la prise de rendez-vous). Vous pouvez accepter ou refuser les cookies non
          essentiels.{" "}
          <Link href="/politique-de-confidentialite" style={{ color: colors.purple2 }}>
            En savoir plus
          </Link>
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setCookieConsent("rejected")}
            style={{
              background: "transparent",
              border: `1px solid ${colors.border}`,
              color: colors.text,
              borderRadius: 10,
              padding: "10px 18px",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Refuser
          </button>
          <button
            onClick={() => setCookieConsent("accepted")}
            style={{
              background: gradient,
              border: "none",
              color: "#fff",
              borderRadius: 10,
              padding: "10px 18px",
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}

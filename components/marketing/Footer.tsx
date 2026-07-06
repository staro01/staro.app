"use client";

import { useState } from "react";
import Link from "next/link";
import { container, gradient, colors } from "./theme";
import { useToast } from "../Toast";

const LINK_COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Liens",
    links: [
      { label: "Services", href: "/#services" },
      { label: "Processus", href: "/#process" },
      { label: "Bénéfices", href: "/#benefits" },
      { label: "Nos tarifs", href: "/pricing" },
    ],
  },
  {
    title: "Pages",
    links: [
      { label: "Accueil", href: "/" },
      { label: "À propos", href: "/about" },
      { label: "Prix", href: "/pricing" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

const LEGAL_LINKS = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Politique de confidentialité", href: "/politique-de-confidentialite" },
  { label: "CGU/CGV", href: "/cgu-cgv" },
];

const SOCIALS = [
  { label: "Instagram", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "Facebook", href: "#" },
];

export default function Footer() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "newsletter", email }),
      });
      if (!res.ok) throw new Error();
      showToast("Merci ! Vous êtes inscrit(e) à la newsletter.");
      setEmail("");
    } catch {
      showToast("Une erreur est survenue, réessayez plus tard.", "error");
    } finally {
      setSending(false);
    }
  }

  return (
    <footer style={{ borderTop: `1px solid ${colors.border}`, padding: "56px 20px 32px", background: colors.bgDeep }}>
      <div style={{ ...container, display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1.2fr", gap: 40 }} className="staro-footer-grid">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span
              style={{
                background: gradient,
                borderRadius: 8,
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              ✦
            </span>
            <span style={{ fontSize: 18, fontWeight: 900, color: colors.text }}>Staro.app</span>
          </div>
          <p style={{ color: colors.textMuted, fontSize: 14, lineHeight: 1.6, margin: 0, maxWidth: 260 }}>
            L'agent vocal IA qui répond au téléphone pour les commerces locaux, 24/7.
          </p>
        </div>

        {LINK_COLUMNS.map(col => (
          <div key={col.title}>
            <div style={{ color: colors.text, fontWeight: 800, fontSize: 14, marginBottom: 16 }}>{col.title}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {col.links.map(l => (
                <Link key={l.label} href={l.href} style={{ color: colors.textMuted, fontSize: 14, textDecoration: "none" }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        ))}

        <div>
          <div style={{ color: colors.text, fontWeight: 800, fontSize: 14, marginBottom: 16 }}>Réseaux sociaux</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {SOCIALS.map(s => (
              <Link key={s.label} href={s.href} style={{ color: colors.textMuted, fontSize: 14, textDecoration: "none" }}>
                {s.label}
              </Link>
            ))}
          </div>
          <div style={{ color: colors.text, fontWeight: 800, fontSize: 14, marginBottom: 10 }}>Newsletter</div>
          <form onSubmit={subscribe} style={{ display: "flex", gap: 8 }}>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Votre email"
              style={{
                flex: 1,
                minWidth: 0,
                background: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: 10,
                padding: "10px 12px",
                color: colors.text,
                fontSize: 13,
              }}
            />
            <button
              type="submit"
              disabled={sending}
              style={{
                background: gradient,
                border: "none",
                borderRadius: 10,
                padding: "10px 16px",
                color: "#fff",
                fontWeight: 800,
                fontSize: 13,
                cursor: "pointer",
                opacity: sending ? 0.6 : 1,
                whiteSpace: "nowrap",
              }}
            >
              S&apos;abonner
            </button>
          </form>
        </div>
      </div>

      <div
        style={{
          ...container,
          borderTop: `1px solid ${colors.border}`,
          marginTop: 40,
          paddingTop: 24,
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ color: colors.textMuted, fontSize: 13 }}>
          © {new Date().getFullYear()} Staro.app — Tous droits réservés.
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
          {LEGAL_LINKS.map(l => (
            <Link key={l.href} href={l.href} style={{ color: colors.textMuted, fontSize: 13, textDecoration: "none" }}>
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .staro-footer-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 520px) {
          .staro-footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { colors, gradient, container, btnPrimary } from "./theme";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/about", label: "À propos" },
  { href: "/pricing", label: "Prix" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(10,10,10,0.85)",
        backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div
        style={{
          ...container,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          gap: 16,
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
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
              flexShrink: 0,
            }}
          >
            ✦
          </span>
          <span style={{ fontSize: 19, fontWeight: 900, color: colors.text }}>Staro.app</span>
        </Link>

        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
          }}
          className="staro-marketing-nav-desktop"
        >
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} style={{ color: colors.textSecondary, textDecoration: "none", fontSize: 14, fontWeight: 700 }}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 18 }} className="staro-marketing-cta-desktop">
          <Link href="/sign-in" style={{ color: colors.textMuted, textDecoration: "none", fontSize: 14, fontWeight: 700 }}>
            Se connecter
          </Link>
          <Link href="/contact" style={{ ...btnPrimary, padding: "10px 20px", fontSize: 14 }}>
            Réserver un appel
          </Link>
        </div>

        <button
          onClick={() => setOpen(v => !v)}
          className="staro-marketing-burger"
          style={{
            display: "none",
            background: "transparent",
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            width: 40,
            height: 40,
            color: colors.text,
            fontSize: 18,
            cursor: "pointer",
          }}
          aria-label="Menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <div
          style={{
            borderTop: `1px solid ${colors.border}`,
            padding: "16px 20px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{ color: colors.textSecondary, textDecoration: "none", fontSize: 15, fontWeight: 700 }}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/sign-in" onClick={() => setOpen(false)} style={{ color: colors.textMuted, textDecoration: "none", fontSize: 15, fontWeight: 700 }}>
            Se connecter
          </Link>
          <Link href="/contact" onClick={() => setOpen(false)} style={{ ...btnPrimary, textAlign: "center" }}>
            Réserver un appel
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .staro-marketing-nav-desktop, .staro-marketing-cta-desktop { display: none !important; }
          .staro-marketing-burger { display: flex !important; align-items: center; justify-content: center; }
        }
      `}</style>
    </header>
  );
}

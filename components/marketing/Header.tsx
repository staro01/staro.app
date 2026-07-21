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

const METIERS = [
  { href: "/paysagiste", label: "Paysagiste" },
  { href: "/electricien", label: "Électricien" },
  { href: "/plombier", label: "Plombier" },
  { href: "/chauffagiste", label: "Chauffagiste" },
  { href: "/garagiste", label: "Garagiste" },
  { href: "/coiffeur", label: "Coiffure & instituts" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [metiersOpen, setMetiersOpen] = useState(false);

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
          <img src="/logo-badge.png" alt="Staro.app" width={32} height={32} style={{ borderRadius: 8, flexShrink: 0 }} />
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

          <div
            style={{ position: "relative" }}
            onMouseEnter={() => setMetiersOpen(true)}
            onMouseLeave={() => setMetiersOpen(false)}
          >
            <button
              style={{
                display: "flex", alignItems: "center", gap: 4, background: "transparent", border: "none",
                color: colors.textSecondary, fontSize: 14, fontWeight: 700, cursor: "pointer", padding: 0, fontFamily: "inherit",
              }}
            >
              Métiers <span style={{ fontSize: 10 }}>▾</span>
            </button>
            {metiersOpen && (
              <div
                style={{
                  position: "absolute", top: "100%", left: 0, paddingTop: 10, minWidth: 200,
                }}
              >
                <div
                  style={{
                    background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12,
                    padding: 8, boxShadow: "0 20px 50px rgba(0,0,0,0.5)", display: "flex", flexDirection: "column", gap: 2,
                  }}
                >
                  {METIERS.map(m => (
                    <Link
                      key={m.href}
                      href={m.href}
                      style={{
                        color: colors.textSecondary, textDecoration: "none", fontSize: 13.5, fontWeight: 700,
                        padding: "9px 12px", borderRadius: 8,
                      }}
                    >
                      {m.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
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
            background: "rgba(10,10,10,0.98)",
            backdropFilter: "blur(10px)",
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

          <div style={{ borderTop: `1px solid ${colors.border}`, marginTop: 4, paddingTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: colors.textMuted, letterSpacing: 0.5 }}>MÉTIERS</span>
            {METIERS.map(m => (
              <Link
                key={m.href}
                href={m.href}
                onClick={() => setOpen(false)}
                style={{ color: colors.textSecondary, textDecoration: "none", fontSize: 15, fontWeight: 700 }}
              >
                {m.label}
              </Link>
            ))}
          </div>

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

"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { colors, gradient, container, btnPrimary } from "./marketing/theme";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/about", label: "À propos" },
  { href: "/pricing", label: "Prix" },
  { href: "/contact", label: "Contact" },
];

export default function FloatingHeader() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 40));

  return (
    <motion.header
      initial={false}
      animate={{
        backgroundColor: scrolled ? "rgba(5,1,15,0.7)" : "rgba(5,1,15,0)",
        borderColor: scrolled ? colors.border : "rgba(255,255,255,0)",
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        borderBottom: "1px solid",
        backdropFilter: scrolled ? "blur(16px)" : "blur(0px)",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "blur(0px)",
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
          className="staro-floating-nav-desktop"
        >
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{ color: colors.textSecondary, textDecoration: "none", fontSize: 14, fontWeight: 700 }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 18 }} className="staro-floating-cta-desktop">
          <Link href="/sign-in" style={{ color: colors.textSecondary, textDecoration: "none", fontSize: 14, fontWeight: 700 }}>
            Se connecter
          </Link>
          <Link href="/reserver-un-appel" style={{ ...btnPrimary, padding: "10px 20px", fontSize: 14 }}>
            Réserver un appel
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="staro-floating-burger"
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
            background: "rgba(5,1,15,0.92)",
            backdropFilter: "blur(16px)",
          }}
        >
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{ color: colors.textSecondary, textDecoration: "none", fontSize: 15, fontWeight: 700 }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/sign-in"
            onClick={() => setOpen(false)}
            style={{ color: colors.textSecondary, textDecoration: "none", fontSize: 15, fontWeight: 700 }}
          >
            Se connecter
          </Link>
          <Link href="/reserver-un-appel" onClick={() => setOpen(false)} style={{ ...btnPrimary, textAlign: "center" }}>
            Réserver un appel
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .staro-floating-nav-desktop, .staro-floating-cta-desktop { display: none !important; }
          .staro-floating-burger { display: flex !important; align-items: center; justify-content: center; }
        }
      `}</style>
    </motion.header>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const overlayStyle: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 };
const boxStyle: React.CSSProperties = { background: "#111", border: "1px solid #2a1a3e", borderRadius: 20, padding: 32, maxWidth: 440, textAlign: "center" };
const titleStyle: React.CSSProperties = { color: "#fff", fontSize: 19, fontWeight: 900, margin: "0 0 12px" };
const textStyle: React.CSSProperties = { color: "#aaa", fontSize: 14, lineHeight: 1.6, margin: "0 0 20px" };
const actionsStyle: React.CSSProperties = { display: "flex", gap: 10, justifyContent: "center" };
const laterBtnStyle: React.CSSProperties = { padding: "10px 18px", borderRadius: 12, border: "1px solid #2a1a3e", background: "transparent", color: "#ccc", fontWeight: 700, cursor: "pointer", fontSize: 14 };
const subscribeBtnStyle: React.CSSProperties = { padding: "10px 18px", borderRadius: 12, border: "none", background: "#6b1fad", color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 14, textDecoration: "none", display: "inline-block" };

export default function SubscribeModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("staro_subscribe_dismissed")) return;
    fetch("/api/dashboard/subscription")
      .then((r) => (r.ok ? r.json() : null))
      .then((sub) => {
        const isActive = sub?.status === "active" || sub?.status === "trialing";
        if (!isActive) setShow(true);
      })
      .catch(() => {});
  }, []);

  function dismiss() {
    sessionStorage.setItem("staro_subscribe_dismissed", "1");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div style={overlayStyle}>
      <div style={boxStyle}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📞</div>
        <h2 style={titleStyle}>Activez votre assistant vocal</h2>
        <p style={textStyle}>
          Votre compte est approuve, mais votre assistant ne repondra aux appels qu'une fois votre abonnement demarre.
          Essai gratuit de 7 jours inclus, aucun prelevement immediat.
        </p>
        <div style={actionsStyle}>
          <button onClick={dismiss} style={laterBtnStyle}>Plus tard</button>
          <Link href="/dashboard/settings" onClick={dismiss} style={subscribeBtnStyle}>S'abonner</Link>
        </div>
      </div>
    </div>
  );
}

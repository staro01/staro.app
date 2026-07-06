"use client";

import { useState } from "react";
import FloatingHeader from "../../components/FloatingHeader";
import PageHero from "../../components/marketing/PageHero";
import Footer from "../../components/marketing/Footer";
import { colors, card, btnPrimary } from "../../components/marketing/theme";
import { useToast } from "../../components/Toast";

export default function ContactPage() {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "contact", name, email, message }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      showToast("Une erreur est survenue, réessayez plus tard.", "error");
    } finally {
      setSending(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: colors.bg,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    padding: "12px 14px",
    color: colors.text,
    fontSize: 14,
    boxSizing: "border-box",
  };

  return (
    <div style={{ background: colors.bg }}>
      <FloatingHeader />

      <PageHero>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 900, color: colors.text, margin: "0 0 12px" }}>
              Réservez un appel
            </h1>
            <p style={{ color: colors.textMuted, fontSize: 16, lineHeight: 1.6, margin: 0 }}>
              Parlons de votre commerce — nous vous répondons rapidement.
            </p>
          </div>

          <div style={{ ...card, padding: 32 }}>
            {sent ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
                <h2 style={{ color: colors.text, fontSize: 18, fontWeight: 900, margin: "0 0 10px" }}>Message envoyé</h2>
                <p style={{ color: colors.textMuted, fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                  Merci ! Notre équipe vous recontacte très vite.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <label style={{ display: "block", color: colors.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                    Nom
                  </label>
                  <input required value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="Votre nom" />
                </div>
                <div>
                  <label style={{ display: "block", color: colors.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={inputStyle}
                    placeholder="vous@exemple.com"
                  />
                </div>
                <div>
                  <label style={{ display: "block", color: colors.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                    Message
                  </label>
                  <textarea
                    required
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={5}
                    style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
                    placeholder="Parlez-nous de votre commerce et de vos besoins..."
                  />
                </div>
                <button type="submit" disabled={sending} style={{ ...btnPrimary, opacity: sending ? 0.6 : 1, border: "none" }}>
                  {sending ? "Envoi..." : "Envoyer"}
                </button>
              </form>
            )}
          </div>
        </div>
      </PageHero>

      <Footer />
    </div>
  );
}

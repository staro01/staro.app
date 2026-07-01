"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STEPS = ["Bienvenue", "Votre établissement", "Votre carte", "C'est prêt !"];
const CATEGORIES = ["plat principal", "boisson", "dessert", "entrée", "service", "autre"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [items, setItems] = useState([{ name: "", price: "", category: "plat principal" }]);

  async function saveSettings() {
    if (!name.trim()) return alert("Le nom est obligatoire.");
    setSaving(true);
    await fetch("/api/dashboard/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, address }),
    });
    setSaving(false);
    setStep(2);
  }

  async function saveMenu() {
    const valid = items.filter(i => i.name.trim() && parseFloat(i.price) > 0);
    if (valid.length === 0) return alert("Ajoutez au moins un article.");
    setSaving(true);
    for (const item of valid) {
      await fetch("/api/dashboard/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: item.name, price: parseFloat(item.price), category: item.category, available: true }),
      });
    }
    setSaving(false);
    setStep(3);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 520, background: "#111", border: "1px solid #2a1a3e", borderRadius: 24, padding: 36 }}>
        
        {/* Progress */}
        <div style={{ display: "flex", gap: 6, marginBottom: 32 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= step ? "#6b1fad" : "#2a1a3e", transition: "background 0.3s" }} />
          ))}
        </div>

        {step === 0 && (
          <div>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✦</div>
            <h1 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 12px", color: "#fff" }}>Bienvenue sur Staro.app !</h1>
            <p style={{ color: "#888", lineHeight: 1.6, margin: "0 0 24px" }}>En 2 minutes, configurez votre assistant vocal qui répondra au téléphone à votre place, 7j/7.</p>
            <div style={{ background: "#1a1a2e", border: "1px solid #2a1a3e", borderRadius: 14, padding: 16, marginBottom: 28 }}>
              <p style={{ margin: 0, fontSize: 14, color: "#aaa", lineHeight: 1.8 }}>
                ✅ Vos informations<br />
                ✅ Vos articles ou services<br />
                ✅ Votre assistant est prêt !
              </p>
            </div>
            <button onClick={() => setStep(1)} style={btnFull}>Commencer →</button>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 20px", color: "#fff" }}>Votre établissement</h2>
            <div style={{ display: "grid", gap: 14 }}>
              <label style={labelStyle}>Nom *<input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="Ex: La Bella Pizza, Salon Marie..." /></label>
              <label style={labelStyle}>Téléphone<input value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} placeholder="04 90 XX XX XX" /></label>
              <label style={labelStyle}>Adresse<input value={address} onChange={e => setAddress(e.target.value)} style={inputStyle} /></label>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button onClick={() => setStep(0)} style={btnSecondary}>← Retour</button>
              <button onClick={saveSettings} disabled={saving} style={btnFull}>{saving ? "…" : "Continuer →"}</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 8px", color: "#fff" }}>Vos articles ou services</h2>
            <p style={{ color: "#666", fontSize: 14, margin: "0 0 20px" }}>Ajoutez ce que vous proposez — vous pourrez modifier ça plus tard.</p>
            <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
              {items.map((item, idx) => (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px 32px", gap: 8 }}>
                  <input value={item.name} onChange={e => setItems(items.map((it, i) => i === idx ? { ...it, name: e.target.value } : it))} style={inputStyle} placeholder="Nom" />
                  <input type="number" value={item.price} onChange={e => setItems(items.map((it, i) => i === idx ? { ...it, price: e.target.value } : it))} style={inputStyle} placeholder="Prix €" />
                  <select value={item.category} onChange={e => setItems(items.map((it, i) => i === idx ? { ...it, category: e.target.value } : it))} style={inputStyle}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button onClick={() => items.length > 1 && setItems(items.filter((_, i) => i !== idx))} style={{ background: "none", border: "none", cursor: "pointer", color: "#555", fontSize: 16 }}>✕</button>
                </div>
              ))}
            </div>
            <button onClick={() => setItems([...items, { name: "", price: "", category: "plat principal" }])} style={{ ...btnSecondary, fontSize: 13, padding: "7px 14px", marginBottom: 20 }}>+ Ajouter</button>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(1)} style={btnSecondary}>← Retour</button>
              <button onClick={saveMenu} disabled={saving} style={btnFull}>{saving ? "…" : "Terminer →"}</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 12px", color: "#fff" }}>Votre assistant est prêt !</h2>
            <p style={{ color: "#888", lineHeight: 1.6, margin: "0 0 28px" }}>Vos informations et vos articles sont configurés. Notre équipe va vous contacter pour finaliser l'installation.</p>
            <button onClick={() => router.push("/dashboard")} style={btnFull}>Accéder à mon espace →</button>
          </div>
        )}
      </div>
    </div>
  );
}

const btnFull: React.CSSProperties = { padding: "12px 22px", borderRadius: 12, border: "none", background: "#6b1fad", color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 15, width: "100%" };
const btnSecondary: React.CSSProperties = { padding: "12px 22px", borderRadius: 12, border: "1px solid #2a1a3e", background: "transparent", color: "#ccc", fontWeight: 700, cursor: "pointer", fontSize: 15 };
const inputStyle: React.CSSProperties = { padding: "9px 12px", borderRadius: 10, border: "1px solid #2a1a3e", background: "#0a0a0a", color: "#fff", fontSize: 14, width: "100%", boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 5, fontSize: 13, fontWeight: 600, color: "#aaa" };

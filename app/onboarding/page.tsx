"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STEPS = ["Bienvenue", "Votre établissement", "Votre carte", "C'est prêt !"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [items, setItems] = useState([{ name: "", price: "", category: "pizza" }]);

  async function saveSettings() {
    if (!name.trim()) return alert("Le nom est obligatoire.");
    setSaving(true);
    await fetch("/api/dashboard/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, phone, address }) });
    setSaving(false);
    setStep(2);
  }

  async function saveMenu() {
    const valid = items.filter(i => i.name.trim() && parseFloat(i.price) > 0);
    if (valid.length === 0) return alert("Ajoutez au moins un article.");
    setSaving(true);
    for (const item of valid) {
      await fetch("/api/dashboard/menu", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: item.name, price: parseFloat(item.price), category: item.category, available: true }) });
    }
    setSaving(false);
    setStep(3);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 520, background: "#fff", borderRadius: 24, padding: 36, boxShadow: "0 2px 20px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 32 }}>
          {STEPS.map((_, i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= step ? "#111" : "#eee", transition: "background 0.3s" }} />)}
        </div>

        {step === 0 && (
          <div>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
            <h1 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 12px" }}>Bienvenue sur Staro.app !</h1>
            <p style={{ color: "#666", lineHeight: 1.6, margin: "0 0 24px" }}>En 2 minutes, configurez votre assistant vocal qui répondra au téléphone à votre place.</p>
            <div style={{ background: "#f5f5f5", borderRadius: 14, padding: 16, marginBottom: 28 }}>
              <p style={{ margin: 0, fontSize: 14, color: "#555", lineHeight: 1.8 }}>✅ Vos informations<br />✅ Votre carte<br />✅ Votre IA est prête !</p>
            </div>
            <button onClick={() => setStep(1)} style={btnFull}>Commencer →</button>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 20px" }}>Votre établissement</h2>
            <div style={{ display: "grid", gap: 14 }}>
              <label style={labelStyle}>Nom *<input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="Ex: La Bella Pizza" /></label>
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
            <h2 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 8px" }}>Votre carte</h2>
            <p style={{ color: "#888", fontSize: 14, margin: "0 0 20px" }}>Ajoutez vos articles (vous pourrez en ajouter d'autres plus tard).</p>
            <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
              {items.map((item, idx) => (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 80px 90px 32px", gap: 8 }}>
                  <input value={item.name} onChange={e => setItems(items.map((it, i) => i === idx ? { ...it, name: e.target.value } : it))} style={inputStyle} placeholder="Nom" />
                  <input type="number" value={item.price} onChange={e => setItems(items.map((it, i) => i === idx ? { ...it, price: e.target.value } : it))} style={inputStyle} placeholder="Prix" />
                  <select value={item.category} onChange={e => setItems(items.map((it, i) => i === idx ? { ...it, category: e.target.value } : it))} style={inputStyle}>
                    <option value="pizza">Pizza</option>
                    <option value="boisson">Boisson</option>
                    <option value="dessert">Dessert</option>
                    <option value="entrée">Entrée</option>
                  </select>
                  <button onClick={() => items.length > 1 && setItems(items.filter((_, i) => i !== idx))} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc" }}>✕</button>
                </div>
              ))}
            </div>
            <button onClick={() => setItems([...items, { name: "", price: "", category: "pizza" }])} style={{ ...btnSecondary, fontSize: 13, padding: "7px 14px", marginBottom: 20 }}>+ Ajouter</button>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(1)} style={btnSecondary}>← Retour</button>
              <button onClick={saveMenu} disabled={saving} style={btnFull}>{saving ? "…" : "Terminer →"}</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 12px" }}>Votre assistant est prêt !</h2>
            <p style={{ color: "#666", lineHeight: 1.6, margin: "0 0 28px" }}>Votre carte et vos infos sont configurées. Votre assistant vocal peut maintenant prendre les commandes.</p>
            <button onClick={() => router.push("/dashboard")} style={btnFull}>Accéder à mon dashboard →</button>
          </div>
        )}
      </div>
    </div>
  );
}

const btnFull: React.CSSProperties = { padding: "12px 22px", borderRadius: 12, border: "none", background: "#111", color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 15, width: "100%" };
const btnSecondary: React.CSSProperties = { padding: "12px 22px", borderRadius: 12, border: "1px solid #ddd", background: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15 };
const inputStyle: React.CSSProperties = { padding: "9px 12px", borderRadius: 10, border: "1px solid #ddd", fontSize: 14, width: "100%", boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 5, fontSize: 13, fontWeight: 600, color: "#444" };

"use client";

import { useEffect, useState } from "react";

type Business = {
  id: string;
  name: string;
  vertical: string;
  twilioNumber?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  status: string;
  _count: { menuItems: number; events: number };
};

const VERTICALS = ["pizzeria", "coiffeur", "restaurant", "artisan", "hotel", "autre"];

const emptyBusiness = () => ({ name: "", vertical: "pizzeria", twilioNumber: "", phone: "", address: "" });

export default function AdminPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/businesses");
    const data = await res.json();
    setBusinesses(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing.name.trim()) return alert("Nom obligatoire.");
    setSaving(true);
    const res = await fetch("/api/admin/businesses" + (editing.id ? `/${editing.id}` : ""), {
      method: editing.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    if (res.ok) { setEditing(null); await load(); }
    else alert("Erreur lors de la sauvegarde.");
    setSaving(false);
  }

  async function setStatus(id: string, status: string) {
    await fetch(`/api/admin/businesses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  async function deleteBusiness(id: string, name: string) {
    if (!confirm(`Supprimer "${name}" ? Cette action est irréversible.`)) return;
    await fetch(`/api/admin/businesses/${id}`, { method: "DELETE" });
    await load();
  }

  const verticalEmoji: Record<string, string> = {
    pizzeria: "🍕", coiffeur: "✂️", restaurant: "🍽️", artisan: "🔧", hotel: "🏨", autre: "⭐"
  };

  const sortedBusinesses = [...businesses].sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    return 0;
  });

  const pendingCount = businesses.filter(b => b.status === "pending").length;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", padding: 20 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ background: "linear-gradient(135deg, #6b1fad, #9b4fdd)", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✦</span>
              <span style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>Staro.app — Admin</span>
            </div>
            <p style={{ color: "#666", fontSize: 13, margin: 0 }}>Gestion des clients</p>
          </div>
          <button onClick={() => setEditing(emptyBusiness())} style={btnPrimary}>+ Nouveau client</button>
        </div>

        {pendingCount > 0 && (
          <div style={{ background: "#2e2414", border: "1px solid #b8860b", borderRadius: 14, padding: "12px 18px", marginBottom: 20, color: "#f0c674", fontSize: 14, fontWeight: 700 }}>
            ⏳ {pendingCount} compte{pendingCount > 1 ? "s" : ""} en attente d'approbation
          </div>
        )}

        {loading ? <p style={{ color: "#666" }}>Chargement…</p> : businesses.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#555" }}>
            <p style={{ fontSize: 18 }}>Aucun client pour l'instant.</p>
            <button onClick={() => setEditing(emptyBusiness())} style={btnPrimary}>Créer le premier client</button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {sortedBusinesses.map(b => {
              const isPending = b.status === "pending";
              return (
              <div key={b.id} style={{
                border: isPending ? "1px solid #b8860b" : "1px solid #2a1a3e", borderRadius: 16, padding: "16px 20px",
                background: isPending ? "#1a1608" : "#111", display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 20 }}>{verticalEmoji[b.vertical] ?? "⭐"}</span>
                    <span style={{ fontWeight: 900, fontSize: 16, color: "#fff" }}>{b.name}</span>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "#2a1a3e", color: "#9b4fdd", fontWeight: 700 }}>{b.vertical}</span>
                    {isPending ? (
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "#b8860b", color: "#1a1608", fontWeight: 800 }}>⏳ EN ATTENTE</span>
                    ) : (
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "#1a3e2a", color: "#4ade80", fontWeight: 800 }}>✓ APPROUVÉ</span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#666" }}>
                    {b.twilioNumber && <span>📞 {b.twilioNumber}</span>}
                    {b.phone && <span>☎️ {b.phone}</span>}
                    {b.address && <span>📍 {b.address}</span>}
                    <span>🍽️ {b._count.menuItems} articles</span>
                    <span>📋 {b._count.events} événements</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {isPending && (
                    <button onClick={() => setStatus(b.id, "approved")} style={{ ...btnPrimary, background: "#1a8a3e" }}>✓ Approuver</button>
                  )}
                  <button onClick={() => setEditing({ ...b })} style={btnSmall}>✏️ Modifier</button>
                  <button onClick={() => deleteBusiness(b.id, b.name)} style={{ ...btnSmall, color: "#ff6b6b", borderColor: "#5a1a1a" }}>🗑️</button>
                </div>
              </div>
              );
            })}
          </div>
        )}

        {editing && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
            <div style={{ background: "#111", border: "1px solid #2a1a3e", borderRadius: 20, padding: 28, width: "100%", maxWidth: 480, display: "grid", gap: 14 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#fff" }}>{editing.id ? "Modifier" : "Nouveau"} client</h2>
              
              <label style={labelStyle}>Nom *<input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} style={inputStyle} placeholder="Ex: La Bella Pizza" /></label>
              
              <label style={labelStyle}>Vertical
                <select value={editing.vertical} onChange={e => setEditing({ ...editing, vertical: e.target.value })} style={inputStyle}>
                  {VERTICALS.map(v => <option key={v} value={v}>{verticalEmoji[v]} {v}</option>)}
                </select>
              </label>

              <label style={labelStyle}>Numéro Twilio (ex: +33948353853)<input value={editing.twilioNumber ?? ""} onChange={e => setEditing({ ...editing, twilioNumber: e.target.value })} style={inputStyle} placeholder="+33..." /></label>
              
              <label style={labelStyle}>Téléphone du client<input value={editing.phone ?? ""} onChange={e => setEditing({ ...editing, phone: e.target.value })} style={inputStyle} /></label>
              
              <label style={labelStyle}>Adresse<input value={editing.address ?? ""} onChange={e => setEditing({ ...editing, address: e.target.value })} style={inputStyle} /></label>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
                <button onClick={() => setEditing(null)} style={btnSecondary}>Annuler</button>
                <button onClick={save} disabled={saving} style={btnPrimary}>{saving ? "…" : "Sauvegarder"}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const btnPrimary: React.CSSProperties = { padding: "10px 18px", borderRadius: 12, border: "none", background: "#6b1fad", color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 14 };
const btnSecondary: React.CSSProperties = { padding: "10px 18px", borderRadius: 12, border: "1px solid #2a1a3e", background: "transparent", color: "#ccc", fontWeight: 700, cursor: "pointer", fontSize: 14 };
const btnSmall: React.CSSProperties = { padding: "6px 12px", borderRadius: 10, border: "1px solid #2a1a3e", background: "#1a1a2e", fontWeight: 700, cursor: "pointer", fontSize: 13, color: "#ccc" };
const inputStyle: React.CSSProperties = { padding: "8px 12px", borderRadius: 10, border: "1px solid #2a1a3e", background: "#0a0a0a", color: "#fff", fontSize: 14, width: "100%", boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 5, fontSize: 13, fontWeight: 600, color: "#aaa" };

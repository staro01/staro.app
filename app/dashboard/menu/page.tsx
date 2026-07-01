"use client";

import { useEffect, useState } from "react";

type MenuItem = { id?: string; category: string; name: string; description?: string; price: number; available: boolean; };
type Supplement = { id?: string; name: string; price: number; available: boolean; };

const CATEGORIES = ["pizza", "boisson", "dessert", "entrée", "autre"];

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingSupplement, setEditingSupplement] = useState<Supplement | null>(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"carte" | "supplements">("carte");

  async function load() {
    setLoading(true);
    const [r1, r2] = await Promise.all([fetch("/api/dashboard/menu"), fetch("/api/dashboard/supplements")]);
    setItems(await r1.json());
    setSupplements(await r2.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function saveItem() {
    if (!editingItem?.name.trim()) return alert("Nom obligatoire.");
    setSaving(true);
    await fetch("/api/dashboard/menu" + (editingItem.id ? `/${editingItem.id}` : ""), {
      method: editingItem.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingItem),
    });
    setEditingItem(null); await load(); setSaving(false);
  }

  async function saveSupplement() {
    if (!editingSupplement?.name.trim()) return alert("Nom obligatoire.");
    setSaving(true);
    await fetch("/api/dashboard/supplements" + (editingSupplement.id ? `/${editingSupplement.id}` : ""), {
      method: editingSupplement.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingSupplement),
    });
    setEditingSupplement(null); await load(); setSaving(false);
  }

  async function toggleItem(item: MenuItem) {
    await fetch(`/api/dashboard/menu/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ available: !item.available }) });
    await load();
  }

  async function deleteItem(item: MenuItem) {
    if (!confirm(`Supprimer "${item.name}" ?`)) return;
    await fetch(`/api/dashboard/menu/${item.id}`, { method: "DELETE" });
    await load();
  }

  async function toggleSupplement(s: Supplement) {
    await fetch(`/api/dashboard/supplements/${s.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ available: !s.available }) });
    await load();
  }

  async function deleteSupplement(s: Supplement) {
    if (!confirm(`Supprimer "${s.name}" ?`)) return;
    await fetch(`/api/dashboard/supplements/${s.id}`, { method: "DELETE" });
    await load();
  }

  const byCategory = CATEGORIES.map(cat => ({ cat, items: items.filter(i => i.category === cat) })).filter(g => g.items.length > 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>🍽️ Ma carte</h1>
        <button onClick={() => tab === "carte" ? setEditingItem({ category: "pizza", name: "", description: "", price: 0, available: true }) : setEditingSupplement({ name: "", price: 0, available: true })} style={btnPrimary}>
          + Ajouter {tab === "carte" ? "un article" : "un supplément"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <button onClick={() => setTab("carte")} style={tab === "carte" ? tabActive : tabInactive}>📋 Articles ({items.length})</button>
        <button onClick={() => setTab("supplements")} style={tab === "supplements" ? tabActive : tabInactive}>➕ Suppléments ({supplements.length})</button>
      </div>

      {loading ? <p>Chargement…</p> : tab === "carte" ? (
        items.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#999" }}>
            <p>Votre carte est vide.</p>
            <button onClick={() => setEditingItem({ category: "pizza", name: "", price: 0, available: true })} style={btnPrimary}>Ajouter un article</button>
          </div>
        ) : byCategory.map(({ cat, items: catItems }) => (
          <div key={cat} style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, textTransform: "capitalize", marginBottom: 10, color: "#555" }}>{cat}s</h2>
            <div style={{ display: "grid", gap: 8 }}>
              {catItems.map(item => (
                <div key={item.id} style={{ border: "1px solid #eee", borderRadius: 14, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", opacity: item.available ? 1 : 0.5 }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{item.name} {!item.available && <span style={{ fontSize: 11, color: "#e05", background: "#fff0f0", padding: "2px 7px", borderRadius: 99 }}>Indisponible</span>}</div>
                    {item.description && <div style={{ fontSize: 13, color: "#777" }}>{item.description}</div>}
                    <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{item.price}€</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => toggleItem(item)} style={btnSmall}>{item.available ? "🔴 Rupture" : "🟢 Dispo"}</button>
                    <button onClick={() => setEditingItem({ ...item })} style={btnSmall}>✏️</button>
                    <button onClick={() => deleteItem(item)} style={{ ...btnSmall, color: "#c00" }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        supplements.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#999" }}>
            <p>Aucun supplément configuré.</p>
            <button onClick={() => setEditingSupplement({ name: "", price: 0, available: true })} style={btnPrimary}>Ajouter un supplément</button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {supplements.map(s => (
              <div key={s.id} style={{ border: "1px solid #eee", borderRadius: 14, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", opacity: s.available ? 1 : 0.5 }}>
                <div>
                  <div style={{ fontWeight: 800 }}>{s.name}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{s.price > 0 ? `+${s.price}€` : "Gratuit"}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => toggleSupplement(s)} style={btnSmall}>{s.available ? "🔴 Indispo" : "🟢 Dispo"}</button>
                  <button onClick={() => setEditingSupplement({ ...s })} style={btnSmall}>✏️</button>
                  <button onClick={() => deleteSupplement(s)} style={{ ...btnSmall, color: "#c00" }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {editingItem && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 28, width: "100%", maxWidth: 440, display: "grid", gap: 14 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>{editingItem.id ? "Modifier" : "Ajouter"} un article</h2>
            <label style={labelStyle}>Catégorie<select value={editingItem.category} onChange={e => setEditingItem({ ...editingItem, category: e.target.value })} style={inputStyle}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></label>
            <label style={labelStyle}>Nom *<input value={editingItem.name} onChange={e => setEditingItem({ ...editingItem, name: e.target.value })} style={inputStyle} placeholder="Ex: Margherita" /></label>
            <label style={labelStyle}>Description<input value={editingItem.description ?? ""} onChange={e => setEditingItem({ ...editingItem, description: e.target.value })} style={inputStyle} /></label>
            <label style={labelStyle}>Prix (€)<input type="number" value={editingItem.price} onChange={e => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })} style={inputStyle} /></label>
            <label style={{ ...labelStyle, flexDirection: "row", alignItems: "center", gap: 10 }}><input type="checkbox" checked={editingItem.available} onChange={e => setEditingItem({ ...editingItem, available: e.target.checked })} />Disponible</label>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setEditingItem(null)} style={btnSecondary}>Annuler</button>
              <button onClick={saveItem} disabled={saving} style={btnPrimary}>{saving ? "…" : "Sauvegarder"}</button>
            </div>
          </div>
        </div>
      )}

      {editingSupplement && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 28, width: "100%", maxWidth: 380, display: "grid", gap: 14 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>{editingSupplement.id ? "Modifier" : "Ajouter"} un supplément</h2>
            <label style={labelStyle}>Nom *<input value={editingSupplement.name} onChange={e => setEditingSupplement({ ...editingSupplement, name: e.target.value })} style={inputStyle} placeholder="Ex: Mozzarella supplémentaire" /></label>
            <label style={labelStyle}>Prix (€)<input type="number" step="0.5" value={editingSupplement.price} onChange={e => setEditingSupplement({ ...editingSupplement, price: parseFloat(e.target.value) || 0 })} style={inputStyle} /></label>
            <label style={{ ...labelStyle, flexDirection: "row", alignItems: "center", gap: 10 }}><input type="checkbox" checked={editingSupplement.available} onChange={e => setEditingSupplement({ ...editingSupplement, available: e.target.checked })} />Disponible</label>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setEditingSupplement(null)} style={btnSecondary}>Annuler</button>
              <button onClick={saveSupplement} disabled={saving} style={btnPrimary}>{saving ? "…" : "Sauvegarder"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const btnPrimary: React.CSSProperties = { padding: "10px 18px", borderRadius: 12, border: "none", background: "#6b1fad", color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 14 };
const btnSecondary: React.CSSProperties = { padding: "10px 18px", borderRadius: 12, border: "1px solid #ddd", background: "#1a1a2e", fontWeight: 700, cursor: "pointer", fontSize: 14, color: "#ccc" };
const btnSmall: React.CSSProperties = { padding: "6px 12px", borderRadius: 10, border: "1px solid #eee", background: "#1a1a2e", fontWeight: 700, cursor: "pointer", fontSize: 13, color: "#ccc" };
const inputStyle: React.CSSProperties = { padding: "8px 12px", borderRadius: 10, border: "1px solid #2a1a3e", background: "#0a0a0a", color: "#fff", fontSize: 14, width: "100%", boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 5, fontSize: 13, fontWeight: 600, color: "#aaa" };
const tabActive: React.CSSProperties = { padding: "8px 16px", borderRadius: 10, border: "none", background: "#6b1fad", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 };
const tabInactive: React.CSSProperties = { padding: "8px 16px", borderRadius: 10, border: "1px solid #2a1a3e", background: "#1a1a2e", fontWeight: 700, cursor: "pointer", fontSize: 14 };

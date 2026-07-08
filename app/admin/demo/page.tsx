"use client";

import { useEffect, useState, type CSSProperties } from "react";

type Item = { name: string; price: number; category?: string; duration?: number };

const inputStyle: CSSProperties = {
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid #333",
  background: "#111",
  color: "#fff",
};

export default function DemoAdminPage() {
  const [slot, setSlot] = useState<"commercial" | "interne">("interne");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [vertical, setVertical] = useState<"pizzeria" | "coiffeur" | "paysagiste" | "electricien">("pizzeria");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [openingHours, setOpeningHours] = useState<string[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const NO_CATALOG_VERTICALS = ["paysagiste", "electricien", "plombier"];
  const hasCatalog = !NO_CATALOG_VERTICALS.includes(vertical);

  useEffect(() => {
    fetch(`/api/admin/demo?slot=${slot}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((b) => {
        if (!b) return;
        setName(b.name ?? "");
        setVertical(["pizzeria", "coiffeur", "paysagiste", "electricien"].includes(b.vertical) ? b.vertical : "pizzeria");
        setPhone(b.phone ?? "");
        setAddress(b.address ?? "");
        setCustomerEmail(b.customerEmail ?? "");
        setOpeningHours(Array.isArray(b.openingHours) ? b.openingHours : []);
        const source = b.vertical === "coiffeur" ? b.services : b.menuItems;
        setItems(
          (source ?? []).map((i: any) => ({
            name: i.name,
            price: i.price,
            category: i.category,
            duration: i.duration,
          }))
        );
      })
      .catch(() => {});
  }, [slot]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/demo/lookup-place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      setName(data.name);
      setVertical(data.suggestedVertical);
      setPhone(data.phone ?? "");
      setAddress(data.address ?? "");
      setOpeningHours(data.openingHours ?? []);
      setItems([]);
      setSaved(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      vertical === "coiffeur" ? { name: "", price: 0, duration: 30 } : { name: "", price: 0, category: "Plats" },
    ]);

  const updateItem = (index: number, patch: Partial<Item>) =>
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));

  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const payload: any = { slot, name, vertical, phone, address, openingHours, customerEmail };
      if (vertical === "coiffeur") payload.services = items;
      if (vertical === "pizzeria") payload.menuItems = items;

      const res = await fetch("/api/admin/demo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px", color: "#fff", background: "#0a0a0f", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Configuration de la démo</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <button
          onClick={() => setSlot("interne")}
          style={{
            padding: "8px 16px", borderRadius: 8, border: `1px solid ${slot === "interne" ? "#7e22ce" : "#333"}`,
            background: slot === "interne" ? "#2a1a3e" : "#111", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13,
          }}
        >
          🧪 Interne (tests)
        </button>
        <button
          onClick={() => setSlot("commercial")}
          style={{
            padding: "8px 16px", borderRadius: 8, border: `1px solid ${slot === "commercial" ? "#d97706" : "#333"}`,
            background: slot === "commercial" ? "#3a2a10" : "#111", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13,
          }}
        >
          🤝 Commercial (prospects)
        </button>
      </div>

      {slot === "commercial" && (
        <div style={{ background: "#3a2a10", border: "1px solid #d97706", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: "#fbbf24" }}>
          ⚠️ Numéro utilisé pour les démos prospects — vérifie qu'aucun appel commercial n'est en cours avant d'enregistrer.
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nom du commerce (ex: Pizzeria Le Napoli Avignon)"
          style={{ ...inputStyle, flex: 1 }}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: "#7e22ce", color: "#fff", fontWeight: 700, cursor: "pointer" }}
        >
          {loading ? "Recherche..." : "Rechercher"}
        </button>
      </div>

      {error && <div style={{ color: "#f87171", marginBottom: 16 }}>{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "#aaa" }}>
          Nom
          <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "#aaa" }}>
          Secteur
          <select value={vertical} onChange={(e) => setVertical(e.target.value as any)} style={inputStyle}>
            <option value="pizzeria">Restauration à emporter</option>
            <option value="coiffeur">Coiffure & institut</option>
            <option value="paysagiste">Paysagiste</option>
          <option value="electricien">Électricien</option>
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "#aaa" }}>
          Téléphone
          <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "#aaa" }}>
          Adresse
          <input value={address} onChange={(e) => setAddress(e.target.value)} style={inputStyle} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "#aaa", gridColumn: "1 / -1" }}>
          Email pour recevoir les rapports/demandes
          <input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} style={inputStyle} placeholder="toi@exemple.fr" />
        </label>
      </div>

      {openingHours.length > 0 && (
        <div style={{ marginBottom: 24, fontSize: 13, color: "#aaa" }}>
          <div style={{ marginBottom: 6, fontWeight: 700, color: "#fff" }}>Horaires récupérés</div>
          {openingHours.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}

      {hasCatalog && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontWeight: 700 }}>{vertical === "coiffeur" ? "Prestations" : "Carte"}</div>
            <button
              onClick={addItem}
              style={{ background: "none", border: "1px solid #444", color: "#fff", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}
            >
              + Ajouter
            </button>
          </div>

          {items.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <input
                value={item.name}
                onChange={(e) => updateItem(i, { name: e.target.value })}
                placeholder={vertical === "coiffeur" ? "Ex: Coupe homme" : "Ex: Pizza Reine"}
                style={{ ...inputStyle, flex: 2 }}
              />
              {vertical === "coiffeur" ? (
                <input
                  type="number"
                  value={item.duration ?? 30}
                  onChange={(e) => updateItem(i, { duration: Number(e.target.value) })}
                  placeholder="Durée (min)"
                  style={{ ...inputStyle, flex: 1 }}
                />
              ) : (
                <input
                  value={item.category ?? ""}
                  onChange={(e) => updateItem(i, { category: e.target.value })}
                  placeholder="Catégorie"
                  style={{ ...inputStyle, flex: 1 }}
                />
              )}
              <input
                type="number"
                value={item.price}
                onChange={(e) => updateItem(i, { price: Number(e.target.value) })}
                placeholder="Prix €"
                style={{ ...inputStyle, flex: 1 }}
              />
              <button onClick={() => removeItem(i)} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 16 }}>
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {!hasCatalog && (
        <div style={{ marginBottom: 16, fontSize: 13, color: "#888" }}>
          Ce secteur n&apos;a pas de catalogue — l&apos;agent qualifie la demande en conversation libre.
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving || !name}
        style={{ padding: "12px 24px", borderRadius: 8, border: "none", background: "#7e22ce", color: "#fff", fontWeight: 700, cursor: "pointer" }}
      >
        {saving ? "Enregistrement..." : "Enregistrer la démo"}
      </button>

      {saved && <div style={{ color: "#4ade80", marginTop: 12 }}>Fiche démo mise à jour.</div>}
    </div>
  );
}

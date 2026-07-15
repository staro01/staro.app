"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Business = {
  id: string;
  name: string;
  vertical: string;
  twilioNumber?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  status: string;
  customerEmail?: string | null;
  subscriptionStatus?: string | null;
  subscriptionPlan?: string | null;
  stripeCustomerId?: string | null;
  trialEndsAt?: string | null;
  lastActivityAt?: string | null;
  _count: { menuItems: number; events: number };
};

const VERTICALS = ["pizzeria", "coiffeur", "paysagiste", "electricien", "plombier", "chauffagiste", "restaurant", "artisan", "hotel", "autre"];

const emptyBusiness = () => ({ name: "", vertical: "pizzeria", twilioNumber: "", phone: "", address: "" });

const SUBSCRIPTION_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  active: { label: "✓ Abonné actif", bg: "#1a3e2a", color: "#4ade80" },
  trialing: { label: "✓ Essai en cours", bg: "#1a3e2a", color: "#4ade80" },
  past_due: { label: "⚠️ Paiement en retard", bg: "#3e2e14", color: "#f0c674" },
  cancelled: { label: "✕ Abonnement annulé", bg: "#3e1a1a", color: "#ff6b6b" },
  canceled: { label: "✕ Abonnement annulé", bg: "#3e1a1a", color: "#ff6b6b" },
  inactive: { label: "— Sans abonnement", bg: "#1a1a2e", color: "#666" },
};

const PLAN_MRR: Record<string, number> = {
  essentiel_monthly: 60,
  essentiel_annual: 660 / 12,
  pro_monthly: 90,
  pro_annual: 990 / 12,
  premium_monthly: 120,
  premium_annual: 1320 / 12,
};

function daysSince(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function formatRelative(dateStr?: string | null): string {
  const days = daysSince(dateStr);
  if (days === null) return "Jamais";
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  return `Il y a ${days} jours`;
}

const PLAN_LABELS: Record<string, string> = {
  essentiel_monthly: "Essentiel · Mensuel",
  essentiel_annual: "Essentiel · Annuel",
  pro_monthly: "Pro · Mensuel",
  pro_annual: "Pro · Annuel",
  premium_monthly: "Premium · Mensuel",
  premium_annual: "Premium · Annuel",
};

export default function AdminPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

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
    pizzeria: "🍕", coiffeur: "✂️", paysagiste: "🌿", electricien: "⚡", plombier: "🔧", chauffagiste: "🔥",
    restaurant: "🍽️", artisan: "🔧", hotel: "🏨", autre: "⭐"
  };

  const filteredBusinesses = businesses.filter(b => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.customerEmail?.toLowerCase().includes(q) ||
      b.phone?.toLowerCase().includes(q) ||
      b.twilioNumber?.toLowerCase().includes(q)
    );
  });

  const sortedBusinesses = [...filteredBusinesses].sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    return 0;
  });

  const pendingCount = businesses.filter(b => b.status === "pending").length;
  const activeSubsCount = businesses.filter(b => b.subscriptionStatus === "active" || b.subscriptionStatus === "trialing").length;

  const mrr = businesses
    .filter(b => b.subscriptionStatus === "active")
    .reduce((sum, b) => sum + (PLAN_MRR[b.subscriptionPlan ?? ""] ?? 0), 0);

  const trialsEndingSoon = businesses.filter(b => {
    if (b.subscriptionStatus !== "trialing" || !b.trialEndsAt) return false;
    const daysLeft = (new Date(b.trialEndsAt).getTime() - Date.now()) / 86400000;
    return daysLeft >= 0 && daysLeft <= 3;
  });

  const brokenProvisioning = businesses.filter(b =>
    (b.subscriptionStatus === "active" || b.subscriptionStatus === "trialing") && !b.twilioNumber
  );

  const dormantActive = businesses.filter(b => {
    if (b.subscriptionStatus !== "active") return false;
    const days = daysSince(b.lastActivityAt);
    return days === null || days > 7;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", padding: 20 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <img src="/logo-badge.png" alt="Staro.app" width={32} height={32} style={{ borderRadius: 8 }} />
              <span style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>Staro.app — Admin</span>
            </div>
            <p style={{ color: "#666", fontSize: 13, margin: 0 }}>Gestion des clients</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Link href="/admin/demo" style={{ ...btnSecondary, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>🎬 Config démo</Link>
            <Link href="/admin/logs" style={{ ...btnSecondary, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>📜 Logs d&apos;audit</Link>
            <button onClick={() => setEditing(emptyBusiness())} style={btnPrimary}>+ Nouveau client</button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ ...statCard, flex: 1, minWidth: 140 }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>{businesses.length}</div>
            <div style={{ fontSize: 12, color: "#888" }}>Clients au total</div>
          </div>
          <div style={{ ...statCard, flex: 1, minWidth: 140 }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#4ade80" }}>{activeSubsCount}</div>
            <div style={{ fontSize: 12, color: "#888" }}>Abonnements actifs</div>
          </div>
          <div style={{ ...statCard, flex: 1, minWidth: 140 }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#9b4fdd" }}>{mrr.toFixed(0)}€</div>
            <div style={{ fontSize: 12, color: "#888" }}>MRR estimé</div>
          </div>
          <div style={{ ...statCard, flex: 1, minWidth: 140 }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#f0c674" }}>{pendingCount}</div>
            <div style={{ fontSize: 12, color: "#888" }}>En attente d&apos;approbation</div>
          </div>
        </div>

        {(trialsEndingSoon.length > 0 || brokenProvisioning.length > 0 || dormantActive.length > 0) && (
          <div style={{ display: "grid", gap: 8, marginBottom: 20 }}>
            {brokenProvisioning.length > 0 && (
              <div style={{ background: "#3e1a1a", border: "1px solid #8a2a2a", borderRadius: 14, padding: "12px 18px", color: "#ff8a8a", fontSize: 14, fontWeight: 700 }}>
                🚨 {brokenProvisioning.length} client{brokenProvisioning.length > 1 ? "s" : ""} abonné{brokenProvisioning.length > 1 ? "s" : ""} sans numéro Twilio — {brokenProvisioning.map(b => b.name).join(", ")}
              </div>
            )}
            {dormantActive.length > 0 && (
              <div style={{ background: "#3e2e14", border: "1px solid #b8860b", borderRadius: 14, padding: "12px 18px", color: "#f0c674", fontSize: 14, fontWeight: 700 }}>
                😴 {dormantActive.length} client{dormantActive.length > 1 ? "s" : ""} actif{dormantActive.length > 1 ? "s" : ""} sans appel depuis plus de 7 jours — {dormantActive.map(b => b.name).join(", ")}
              </div>
            )}
            {trialsEndingSoon.length > 0 && (
              <div style={{ background: "#1a2e3e", border: "1px solid #2a5a8a", borderRadius: 14, padding: "12px 18px", color: "#7ec8f0", fontSize: 14, fontWeight: 700 }}>
                ⏰ {trialsEndingSoon.length} essai{trialsEndingSoon.length > 1 ? "s" : ""} se termine{trialsEndingSoon.length > 1 ? "nt" : ""} dans moins de 3 jours — {trialsEndingSoon.map(b => b.name).join(", ")}
              </div>
            )}
          </div>
        )}

        {pendingCount > 0 && (
          <div style={{ background: "#2e2414", border: "1px solid #b8860b", borderRadius: 14, padding: "12px 18px", marginBottom: 20, color: "#f0c674", fontSize: 14, fontWeight: 700 }}>
            ⏳ {pendingCount} compte{pendingCount > 1 ? "s" : ""} en attente d'approbation
          </div>
        )}

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Rechercher par nom, email, téléphone..."
          style={{ ...inputStyle, marginBottom: 20 }}
        />

        {loading ? <p style={{ color: "#666" }}>Chargement…</p> : businesses.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#555" }}>
            <p style={{ fontSize: 18 }}>Aucun client pour l'instant.</p>
            <button onClick={() => setEditing(emptyBusiness())} style={btnPrimary}>Créer le premier client</button>
          </div>
        ) : sortedBusinesses.length === 0 ? (
          <p style={{ color: "#666", textAlign: "center", padding: 40 }}>Aucun résultat pour cette recherche.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {sortedBusinesses.map(b => {
              const isPending = b.status === "pending";
              const subInfo = b.subscriptionStatus ? SUBSCRIPTION_LABELS[b.subscriptionStatus] : null;
              const planLabel = b.subscriptionPlan ? PLAN_LABELS[b.subscriptionPlan] ?? b.subscriptionPlan : null;
              return (
              <div key={b.id} style={{
                border: isPending ? "1px solid #b8860b" : "1px solid #2a1a3e", borderRadius: 16, padding: "16px 20px",
                background: isPending ? "#1a1608" : "#111", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 20 }}>{verticalEmoji[b.vertical] ?? "⭐"}</span>
                    <Link href={`/admin/businesses/${b.id}`} style={{ fontWeight: 900, fontSize: 16, color: "#fff", textDecoration: "none" }}>
                      {b.name} →
                    </Link>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "#2a1a3e", color: "#9b4fdd", fontWeight: 700 }}>{b.vertical}</span>
                    {isPending ? (
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "#b8860b", color: "#1a1608", fontWeight: 800 }}>⏳ EN ATTENTE</span>
                    ) : (
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "#1a3e2a", color: "#4ade80", fontWeight: 800 }}>✓ APPROUVÉ</span>
                    )}
                    {subInfo && (
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: subInfo.bg, color: subInfo.color, fontWeight: 800 }}>
                        {subInfo.label}{planLabel ? ` (${planLabel})` : ""}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#666", flexWrap: "wrap" }}>
                    {b.customerEmail && <span>✉️ {b.customerEmail}</span>}
                    {b.twilioNumber && <span>📞 {b.twilioNumber}</span>}
                    {b.phone && <span>☎️ {b.phone}</span>}
                    {b.address && <span>📍 {b.address}</span>}
                    <span>🍽️ {b._count.menuItems} articles</span>
                    <span>📋 {b._count.events} événements</span>
                    <span>🕑 Dernier appel : {formatRelative(b.lastActivityAt)}</span>
                    {b.subscriptionStatus === "trialing" && b.trialEndsAt && (
                      <span>⏰ Essai jusqu'au {new Date(b.trialEndsAt).toLocaleDateString("fr-FR")}</span>
                    )}
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
const statCard: React.CSSProperties = { border: "1px solid #2a1a3e", borderRadius: 14, padding: "14px 18px", background: "#111" };

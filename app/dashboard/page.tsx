"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type EventItem = {
  id: string;
  createdAt: string;
  externalRef?: string;
  type: string;
  status: string;
  customerName?: string;
  customerPhone?: string;
  summary?: string;
  data?: any;
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  if (isToday) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }) + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function playDing() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
    g.gain.setValueAtTime(0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.4);
  } catch {}
}

export default function DashboardPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState("Mon établissement");
  const [newAlert, setNewAlert] = useState(false);
  const prevIds = useRef<Set<string>>(new Set());

  async function fetchEvents() {
    try {
      const res = await fetch("/api/dashboard/events", { cache: "no-store" });
      const list = await res.json();
      if (!Array.isArray(list)) return;
      const newIds = list.map((e: EventItem) => e.id);
      const hasNew = newIds.some((id: string) => !prevIds.current.has(id));
      if (hasNew && prevIds.current.size > 0) { playDing(); setNewAlert(true); setTimeout(() => setNewAlert(false), 4000); }
      prevIds.current = new Set(newIds);
      setEvents(list);
    } catch { setEvents([]); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    fetchEvents();
    fetch("/api/dashboard/settings").then(r => r.json()).then(d => { if (d?.name) setBusinessName(d.name); });
    const t = setInterval(fetchEvents, 3000);
    return () => clearInterval(t);
  }, []);

  async function setStatus(id: string, status: string) {
    await fetch(`/api/dashboard/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await fetchEvents();
  }

  const groups = useMemo(() => {
    const sort = (a: EventItem, b: EventItem) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return {
      new: events.filter(e => e.status === "new" || e.status === "confirmed").sort(sort),
      preparing: events.filter(e => e.status === "preparing").sort(sort),
      ready: events.filter(e => e.status === "ready").sort(sort),
      done: events.filter(e => e.status === "done").sort(sort),
    };
  }, [events]);

  const Card = ({ e }: { e: EventItem }) => {
    const isDelivery = e.data?.type === "DELIVERY";
    const total = e.data?.total ?? 0;
    return (
      <div style={{ border: "1px solid #2a1a3e", borderRadius: 14, padding: 14, background: "#1a1a2e" }}>
        <div style={{ fontWeight: 900, fontSize: 15, marginBottom: 6, color: "#fff" }}>🍕 {e.summary || "Commande"}</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <span style={badge}>{isDelivery ? "🚚 Livraison" : "🥡 À emporter"}</span>
          <span style={badge}>⏱ {formatDateTime(e.createdAt)}</span>
          {total > 0 && <span style={{ ...badge, color: "#9b4fdd", borderColor: "#6b1fad" }}>💰 {total}€</span>}
        </div>
        {e.customerName && <div style={{ fontSize: 13, marginBottom: 4, color: "#aaa" }}><b style={{ color: "#ccc" }}>Client :</b> {e.customerName}{e.customerPhone ? ` — ${e.customerPhone}` : ""}</div>}
        {e.data?.address && <div style={{ fontSize: 13, marginBottom: 8, color: "#aaa" }}><b style={{ color: "#ccc" }}>Adresse :</b> {e.data.address}</div>}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
          <button onClick={() => setStatus(e.id, "preparing")} style={btn}>👨‍🍳 En préparation</button>
          <button onClick={() => setStatus(e.id, "ready")} style={btn}>✅ Prête</button>
          <button onClick={() => setStatus(e.id, "done")} style={btn}>📦 Terminée</button>
          <button onClick={() => setStatus(e.id, "cancelled")} style={{ ...btn, color: "#ff6b6b", borderColor: "#5a1a1a" }}>✖ Annuler</button>
        </div>
      </div>
    );
  };

  const Column = ({ title, subtitle, list }: { title: string; subtitle?: string; list: EventItem[] }) => (
    <div style={{ border: "1px solid #2a1a3e", borderRadius: 18, padding: 14, background: "#111", minHeight: 200 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 900, color: "#fff" }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: "#666" }}>{subtitle}</div>}
        </div>
        <span style={{ ...badge, background: "#2a1a3e", color: "#9b4fdd" }}>{list.length}</span>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {list.length === 0 ? <div style={{ color: "#555" }}>Aucune commande</div> : list.map(e => <Card key={e.id} e={e} />)}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0, color: "#fff" }}>📋 {businessName}</h1>
          <p style={{ fontSize: 12, color: "#666", margin: "4px 0 0" }}>Temps réel</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {newAlert && <div style={{ background: "#6b1fad", color: "#fff", padding: "8px 14px", borderRadius: 10, fontSize: 13, fontWeight: 800 }}>🔔 Nouvelle commande !</div>}
          <button onClick={fetchEvents} style={btn}>↻ Rafraîchir</button>
        </div>
      </div>

      {loading ? <p style={{ color: "#666" }}>Chargement…</p> : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Column title="🆕 Nouvelles" subtitle="À prendre en charge" list={groups.new} />
          <Column title="👨‍🍳 En préparation" subtitle="En cours" list={groups.preparing} />
          <Column title="✅ Prêtes" subtitle="À remettre" list={groups.ready} />
          <Column title="📦 Terminées" subtitle="Historique" list={groups.done} />
        </div>
      )}
    </div>
  );
}

const badge: React.CSSProperties = { display: "inline-block", fontSize: 12, padding: "3px 8px", borderRadius: 99, border: "1px solid #2a1a3e", background: "#1a1a2e", color: "#888" };
const btn: React.CSSProperties = { padding: "8px 12px", borderRadius: 10, border: "1px solid #2a1a3e", background: "#1a1a2e", fontWeight: 700, cursor: "pointer", fontSize: 13, color: "#ccc" };

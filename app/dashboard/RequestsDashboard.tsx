"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "../../components/Toast";

type EventItem = {
  id: string;
  createdAt: string;
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

function hoursSince(iso: string) {
  return (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60);
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

export default function RequestsDashboard() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState("Mon activité");
  const [newAlert, setNewAlert] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const prevIds = useRef<Set<string>>(new Set());
  const { showToast } = useToast();

  async function fetchEvents() {
    try {
      const res = await fetch("/api/dashboard/events", { cache: "no-store" });
      const list = await res.json();
      if (!Array.isArray(list)) return;
      const requests = list.filter((e: EventItem) => e.type === "demande_intervention");
      const newIds = requests.map((e: EventItem) => e.id);
      const hasNew = newIds.some((id: string) => !prevIds.current.has(id));
      if (hasNew && prevIds.current.size > 0) { playDing(); setNewAlert(true); setTimeout(() => setNewAlert(false), 4000); }
      prevIds.current = new Set(newIds);
      setEvents(requests);
      setNotes(prev => {
        const next = { ...prev };
        for (const e of requests) {
          if (next[e.id] === undefined) next[e.id] = e.data?.note ?? "";
        }
        return next;
      });
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
    try {
      await fetch(`/api/dashboard/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const labels: Record<string, string> = { new: "remise en nouvelle", done: "marquée traitée", no_follow_up: "marquée sans suite" };
      showToast(`Demande ${labels[status] ?? status}`);
    } catch {
      showToast("Erreur lors de la mise à jour", "error");
    }
    await fetchEvents();
  }

  async function saveNote(id: string, note: string) {
    try {
      await fetch(`/api/dashboard/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
    } catch {
      showToast("Erreur lors de l'enregistrement de la note", "error");
    }
  }

  const groups = useMemo(() => {
    const sort = (a: EventItem, b: EventItem) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return {
      new: events.filter(e => e.status === "new").sort(sort),
      noFollowUp: events.filter(e => e.status === "no_follow_up").sort(sort),
      done: events.filter(e => e.status === "done").sort(sort),
    };
  }, [events]);

  const Card = ({ e }: { e: EventItem }) => {
    const hrs = hoursSince(e.createdAt);
    const isStale = e.status === "new" && hrs >= 24;
    const phoneDigits = e.customerPhone?.replace(/\s+/g, "");
    const mapsUrl = e.data?.address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.data.address)}`
      : null;

    return (
      <div style={{
        border: isStale ? "1px solid #d97706" : "1px solid #2a1a3e",
        borderRadius: 14, padding: 14, background: "#1a1a2e",
      }}>
        <div style={{ fontWeight: 900, fontSize: 15, marginBottom: 6, color: "#fff" }}>🌿 {e.summary || "Demande client"}</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <span style={badge}>⏱ {formatDateTime(e.createdAt)}</span>
          {e.data?.availability && <span style={{ ...badge, color: "#9b4fdd", borderColor: "#6b1fad" }}>📅 {e.data.availability}</span>}
          {isStale && (
            <span style={{ ...badge, color: "#fbbf24", borderColor: "#d97706" }}>
              ⚠️ En attente depuis {Math.floor(hrs)}h
            </span>
          )}
        </div>
        {e.customerName && <div style={{ fontSize: 13, marginBottom: 4, color: "#aaa" }}><b style={{ color: "#ccc" }}>Client :</b> {e.customerName}{e.customerPhone ? ` — ${e.customerPhone}` : ""}</div>}
        {e.data?.address && <div style={{ fontSize: 13, marginBottom: 4, color: "#aaa" }}><b style={{ color: "#ccc" }}>Adresse :</b> {e.data.address}</div>}
        {e.data?.problem && <div style={{ fontSize: 13, marginBottom: 8, color: "#aaa" }}><b style={{ color: "#ccc" }}>Détail :</b> {e.data.problem}</div>}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          {phoneDigits && (
            <a href={`tel:${phoneDigits}`} style={{ ...btn, textDecoration: "none", display: "inline-block" }}>📞 Appeler</a>
          )}
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ ...btn, textDecoration: "none", display: "inline-block" }}>📍 Itinéraire</a>
          )}
        </div>

        <input
          value={notes[e.id] ?? ""}
          onChange={(ev) => setNotes(prev => ({ ...prev, [e.id]: ev.target.value }))}
          onBlur={(ev) => saveNote(e.id, ev.target.value)}
          placeholder="Note privée (ex: devis envoyé le 12)"
          style={{
            width: "100%", boxSizing: "border-box", padding: "7px 10px", borderRadius: 8,
            border: "1px solid #2a1a3e", background: "#0a0a0a", color: "#ccc", fontSize: 12, marginBottom: 10,
          }}
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {e.status !== "done" && <button onClick={() => setStatus(e.id, "done")} style={btn}>✅ Traitée</button>}
          {e.status !== "no_follow_up" && <button onClick={() => setStatus(e.id, "no_follow_up")} style={{ ...btn, color: "#aaa" }}>🚫 Sans suite</button>}
          {e.status !== "new" && <button onClick={() => setStatus(e.id, "new")} style={btn}>↩️ Nouvelle</button>}
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
        {list.length === 0 ? <div style={{ color: "#555" }}>Aucune demande</div> : list.map(e => <Card key={e.id} e={e} />)}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0, color: "#fff" }}>📨 {businessName}</h1>
          <p style={{ fontSize: 12, color: "#666", margin: "4px 0 0" }}>Demandes reçues par téléphone — un rapport détaillé vous est aussi envoyé par email à chaque appel.</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {newAlert && <div style={{ background: "#6b1fad", color: "#fff", padding: "8px 14px", borderRadius: 10, fontSize: 13, fontWeight: 800 }}>🔔 Nouvelle demande !</div>}
          <button onClick={fetchEvents} style={btn}>↻ Rafraîchir</button>
        </div>
      </div>

      {loading ? <p style={{ color: "#666", textAlign: "center", padding: "40px 0" }}>Chargement des demandes…</p> : (
        <div className="staro-requests-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <Column title="🆕 Nouvelles" subtitle="À rappeler" list={groups.new} />
          <Column title="🚫 Sans suite" subtitle="Client injoignable / annulé" list={groups.noFollowUp} />
          <Column title="✅ Traitées" subtitle="Historique" list={groups.done} />
        </div>
      )}

      <style>{`
        @media (max-width: 1000px) {
          .staro-requests-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const badge: React.CSSProperties = { display: "inline-block", fontSize: 12, padding: "3px 8px", borderRadius: 99, border: "1px solid #2a1a3e", background: "#1a1a2e", color: "#888" };
const btn: React.CSSProperties = { padding: "8px 12px", borderRadius: 10, border: "1px solid #2a1a3e", background: "#1a1a2e", fontWeight: 700, cursor: "pointer", fontSize: 13, color: "#ccc" };

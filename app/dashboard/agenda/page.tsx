"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Staff = { id: string; name: string; available: boolean };
type Service = { id: string; name: string; duration: number; price: number; available: boolean };
type Appointment = {
  id: string;
  customerName: string;
  customerPhone: string;
  startAt: string;
  endAt: string;
  status: string;
  notes?: string;
  service?: Service;
  staff?: Staff;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(d: Date) {
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

function isoDate(d: Date) {
  return d.toISOString().split("T")[0];
}

export default function AgendaPage() {
  const searchParams = useSearchParams();
  const view = searchParams.get("tab") === "services" ? "services" : "agenda";

  const [date, setDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [modal, setModal] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const [appts, staffList, serviceList] = await Promise.all([
      fetch(`/api/dashboard/appointments?date=${isoDate(date)}`).then(r => r.json()),
      fetch("/api/dashboard/staff").then(r => r.json()),
      fetch("/api/dashboard/services").then(r => r.json()),
    ]);
    setAppointments(Array.isArray(appts) ? appts : []);
    setStaff(Array.isArray(staffList) ? staffList : []);
    setServices(Array.isArray(serviceList) ? serviceList : []);
  }

  useEffect(() => { load(); }, [date]);

  async function saveStaff() {
    setSaving(true);
    const method = modal.id ? "PATCH" : "POST";
    const url = modal.id ? `/api/dashboard/staff/${modal.id}` : "/api/dashboard/staff";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(modal) });
    setModal(null); setSaving(false); load();
  }

  async function deleteStaff(id: string) {
    if (!confirm("Supprimer ce membre ?")) return;
    await fetch(`/api/dashboard/staff/${id}`, { method: "DELETE" });
    load();
  }

  async function saveService() {
    setSaving(true);
    const method = modal.id ? "PATCH" : "POST";
    const url = modal.id ? `/api/dashboard/services/${modal.id}` : "/api/dashboard/services";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(modal) });
    setModal(null); setSaving(false); load();
  }

  async function deleteService(id: string) {
    if (!confirm("Supprimer ce service ?")) return;
    await fetch(`/api/dashboard/services/${id}`, { method: "DELETE" });
    load();
  }

  async function cancelAppointment(id: string) {
    if (!confirm("Annuler ce RDV ?")) return;
    await fetch(`/api/dashboard/appointments/${id}`, { method: "DELETE" });
    load();
  }

  const prevDay = () => { const d = new Date(date); d.setDate(d.getDate() - 1); setDate(d); };
  const nextDay = () => { const d = new Date(date); d.setDate(d.getDate() + 1); setDate(d); };

  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8h-19h

  return (
    <div>
      {view === "agenda" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0, color: "#fff" }}>📅 Agenda</h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <button onClick={prevDay} style={navBtn}>←</button>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", textTransform: "capitalize" }}>{formatDate(date)}</span>
            <button onClick={nextDay} style={navBtn}>→</button>
            <button onClick={() => setDate(new Date())} style={{ ...navBtn, fontSize: 12, padding: "6px 12px" }}>Aujourd'hui</button>
          </div>

          <div style={{ border: "1px solid #2a1a3e", borderRadius: 16, overflow: "hidden" }}>
            {hours.map(h => {
              const slotAppts = appointments.filter(a => new Date(a.startAt).getHours() === h);
              return (
                <div key={h} style={{ display: "grid", gridTemplateColumns: "60px 1fr", borderBottom: "1px solid #1a1a2e" }}>
                  <div style={{ padding: "12px 8px", color: "#555", fontSize: 13, textAlign: "right", borderRight: "1px solid #1a1a2e" }}>
                    {h}:00
                  </div>
                  <div style={{ padding: 8, minHeight: 48, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {slotAppts.map(a => (
                      <div key={a.id} style={{
                        background: "#2a1a3e", border: "1px solid #6b1fad", borderRadius: 8,
                        padding: "6px 10px", fontSize: 13, cursor: "pointer",
                      }}>
                        <div style={{ fontWeight: 700, color: "#fff" }}>{formatTime(a.startAt)} — {a.customerName}</div>
                        <div style={{ color: "#9b4fdd", fontSize: 12 }}>{a.service?.name ?? "RDV"}{a.staff ? ` · ${a.staff.name}` : ""}</div>
                        <button onClick={() => cancelAppointment(a.id)} style={{ background: "none", border: "none", color: "#ff6b6b", fontSize: 11, cursor: "pointer", padding: 0, marginTop: 4 }}>✕ Annuler</button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {appointments.length === 0 && (
            <p style={{ color: "#555", textAlign: "center", marginTop: 20 }}>Aucun RDV ce jour.</p>
          )}

          <div style={{ marginTop: 24, border: "1px solid #2a1a3e", borderRadius: 16, padding: 20 }}>
            <p style={{ color: "#666", fontSize: 13, margin: "0 0 12px", fontWeight: 700 }}>🔗 Synchronisation</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {["Google Calendar", "Planity", "Treatwell", "Bookly", "Fresha"].map(name => (
                <button key={name} disabled style={{
                  padding: "8px 14px", borderRadius: 10, border: "1px solid #2a1a3e",
                  background: "#1a1a2e", color: "#444", fontWeight: 600, cursor: "not-allowed", fontSize: 13,
                }}>
                  {name} — Bientôt
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === "services" && (
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 24px", color: "#fff" }}>✂️ Services & Équipe</h1>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#ccc", margin: 0 }}>👤 Équipe</h2>
            <button onClick={() => setModal({ type: "staff", name: "", available: true })} style={btnPrimary}>+ Ajouter</button>
          </div>
          {staff.length === 0 ? (
            <p style={{ color: "#555", textAlign: "center" }}>Aucun membre d'équipe.</p>
          ) : (
            <div style={{ display: "grid", gap: 10, marginBottom: 32 }}>
              {staff.map(s => (
                <div key={s.id} style={{ border: "1px solid #2a1a3e", borderRadius: 14, padding: "14px 20px", background: "#111", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontWeight: 700, color: "#fff", fontSize: 15 }}>👤 {s.name}</span>
                    <span style={{ marginLeft: 10, fontSize: 12, color: s.available ? "#4ade80" : "#f87171" }}>{s.available ? "Disponible" : "Indisponible"}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setModal({ type: "staff", ...s })} style={btnSmall}>✏️</button>
                    <button onClick={() => deleteStaff(s.id)} style={{ ...btnSmall, color: "#ff6b6b" }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#ccc", margin: 0 }}>✂️ Services</h2>
            <button onClick={() => setModal({ type: "service", name: "", duration: 30, price: 0, available: true })} style={btnPrimary}>+ Ajouter</button>
          </div>
          {services.length === 0 ? (
            <p style={{ color: "#555", textAlign: "center" }}>Aucun service configuré.</p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {services.map(s => (
                <div key={s.id} style={{ border: "1px solid #2a1a3e", borderRadius: 14, padding: "14px 20px", background: "#111", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontWeight: 700, color: "#fff", fontSize: 15 }}>✂️ {s.name}</span>
                    <span style={{ marginLeft: 10, fontSize: 13, color: "#9b4fdd" }}>{s.duration} min · {s.price}€</span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setModal({ type: "service", ...s })} style={btnSmall}>✏️</button>
                    <button onClick={() => deleteService(s.id)} style={{ ...btnSmall, color: "#ff6b6b" }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#111", border: "1px solid #2a1a3e", borderRadius: 20, padding: 28, width: "100%", maxWidth: 400, display: "grid", gap: 14 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#fff" }}>
              {modal.id ? "Modifier" : "Ajouter"} {modal.type === "staff" ? "un membre" : "un service"}
            </h2>

            <label style={labelStyle}>Nom<input value={modal.name} onChange={e => setModal({ ...modal, name: e.target.value })} style={inputStyle} /></label>

            {modal.type === "service" && (
              <>
                <label style={labelStyle}>Durée (minutes)<input type="number" value={modal.duration} onChange={e => setModal({ ...modal, duration: parseInt(e.target.value) })} style={inputStyle} /></label>
                <label style={labelStyle}>Prix (€)<input type="number" value={modal.price} onChange={e => setModal({ ...modal, price: parseFloat(e.target.value) })} style={inputStyle} /></label>
              </>
            )}

            <label style={{ ...labelStyle, flexDirection: "row", alignItems: "center", gap: 10 }}>
              <input type="checkbox" checked={modal.available} onChange={e => setModal({ ...modal, available: e.target.checked })} />
              Disponible
            </label>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setModal(null)} style={btnSecondary}>Annuler</button>
              <button onClick={modal.type === "staff" ? saveStaff : saveService} disabled={saving} style={btnPrimary}>{saving ? "…" : "Sauvegarder"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const navBtn: React.CSSProperties = { padding: "8px 14px", borderRadius: 10, border: "1px solid #2a1a3e", background: "#1a1a2e", color: "#fff", cursor: "pointer", fontSize: 16 };
const btnPrimary: React.CSSProperties = { padding: "10px 18px", borderRadius: 12, border: "none", background: "#6b1fad", color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 14 };
const btnSecondary: React.CSSProperties = { padding: "10px 18px", borderRadius: 12, border: "1px solid #2a1a3e", background: "transparent", color: "#ccc", fontWeight: 700, cursor: "pointer", fontSize: 14 };
const btnSmall: React.CSSProperties = { padding: "6px 12px", borderRadius: 10, border: "1px solid #2a1a3e", background: "#1a1a2e", fontWeight: 700, cursor: "pointer", fontSize: 13, color: "#ccc" };
const inputStyle: React.CSSProperties = { padding: "9px 12px", borderRadius: 10, border: "1px solid #2a1a3e", background: "#0a0a0a", color: "#fff", fontSize: 14, width: "100%", boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 5, fontSize: 13, fontWeight: 600, color: "#aaa" };

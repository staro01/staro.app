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

const TZ = "Europe/Paris";
const STORAGE_KEY = "staro_staff_id";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: TZ, hour12: false });
}

function formatDate(d: Date) {
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: TZ });
}

function isoDate(d: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(d);
  const y = parts.find(p => p.type === "year")?.value;
  const m = parts.find(p => p.type === "month")?.value;
  const day = parts.find(p => p.type === "day")?.value;
  return `${y}-${m}-${day}`;
}

// Minutes depuis minuit, en heure de Paris
function parisMinutes(iso: string) {
  const d = new Date(iso);
  const str = d.toLocaleTimeString("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false });
  const [h, m] = str.split(":").map(Number);
  return h * 60 + m;
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
  const [whoAmI, setWhoAmI] = useState<string>("all");
  const [whoAmILoaded, setWhoAmILoaded] = useState(false);
  const [nowTick, setNowTick] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNowTick(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) setWhoAmI(stored);
    setWhoAmILoaded(true);
  }, []);

  function changeWhoAmI(id: string) {
    setWhoAmI(id);
    window.localStorage.setItem(STORAGE_KEY, id);
  }

  async function load() {
    const staffParam = whoAmI !== "all" ? `&staffId=${whoAmI}` : "";
    const [appts, staffList, serviceList] = await Promise.all([
      fetch(`/api/dashboard/appointments?date=${isoDate(date)}${staffParam}`).then(r => r.json()),
      fetch("/api/dashboard/staff").then(r => r.json()),
      fetch("/api/dashboard/services").then(r => r.json()),
    ]);
    setAppointments(Array.isArray(appts) ? appts : []);
    setStaff(Array.isArray(staffList) ? staffList : []);
    setServices(Array.isArray(serviceList) ? serviceList : []);
  }

  useEffect(() => { if (whoAmILoaded) load(); }, [date, whoAmI, whoAmILoaded]);

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

  // Créneaux de 30 min, de 8h00 à 19h30
  const slots: number[] = [];
  for (let m = 8 * 60; m <= 19 * 60 + 30; m += 30) slots.push(m);

  const isToday = isoDate(date) === isoDate(nowTick);
  const nowMinutes = (() => {
    const str = nowTick.toLocaleTimeString("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false });
    const [h, m] = str.split(":").map(Number);
    return h * 60 + m;
  })();
  const SLOT_HEIGHT = 52; // hauteur approx d'un créneau en px, doit matcher le CSS des lignes
  const firstSlotMinutes = slots[0];
  const lastSlotMinutes = slots[slots.length - 1];
  const showNowLine = isToday && nowMinutes >= firstSlotMinutes && nowMinutes <= lastSlotMinutes;
  const nowLineOffset = ((nowMinutes - firstSlotMinutes) / 30) * SLOT_HEIGHT;

  function slotLabel(m: number) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return `${h}:${mm === 0 ? "00" : mm}`;
  }

  const currentStaffName = staff.find(s => s.id === whoAmI)?.name;

  return (
    <div>
      {view === "agenda" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0, color: "#fff" }}>📅 Agenda</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>Qui êtes-vous ?</span>
              <select value={whoAmI} onChange={e => changeWhoAmI(e.target.value)} style={selectStyle}>
                <option value="all">👥 Toute l'équipe</option>
                {staff.map(s => (
                  <option key={s.id} value={s.id}>👤 {s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <button onClick={prevDay} style={navBtn}>←</button>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", textTransform: "capitalize" }}>{formatDate(date)}</span>
            <button onClick={nextDay} style={navBtn}>→</button>
            <button onClick={() => setDate(new Date())} style={{ ...navBtn, fontSize: 12, padding: "6px 12px" }}>Aujourd'hui</button>
            {whoAmI !== "all" && currentStaffName && (
              <span style={{ fontSize: 12, color: "#9b4fdd", fontWeight: 700, background: "#1a1a2e", border: "1px solid #2a1a3e", borderRadius: 8, padding: "6px 12px" }}>
                Agenda de {currentStaffName}
              </span>
            )}
          </div>

          <div style={{ border: "1px solid #2a1a3e", borderRadius: 16, overflow: "hidden", position: "relative" }}>
            {showNowLine && (
              <div style={{
                position: "absolute", left: 70, right: 0, top: nowLineOffset,
                borderTop: "2px solid #ef4444", zIndex: 10, pointerEvents: "none",
              }}>
                <div style={{
                  position: "absolute", left: -6, top: -5, width: 10, height: 10,
                  borderRadius: "50%", background: "#ef4444",
                }} />
              </div>
            )}
            {slots.map(slotMin => {
              const slotAppts = appointments.filter(a => {
                const start = parisMinutes(a.startAt);
                const end = parisMinutes(a.endAt);
                return start <= slotMin && slotMin < end;
              });
              const isHour = slotMin % 60 === 0;
              return (
                <div key={slotMin} style={{
                  display: "grid", gridTemplateColumns: "70px 1fr",
                  borderBottom: isHour ? "1px solid #2a1a3e" : "1px solid #161622",
                }}>
                  <div style={{
                    padding: "10px 10px", color: isHour ? "#888" : "#444", fontSize: isHour ? 13 : 11,
                    fontWeight: isHour ? 700 : 400, textAlign: "right", borderRight: "1px solid #1a1a2e",
                  }}>
                    {slotLabel(slotMin)}
                  </div>
                  <div style={{ padding: "6px 10px", minHeight: 40, display: "flex", flexDirection: "column", gap: 6 }}>
                    {slotAppts.map(a => {
                      const isConflict = a.status === "conflict";
                      return (
                      <div key={a.id} style={{
                        background: isConflict ? "#2e1414" : "#1e1430",
                        border: isConflict ? "1px solid #e11d48" : "1px solid #6b1fad",
                        borderRadius: 10,
                        padding: "10px 14px", fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
                      }}>
                        <div>
                          <div style={{ fontWeight: 800, color: "#fff", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                            {formatTime(a.startAt)}–{formatTime(a.endAt)} · {a.customerName}
                            {isConflict && (
                              <span style={{ background: "#e11d48", color: "#fff", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>
                                ⚠️ CONFLIT
                              </span>
                            )}
                          </div>
                          <div style={{ color: isConflict ? "#fca5a5" : "#c084fc", fontSize: 12, marginTop: 2 }}>
                            ✂️ {a.service?.name ?? "RDV"}{a.staff ? `  ·  👤 ${a.staff.name}` : "  ·  👤 non assigné"}
                          </div>
                          {a.customerPhone && (
                            <div style={{ color: "#666", fontSize: 11, marginTop: 2 }}>📞 {a.customerPhone}</div>
                          )}
                          {isConflict && (
                            <div style={{ color: "#fca5a5", fontSize: 11, marginTop: 4, fontWeight: 700 }}>
                              Ce créneau chevauche un autre RDV — à recontacter le client pour ajuster.
                            </div>
                          )}
                        </div>
                        <button onClick={() => cancelAppointment(a.id)} style={{ background: "none", border: "1px solid #442222", color: "#ff6b6b", fontSize: 11, cursor: "pointer", padding: "6px 10px", borderRadius: 8, whiteSpace: "nowrap" }}>
                          ✕ Annuler
                        </button>
                      </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {appointments.length === 0 && (
            <p style={{ color: "#555", textAlign: "center", marginTop: 20 }}>Aucun RDV ce jour{whoAmI !== "all" && currentStaffName ? ` pour ${currentStaffName}` : ""}.</p>
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
const selectStyle: React.CSSProperties = { padding: "8px 12px", borderRadius: 10, border: "1px solid #2a1a3e", background: "#1a1a2e", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" };

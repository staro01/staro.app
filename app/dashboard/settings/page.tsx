"use client";

import { useEffect, useState } from "react";

const DAYS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
const ARTISAN_VERTICALS = ["paysagiste", "plombier", "electricien", "chauffagiste"];

type DaySchedule = { open: string; close: string; dinnerOpen: string; dinnerClose: string; closed: boolean };
type Settings = {
  name: string; phone: string; address: string; vertical: string; customerEmail: string; twilioNumber?: string | null;
  estimatedPrepTime: number;
  deliveryEnabled: boolean; deliveryFee: number; deliveryMinimum: number;
  paymentMethods: string;
  vacationMode: boolean; vacationMessage: string; ringFirst: boolean; reportChannel: string; subscriptionPlan?: string | null;
  allergensInfo: string; currentPromos: string; welcomeMessage: string;
  openingHours: Record<string, DaySchedule>;
};
type Subscription = { plan: string | null; status: string | null; hasStripeCustomer: boolean } | null;

const defaultDay = (): DaySchedule => ({ open: "11:30", close: "14:00", dinnerOpen: "19:00", dinnerClose: "22:30", closed: false });
const defaultSettings = (): Settings => ({
  name: "", phone: "", address: "", vertical: "pizzeria", customerEmail: "",
  estimatedPrepTime: 20,
  deliveryEnabled: true, deliveryFee: 0, deliveryMinimum: 0,
  paymentMethods: "CB, espèces",
  vacationMode: false, vacationMessage: "Nous sommes actuellement fermés. Merci de rappeler.", ringFirst: false, reportChannel: "email", subscriptionPlan: null,
  allergensInfo: "", currentPromos: "", welcomeMessage: "",
  openingHours: Object.fromEntries(DAYS.map(d => [d, defaultDay()])),
});

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: "Actif", color: "#4ade80" },
  trialing: { label: "Période d'essai", color: "#4ade80" },
  past_due: { label: "Paiement en retard", color: "#f5a623" },
  cancelled: { label: "Annulé", color: "#ef4444" },
  canceled: { label: "Annulé", color: "#ef4444" },
  inactive: { label: "Inactif", color: "#888" },
};

const PLAN_LABELS: Record<string, string> = {
  monthly: "Mensuel",
  annual: "Annuel",
};

function ValueStatsSection() {
  const [stats, setStats] = useState<{ totalCallsThisMonth: number; outsideHoursCount: number } | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats").then((r) => r.json()).then((data) => {
      if (data && !data.error) setStats(data);
    });
  }, []);

  if (!stats || stats.totalCallsThisMonth === 0) return null;

  return (
    <Section title="📊 Ce mois-ci">
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 160, textAlign: "center", padding: "16px 12px", background: "#0a0a0a", borderRadius: 12, border: "1px solid #2a1a3e" }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>{stats.totalCallsThisMonth}</div>
          <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>Appel{stats.totalCallsThisMonth > 1 ? "s" : ""} traité{stats.totalCallsThisMonth > 1 ? "s" : ""}</div>
        </div>
        <div style={{ flex: 1, minWidth: 160, textAlign: "center", padding: "16px 12px", background: "#0a0a0a", borderRadius: 12, border: "1px solid #2a1a3e" }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#9b4fdd" }}>{stats.outsideHoursCount}</div>
          <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>Reçu{stats.outsideHoursCount > 1 ? "s" : ""} en dehors de vos horaires</div>
        </div>
      </div>
      <p style={{ fontSize: 12, color: "#666", marginTop: 12 }}>
        Sans Staro, ces appels auraient probablement été manqués.
      </p>
    </Section>
  );
}

function SubscriptionSection() {
  const [sub, setSub] = useState<Subscription>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [plan, setPlan] = useState<"monthly" | "annual">("annual");

  useEffect(() => {
    fetch("/api/dashboard/subscription")
      .then((r) => (r.ok ? r.json() : null))
      .then(setSub)
      .finally(() => setLoading(false));
  }, []);

  async function openPortal() {
    setRedirecting(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setRedirecting(false);
        alert(data.error ?? "Une erreur est survenue.");
      }
    } catch {
      setRedirecting(false);
      alert("Une erreur est survenue.");
    }
  }

  async function startCheckout() {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setCheckoutLoading(false);
        alert(data.error ?? "Une erreur est survenue.");
      }
    } catch {
      setCheckoutLoading(false);
      alert("Une erreur est survenue.");
    }
  }

  if (loading) return null;

  const statusInfo = sub?.status ? STATUS_LABELS[sub.status] ?? { label: sub.status, color: "#888" } : null;
  const planLabel = sub?.plan ? PLAN_LABELS[sub.plan] ?? sub.plan : null;
  const isActive = sub?.status === "active" || sub?.status === "trialing";

  return (
    <Section title="💳 Abonnement">
      {isActive ? (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
            <span style={{ color: "#ccc" }}>Statut :</span>
            <span
              style={{
                color: statusInfo?.color ?? "#888",
                fontWeight: 800,
                background: `${statusInfo?.color ?? "#888"}22`,
                padding: "3px 10px",
                borderRadius: 20,
                fontSize: 13,
              }}
            >
              {statusInfo?.label ?? "Inconnu"}
            </span>
            {planLabel && <span style={{ color: "#888", fontSize: 13 }}>— Formule {planLabel}</span>}
          </div>
          <button onClick={openPortal} disabled={redirecting} style={btnSecondary}>
            {redirecting ? "Redirection..." : "Gérer mon abonnement et ma facturation"}
          </button>
        </>
      ) : (
        <>
          <p style={{ color: "#f0c674", fontSize: 14, fontWeight: 700, margin: "0 0 4px" }}>
            ⚠️ Sans abonnement actif, votre assistant vocal ne répond pas aux appels.
          </p>
          <p style={{ color: "#888", fontSize: 13, margin: "0 0 14px" }}>
            Essai gratuit de 7 jours inclus. Aucun prélèvement avant la fin de l&apos;essai — à ce moment-là,
            les 499€ de frais de mise en place seront facturés en une fois, avec votre premier mois d&apos;abonnement.
          </p>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            <button
              onClick={() => setPlan("monthly")}
              style={{ ...btnSecondary, background: plan === "monthly" ? "#2a1a3e" : "transparent", width: "fit-content" }}
            >
              Mensuel — 60€/mois
            </button>
            <button
              onClick={() => setPlan("annual")}
              style={{ ...btnSecondary, background: plan === "annual" ? "#2a1a3e" : "transparent", width: "fit-content" }}
            >
              Annuel — 700€/an
            </button>
          </div>
          <button onClick={startCheckout} disabled={checkoutLoading} style={btnPrimary}>
            {checkoutLoading ? "Redirection..." : "Démarrer l'essai gratuit (7 jours)"}
          </button>
        </>
      )}
    </Section>
  );
}

export default function SettingsPage() {
  const [s, setS] = useState<Settings>(defaultSettings());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/settings").then(r => r.json()).then(data => {
      if (data) setS({ ...defaultSettings(), ...data, openingHours: { ...defaultSettings().openingHours, ...(data.openingHours ?? {}) } });
      setLoading(false);
    });
  }, []);

  async function save() {
    if (!s.name.trim()) return alert("Le nom est obligatoire.");
    if (ARTISAN_VERTICALS.includes(s.vertical) && !s.customerEmail.trim()) {
      return alert("L'email pour recevoir les demandes clients est obligatoire pour ce secteur.");
    }
    setSaving(true);
    await fetch("/api/dashboard/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s) });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function setDay(day: string, field: keyof DaySchedule, value: string | boolean) {
    setS(prev => ({ ...prev, openingHours: { ...prev.openingHours, [day]: { ...prev.openingHours[day], [field]: value } } }));
  }

  if (loading) return <p>Chargement…</p>;

  const isArtisan = ARTISAN_VERTICALS.includes(s.vertical);

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>⚙️ Paramètres</h1>
        <button onClick={save} disabled={saving} style={btnPrimary}>{saving ? "Sauvegarde…" : saved ? "✅ Sauvegardé !" : "Sauvegarder"}</button>
      </div>

      <ValueStatsSection />
      <SubscriptionSection />

      {s.twilioNumber && (
        <Section title="📞 Votre agent vocal">
          <p style={{ fontSize: 14, color: "#ccc", margin: "0 0 12px" }}>
            Votre numéro d'agent vocal :{" "}
            <strong style={{ fontSize: 16, color: "#fff" }}>{s.twilioNumber}</strong>
          </p>
          <p style={{ fontSize: 13, color: "#888", margin: "0 0 14px" }}>
            Redirigez votre numéro professionnel actuel vers ce numéro pour que votre agent réponde à vos appels.
          </p>
          <p style={{ fontSize: 13, color: "#888" }}>
            Méthode rapide : composez <code style={{ background: "#0a0a0a", padding: "2px 6px", borderRadius: 4 }}>**21*{s.twilioNumber}#</code> sur votre téléphone, puis appuyez sur la touche d'appel.
          </p>
        </Section>
      )}

      <Section title="🏠 Informations générales">
        <Field label="Nom *"><input value={s.name} onChange={e => setS({ ...s, name: e.target.value })} style={inputStyle} /></Field>
        <Field label="Téléphone"><input value={s.phone} onChange={e => setS({ ...s, phone: e.target.value })} style={inputStyle} placeholder="04 90 XX XX XX" /></Field>
        <Field label="Adresse"><input value={s.address} onChange={e => setS({ ...s, address: e.target.value })} style={inputStyle} /></Field>
        <Field label={isArtisan ? "Email pour recevoir les demandes clients *" : "Email de contact"}>
          <input value={s.customerEmail} onChange={e => setS({ ...s, customerEmail: e.target.value })} style={inputStyle} placeholder="contact@monentreprise.fr" />
        </Field>
      </Section>

      {!isArtisan && (
        <Section title="🚗 Commandes & livraison">
          <Toggle label="Livraison activée" checked={s.deliveryEnabled} onChange={v => setS({ ...s, deliveryEnabled: v })} />
          {s.deliveryEnabled && <>
            <Field label="Frais de livraison (€)"><input type="number" value={s.deliveryFee} onChange={e => setS({ ...s, deliveryFee: parseFloat(e.target.value) || 0 })} style={inputStyle} /></Field>
            <Field label="Commande minimum (€)"><input type="number" value={s.deliveryMinimum} onChange={e => setS({ ...s, deliveryMinimum: parseFloat(e.target.value) || 0 })} style={inputStyle} /></Field>
          </>}
          <Field label="Temps de préparation (min)"><input type="number" value={s.estimatedPrepTime} onChange={e => setS({ ...s, estimatedPrepTime: parseInt(e.target.value) || 20 })} style={inputStyle} /></Field>
          <Field label="Paiement accepté"><input value={s.paymentMethods} onChange={e => setS({ ...s, paymentMethods: e.target.value })} style={inputStyle} /></Field>
        </Section>
      )}

      <Section title="📞 Comportement de l'agent">
        <Toggle
          label="Faire sonner mon téléphone d'abord (l'agent prend le relais si je ne réponds pas)"
          checked={s.ringFirst}
          onChange={v => setS({ ...s, ringFirst: v })}
        />
        {s.ringFirst && !s.phone.trim() && (
          <p style={{ color: "#f0c674", fontSize: 13, margin: 0 }}>
            ⚠️ Renseignez votre numéro de téléphone ci-dessus (section Informations générales) pour que ce mode fonctionne — sinon l&apos;agent répondra directement.
          </p>
        )}
        {s.ringFirst && s.phone.trim() && (
          <p style={{ color: "#888", fontSize: 13, margin: 0 }}>
            Votre téléphone sonnera environ 18 secondes avant que l&apos;agent ne prenne le relais, uniquement pendant vos horaires d&apos;ouverture (ci-dessous). En dehors de ces horaires, l&apos;agent répond directement pour ne pas vous déranger.
          </p>
        )}
      </Section>

      {isArtisan && (s.subscriptionPlan?.startsWith("pro_") || s.subscriptionPlan?.startsWith("premium_")) && (
        <Section title="📩 Notification de nouvelle demande">
          <p style={{ fontSize: 13, color: "#888", margin: "0 0 4px" }}>
            Comment souhaitez-vous être prévenu quand un client vous contacte ?
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setS({ ...s, reportChannel: "email" })}
              style={{ ...btnSecondary, background: s.reportChannel === "email" ? "#2a1a3e" : "transparent" }}
            >
              ✉️ Par email
            </button>
            <button
              onClick={() => setS({ ...s, reportChannel: "sms" })}
              style={{ ...btnSecondary, background: s.reportChannel === "sms" ? "#2a1a3e" : "transparent" }}
            >
              📱 Par SMS
            </button>
          </div>
        </Section>
      )}

      <Section title="🏖️ Mode vacances / indisponibilité">
        <Toggle label="Activer le mode vacances" checked={s.vacationMode} onChange={v => setS({ ...s, vacationMode: v })} />
        {s.vacationMode && <Field label="Message"><textarea value={s.vacationMessage} onChange={e => setS({ ...s, vacationMessage: e.target.value })} style={{ ...inputStyle, minHeight: 70 }} /></Field>}
      </Section>

      <Section title="🕐 Horaires d'ouverture">
        <p style={{ fontSize: 12, color: "#888", margin: "-6px 0 4px" }}>
          Utilisés pour vos statistiques d&apos;appels et pour le mode "sonnerie d&apos;abord" ci-dessus.
        </p>
        {DAYS.map(day => (
          <div key={day} style={{ display: "grid", gridTemplateColumns: "100px 1fr", alignItems: "center", gap: 10 }}>
            <label style={{ fontWeight: 700, fontSize: 13, textTransform: "capitalize", display: "flex", alignItems: "center", gap: 6 }}>
              <input type="checkbox" checked={!s.openingHours[day]?.closed} onChange={e => setDay(day, "closed", !e.target.checked)} />{day}
            </label>
            {!s.openingHours[day]?.closed ? (
              <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13, flexWrap: "wrap" }}>
                <input type="time" value={s.openingHours[day]?.open} onChange={e => setDay(day, "open", e.target.value)} style={timeInput} />
                <span>–</span>
                <input type="time" value={s.openingHours[day]?.close} onChange={e => setDay(day, "close", e.target.value)} style={timeInput} />
                {!isArtisan && <>
                  <span style={{ color: "#bbb" }}>|</span>
                  <input type="time" value={s.openingHours[day]?.dinnerOpen} onChange={e => setDay(day, "dinnerOpen", e.target.value)} style={timeInput} />
                  <span>–</span>
                  <input type="time" value={s.openingHours[day]?.dinnerClose} onChange={e => setDay(day, "dinnerClose", e.target.value)} style={timeInput} />
                </>}
              </div>
            ) : <span style={{ fontSize: 13, color: "#999" }}>Fermé</span>}
          </div>
        ))}
      </Section>

      <Section title="🤖 Infos pour l'IA">
        <Field label="Message d'accueil personnalisé"><input value={s.welcomeMessage} onChange={e => setS({ ...s, welcomeMessage: e.target.value })} style={inputStyle} placeholder={isArtisan ? "Ex: Bonjour, ici Provence Nature Services !" : "Ex: Bonjour, ici La Bella Pizza !"} /></Field>
        {!isArtisan && <>
          <Field label="Promotions en cours"><textarea value={s.currentPromos} onChange={e => setS({ ...s, currentPromos: e.target.value })} style={{ ...inputStyle, minHeight: 60 }} /></Field>
          <Field label="Informations allergènes"><textarea value={s.allergensInfo} onChange={e => setS({ ...s, allergensInfo: e.target.value })} style={{ ...inputStyle, minHeight: 60 }} /></Field>
        </>}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div style={{ marginBottom: 24, border: "1px solid #2a1a3e", borderRadius: 16, padding: 20, background: "#111" }}><h2 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 800 }}>{title}</h2><div style={{ display: "grid", gap: 12 }}>{children}</div></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label style={{ display: "grid", gap: 5, fontSize: 13, fontWeight: 600, color: "#444" }}>{label}{children}</label>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />{label}</label>;
}

const btnPrimary: React.CSSProperties = { padding: "10px 18px", borderRadius: 12, border: "none", background: "#6b1fad", color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 14 };
const btnSecondary: React.CSSProperties = { padding: "10px 18px", borderRadius: 12, border: "1px solid #2a1a3e", background: "transparent", color: "#ccc", fontWeight: 700, cursor: "pointer", fontSize: 13, width: "fit-content" };
const inputStyle: React.CSSProperties = { padding: "8px 12px", borderRadius: 10, border: "1px solid #2a1a3e", background: "#0a0a0a", color: "#fff", fontSize: 14, width: "100%", boxSizing: "border-box" };
const timeInput: React.CSSProperties = { padding: "6px 8px", borderRadius: 8, border: "1px solid #2a1a3e", background: "#0a0a0a", color: "#fff", fontSize: 13 };

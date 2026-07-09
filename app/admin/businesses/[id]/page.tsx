"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Event = {
  id: string;
  createdAt: string;
  type: string;
  status: string;
  customerName?: string | null;
  customerPhone?: string | null;
  summary?: string | null;
};

type Conversation = {
  id: string;
  createdAt: string;
};

type AuditLogEntry = {
  id: string;
  createdAt: string;
  action: string;
  actorEmail?: string | null;
};

type BusinessDetail = {
  id: string;
  name: string;
  vertical: string;
  status: string;
  twilioNumber?: string | null;
  phone?: string | null;
  address?: string | null;
  customerEmail?: string | null;
  phoneVerified?: boolean;
  createdAt: string;
  subscriptionStatus?: string | null;
  subscriptionPlan?: string | null;
  trialEndsAt?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  _count: { menuItems: number; events: number; conversations: number };
  events: Event[];
  conversations: Conversation[];
  auditLogs: AuditLogEntry[];
};

const SUBSCRIPTION_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  active: { label: "✓ Abonné actif", bg: "#1a3e2a", color: "#4ade80" },
  trialing: { label: "✓ Essai en cours", bg: "#1a3e2a", color: "#4ade80" },
  past_due: { label: "⚠️ Paiement en retard", bg: "#3e2e14", color: "#f0c674" },
  cancelled: { label: "✕ Abonnement annulé", bg: "#3e1a1a", color: "#ff6b6b" },
  canceled: { label: "✕ Abonnement annulé", bg: "#3e1a1a", color: "#ff6b6b" },
  inactive: { label: "— Sans abonnement", bg: "#1a1a2e", color: "#666" },
};

const EVENT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: "Nouveau", color: "#4ade80" },
  handled: { label: "Traité", color: "#888" },
  no_followup: { label: "Sans suite", color: "#f0c674" },
};

function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

function daysSince(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

export default function BusinessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [business, setBusiness] = useState<BusinessDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/businesses/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setBusiness(data?.error ? null : data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div style={{ padding: 40, color: "#666" }}>Chargement…</div>;
  if (!business) return <div style={{ padding: 40, color: "#666" }}>Client introuvable. <Link href="/admin" style={{ color: "#9b4fdd" }}>Retour</Link></div>;

  const subInfo = business.subscriptionStatus ? SUBSCRIPTION_LABELS[business.subscriptionStatus] : null;
  const lastActivity = business.conversations[0]?.createdAt ?? null;
  const daysSinceActivity = daysSince(lastActivity);
  const isDormant = business.subscriptionStatus === "active" && (daysSinceActivity === null || daysSinceActivity > 7);
  const missingTwilio = (business.subscriptionStatus === "active" || business.subscriptionStatus === "trialing") && !business.twilioNumber;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", padding: 20 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        <button onClick={() => router.push("/admin")} style={backBtn}>← Retour à la liste</button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16, marginBottom: 24, flexWrap: "wrap" }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", margin: 0 }}>{business.name}</h1>
          <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 99, background: "#2a1a3e", color: "#9b4fdd", fontWeight: 700 }}>{business.vertical}</span>
          {subInfo && (
            <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 99, background: subInfo.bg, color: subInfo.color, fontWeight: 800 }}>
              {subInfo.label}
            </span>
          )}
        </div>

        {(missingTwilio || isDormant) && (
          <div style={{ display: "grid", gap: 8, marginBottom: 24 }}>
            {missingTwilio && (
              <div style={{ background: "#3e1a1a", border: "1px solid #8a2a2a", borderRadius: 14, padding: "12px 18px", color: "#ff8a8a", fontSize: 14, fontWeight: 700 }}>
                🚨 Ce client est abonné mais n&apos;a aucun numéro Twilio attribué — son agent ne peut recevoir aucun appel.
              </div>
            )}
            {isDormant && (
              <div style={{ background: "#3e2e14", border: "1px solid #b8860b", borderRadius: 14, padding: "12px 18px", color: "#f0c674", fontSize: 14, fontWeight: 700 }}>
                😴 Aucun appel reçu depuis {daysSinceActivity === null ? "jamais" : `${daysSinceActivity} jours`} — vérifiez que le renvoi d&apos;appel est bien actif chez le client.
              </div>
            )}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <div style={panelStyle}>
            <h3 style={panelTitle}>📋 Informations</h3>
            <Row label="Email" value={business.customerEmail ?? "—"} />
            <Row label="Téléphone client" value={business.phone ?? "—"} />
            <Row label="Numéro vérifié" value={business.phoneVerified ? "✓ Oui" : "✕ Non"} />
            <Row label="Adresse" value={business.address ?? "—"} />
            <Row label="Créé le" value={formatDateTime(business.createdAt)} />
            <Row label="Statut compte" value={business.status} />
          </div>

          <div style={panelStyle}>
            <h3 style={panelTitle}>📞 Agent vocal & abonnement</h3>
            <Row label="Numéro Twilio" value={business.twilioNumber ?? "— Non attribué"} />
            <Row label="Plan" value={business.subscriptionPlan ?? "—"} />
            {business.trialEndsAt && (
              <Row label="Fin d'essai" value={new Date(business.trialEndsAt).toLocaleDateString("fr-FR")} />
            )}
            <Row label="Dernier appel" value={formatDateTime(lastActivity)} />
            <Row label="Total appels" value={String(business._count.conversations)} />
            {business.stripeCustomerId && (
              <div style={{ marginTop: 10 }}>
                <a
                  href={`https://dashboard.stripe.com/customers/${business.stripeCustomerId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#9b4fdd", fontSize: 13, fontWeight: 700, textDecoration: "none" }}
                >
                  Voir sur Stripe →
                </a>
              </div>
            )}
          </div>
        </div>

        <div style={panelStyle}>
          <h3 style={panelTitle}>🗒️ Demandes récentes ({business._count.events})</h3>
          {business.events.length === 0 ? (
            <p style={{ color: "#666", fontSize: 14 }}>Aucune demande enregistrée pour l&apos;instant.</p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {business.events.map((e) => {
                const statusInfo = EVENT_STATUS_LABELS[e.status] ?? { label: e.status, color: "#888" };
                return (
                  <div key={e.id} style={{ border: "1px solid #2a1a3e", borderRadius: 12, padding: "12px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>{e.customerName ?? "Client anonyme"}</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: statusInfo.color }}>{statusInfo.label}</span>
                    </div>
                    <p style={{ margin: 0, color: "#aaa", fontSize: 13 }}>{e.summary ?? "—"}</p>
                    <p style={{ margin: "6px 0 0", color: "#555", fontSize: 12 }}>{formatDateTime(e.createdAt)}{e.customerPhone ? ` · ${e.customerPhone}` : ""}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ ...panelStyle, marginTop: 16 }}>
          <h3 style={panelTitle}>📜 Historique des actions admin</h3>
          {business.auditLogs.length === 0 ? (
            <p style={{ color: "#666", fontSize: 14 }}>Aucune action enregistrée.</p>
          ) : (
            <div style={{ display: "grid", gap: 6 }}>
              {business.auditLogs.map((log) => (
                <div key={log.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#888", borderBottom: "1px solid #1a1a2e", paddingBottom: 6 }}>
                  <span>{log.action}{log.actorEmail ? ` — ${log.actorEmail}` : ""}</span>
                  <span>{formatDateTime(log.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #1a1a2e", fontSize: 13 }}>
      <span style={{ color: "#888" }}>{label}</span>
      <span style={{ color: "#fff", fontWeight: 600 }}>{value}</span>
    </div>
  );
}

const panelStyle: React.CSSProperties = { border: "1px solid #2a1a3e", borderRadius: 16, padding: 20, background: "#111" };
const panelTitle: React.CSSProperties = { fontSize: 14, fontWeight: 800, color: "#fff", margin: "0 0 12px" };
const backBtn: React.CSSProperties = { padding: "8px 14px", borderRadius: 10, border: "1px solid #2a1a3e", background: "transparent", color: "#ccc", fontWeight: 700, cursor: "pointer", fontSize: 13 };

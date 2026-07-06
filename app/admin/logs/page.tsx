"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type LogEntry = {
  id: string;
  createdAt: string;
  actorEmail: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  business: { name: string } | null;
  metadata: unknown;
};

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/logs")
      .then((r) => r.json())
      .then(setLogs)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", padding: 20 }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: "#fff", margin: 0 }}>📜 Logs d&apos;audit</h1>
          <Link href="/admin" style={{ color: "#9b4fdd", fontSize: 13, fontWeight: 700 }}>← Retour</Link>
        </div>

        {loading ? (
          <p style={{ color: "#888" }}>Chargement…</p>
        ) : logs.length === 0 ? (
          <p style={{ color: "#888" }}>Aucune action enregistrée pour le moment.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {logs.map((log) => (
              <div
                key={log.id}
                style={{
                  border: "1px solid #2a1a3e",
                  borderRadius: 12,
                  padding: "14px 16px",
                  background: "#111",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>{log.action}</span>
                  <span style={{ color: "#666", fontSize: 12 }}>
                    {new Date(log.createdAt).toLocaleString("fr-FR")}
                  </span>
                </div>
                <div style={{ color: "#aaa", fontSize: 13 }}>
                  Par : {log.actorEmail ?? "inconnu"}
                  {log.business?.name && ` — Business : ${log.business.name}`}
                </div>
                {log.targetType && (
                  <div style={{ color: "#666", fontSize: 12 }}>
                    Cible : {log.targetType} ({log.targetId})
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

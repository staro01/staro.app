"use client";

import { createContext, useCallback, useContext, useState } from "react";

type ToastType = "success" | "error";
type ToastItem = { id: number; message: string; type: ToastType };

const ToastContext = createContext<{ showToast: (message: string, type?: ToastType) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: "fixed", bottom: 24, right: 24, display: "flex", flexDirection: "column", gap: 10, zIndex: 1000,
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: t.type === "success" ? "#1a2e1a" : "#2e1414",
            border: `1px solid ${t.type === "success" ? "#4ade80" : "#e11d48"}`,
            color: "#fff",
            borderRadius: 12,
            padding: "12px 18px",
            fontSize: 14,
            fontWeight: 700,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            minWidth: 220,
            animation: "staro-toast-in 0.2s ease-out",
          }}>
            {t.type === "success" ? "✅" : "⚠️"} {t.message}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes staro-toast-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

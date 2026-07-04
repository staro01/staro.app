import type { CSSProperties } from "react";

export const colors = {
  bg: "#0a0a0a",
  bgDeep: "#05050a",
  card: "#111111",
  border: "#2a1a3e",
  borderLight: "#3a2a52",
  purple1: "#6b1fad",
  purple2: "#9b4fdd",
  text: "#ffffff",
  textSecondary: "#cccccc",
  textMuted: "#888888",
};

export const gradient = `linear-gradient(135deg, ${colors.purple1}, ${colors.purple2})`;

export const container: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "0 20px",
};

export const card: CSSProperties = {
  background: colors.card,
  border: `1px solid ${colors.border}`,
  borderRadius: 16,
};

export const sectionTitle: CSSProperties = {
  fontSize: "clamp(28px, 4vw, 40px)",
  fontWeight: 900,
  color: colors.text,
  margin: "0 0 16px",
  lineHeight: 1.15,
};

export const sectionSubtitle: CSSProperties = {
  fontSize: 17,
  color: colors.textMuted,
  lineHeight: 1.6,
  margin: 0,
};

export const btnPrimary: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  background: gradient,
  color: "#fff",
  fontWeight: 800,
  fontSize: 15,
  padding: "14px 28px",
  borderRadius: 12,
  border: "none",
  textDecoration: "none",
  cursor: "pointer",
  boxShadow: "0 8px 30px rgba(155,79,221,0.35)",
};

export const btnSecondary: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  background: "transparent",
  color: colors.text,
  fontWeight: 800,
  fontSize: 15,
  padding: "14px 28px",
  borderRadius: 12,
  border: `1px solid ${colors.border}`,
  textDecoration: "none",
  cursor: "pointer",
};

export function Section({
  id,
  children,
  style,
}: {
  id?: string;
  children: React.ReactNode;
  style?: CSSProperties;
}) {
  return (
    <section id={id} style={{ padding: "80px 0", position: "relative", ...style }}>
      <div style={container}>{children}</div>
    </section>
  );
}

import { SignIn } from "@clerk/nextjs";

const clerkAppearance = {
  variables: {
    colorPrimary: "#6b1fad",
    colorBackground: "#111111",
    colorText: "#ffffff",
    colorTextSecondary: "#aaaaaa",
    colorInputBackground: "#0a0a0a",
    colorInputText: "#ffffff",
    borderRadius: "12px",
  },
  elements: {
    card: { border: "1px solid #2a1a3e", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" },
    headerTitle: { color: "#fff" },
    headerSubtitle: { color: "#aaa" },
    socialButtonsBlockButton: { border: "1px solid #2a1a3e" },
    formButtonPrimary: { background: "linear-gradient(135deg, #6b1fad, #9b4fdd)", fontWeight: 800 },
    footerActionLink: { color: "#9b4fdd" },
  },
};

export default function SignInPage() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      background: "#0a0a0a", gap: 28, position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `
          radial-gradient(circle at 20% 20%, rgba(107,31,173,0.35), transparent 45%),
          radial-gradient(circle at 80% 15%, rgba(155,79,221,0.25), transparent 40%),
          radial-gradient(circle at 50% 90%, rgba(107,31,173,0.3), transparent 50%),
          linear-gradient(180deg, #0a0a0a 0%, #0d0714 100%)
        `,
      }} />
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.4,
        backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }} />

      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{
          background: "linear-gradient(135deg, #6b1fad, #9b4fdd)", borderRadius: 10, width: 40, height: 40,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
          boxShadow: "0 0 30px rgba(155,79,221,0.5)",
        }}>✦</span>
        <span style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>Staro.app</span>
      </div>
      <div style={{ position: "relative" }}>
        <SignIn appearance={clerkAppearance} />
      </div>
    </div>
  );
}

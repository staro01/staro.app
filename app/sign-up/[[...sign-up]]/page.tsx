import { SignUp } from "@clerk/nextjs";

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

export default function SignUpPage() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      background: "#0a0a0a", gap: 28,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{
          background: "linear-gradient(135deg, #6b1fad, #9b4fdd)", borderRadius: 10, width: 40, height: 40,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
        }}>✦</span>
        <span style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>Staro.app</span>
      </div>
      <SignUp appearance={clerkAppearance} />
    </div>
  );
}

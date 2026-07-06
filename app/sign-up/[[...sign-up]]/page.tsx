"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SignUp } from "@clerk/nextjs";
import StarryBackground from "../../../components/StarryBackground";

const clerkAppearance = {
  variables: {
    colorPrimary: "#6b1fad",
    colorBackground: "#111111",
    colorText: "#ffffff",
    colorTextSecondary: "#cccccc",
    colorInputBackground: "#0a0a0a",
    colorInputText: "#ffffff",
    borderRadius: "12px",
  },
  elements: {
    card: { border: "1px solid #2a1a3e", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" },
    headerTitle: { color: "#fff" },
    headerSubtitle: { color: "#ccc" },
    socialButtonsBlockButton: { border: "1px solid #2a1a3e" },
    formButtonPrimary: { background: "linear-gradient(135deg, #6b1fad, #9b4fdd)", fontWeight: 800 },
    footerActionLink: { color: "#9b4fdd" },
    formFieldLabel: { color: "#ddd" },
    identityPreviewText: { color: "#ddd" },
    formFieldInputShowPasswordButton: { color: "#888" },
    dividerText: { color: "#888" },
    footerActionText: { color: "#aaa" },
  },
};

function SignUpContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? undefined;

  return (
    <SignUp
      appearance={clerkAppearance}
      initialValues={email ? { emailAddress: email } : undefined}
    />
  );
}

export default function SignUpPage() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      background: "#05050a", gap: 28, position: "relative", overflow: "hidden",
    }}>
      <StarryBackground />

      <Link
        href="/"
        style={{
          position: "fixed",
          top: 24,
          left: 24,
          zIndex: 10,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          color: "#ccc",
          fontSize: 14,
          fontWeight: 700,
          textDecoration: "none",
        }}
      >
        ← Retour au site
      </Link>

      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
        <img src="/logo-badge.png" alt="Staro.app" width={40} height={40} style={{ borderRadius: 10, boxShadow: "0 0 30px rgba(155,79,221,0.5)" }} />
        <span style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>Staro.app</span>
      </div>
      <div style={{ position: "relative" }}>
        <Suspense fallback={null}>
          <SignUpContent />
        </Suspense>
      </div>
    </div>
  );
}

"use client";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignOutPage() {
  const { signOut } = useClerk();
  const router = useRouter();
  useEffect(() => {
    signOut(() => router.push("/sign-in"));
  }, []);
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
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
      Déconnexion...
    </div>
  );
}

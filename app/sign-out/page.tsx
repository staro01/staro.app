"use client";
import { useClerk } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignOutPage() {
  const { signOut } = useClerk();
  const router = useRouter();
  useEffect(() => {
    signOut(() => router.push("/sign-in"));
  }, []);
  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Déconnexion...</div>;
}

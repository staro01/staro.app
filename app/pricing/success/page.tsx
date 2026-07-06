"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import FloatingHeader from "../../../components/FloatingHeader";
import Footer from "../../../components/marketing/Footer";
import { colors, card, btnPrimary } from "../../../components/marketing/theme";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }
    setStatus("ok");
  }, [sessionId]);

  return (
    <div style={{ ...card, padding: 48, maxWidth: 560, width: "100%", textAlign: "center" }}>
      {status === "loading" && <p style={{ color: colors.textMuted }}>Vérification du paiement...</p>}

      {status === "ok" && (
        <>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h1 style={{ color: colors.text, fontSize: 24, fontWeight: 900, margin: "0 0 12px" }}>
            Paiement confirmé !
          </h1>
          <p style={{ color: colors.textMuted, fontSize: 15, lineHeight: 1.7, margin: "0 0 28px" }}>
            Merci pour votre confiance. Créez votre compte dès maintenant pour configurer votre agent vocal
            Staro et démarrer votre activité.
          </p>
          <Link href="/sign-up" style={{ ...btnPrimary, width: "100%" }}>
            Créer mon compte
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ color: colors.text, fontSize: 22, fontWeight: 900, margin: "0 0 12px" }}>
            Session introuvable
          </h1>
          <p style={{ color: colors.textMuted, fontSize: 15, lineHeight: 1.7, margin: "0 0 28px" }}>
            Nous n&apos;avons pas pu vérifier votre paiement. Si vous pensez qu&apos;il s&apos;agit d&apos;une
            erreur, contactez-nous.
          </p>
          <Link href="/contact" style={{ ...btnPrimary, width: "100%" }}>
            Nous contacter
          </Link>
        </>
      )}
    </div>
  );
}

export default function PricingSuccessPage() {
  return (
    <div style={{ background: colors.bg, minHeight: "100vh" }}>
      <FloatingHeader />

      <section style={{ padding: "160px 20px 100px", display: "flex", justifyContent: "center" }}>
        <Suspense fallback={<p style={{ color: colors.textMuted }}>Chargement...</p>}>
          <SuccessContent />
        </Suspense>
      </section>

      <Footer />
    </div>
  );
}

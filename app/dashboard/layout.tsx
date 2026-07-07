import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureBusinessForCurrentUser } from "../../lib/business-bootstrap";
import { prisma } from "../../lib/prisma";
import { isAdminEmail } from "../../lib/admin";
import Link from "next/link";

export const dynamic = "force-dynamic";

const ARTISAN_VERTICALS = ["paysagiste", "plombier", "electricien"];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const email = user.primaryEmailAddress?.emailAddress;
  if (isAdminEmail(email)) redirect("/admin");

  const business = await ensureBusinessForCurrentUser();

  if (business && business.status !== "approved") {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ maxWidth: 480, textAlign: "center", border: "1px solid #2a1a3e", borderRadius: 20, padding: 40, background: "#111" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: "#fff", margin: "0 0 12px" }}>Compte en attente de validation</h1>
          <p style={{ color: "#888", fontSize: 14, lineHeight: 1.6, margin: "0 0 20px" }}>
            Votre inscription a bien été reçue. Notre équipe va valider votre compte sous peu — vous recevrez un accès complet dès l'approbation.
          </p>
          <Link href="/sign-out" style={{ color: "#9b4fdd", fontSize: 13, fontWeight: 700 }}>Se déconnecter</Link>
        </div>
      </div>
    );
  }

  const menuCount = business ? await prisma.menuItem.count({ where: { businessId: business.id } }) : 0;
  const needsOnboarding = !business?.name || (business.name.startsWith("Business ") && (business.name.includes("@") || business.name.length < 20));

  if (needsOnboarding && menuCount === 0) redirect("/onboarding");

  const vertical = business?.vertical ?? "pizzeria";
  const isRestaurant = ["pizzeria", "restaurant"].includes(vertical);
  const isCoiffeur = ["coiffeur"].includes(vertical);
  const isArtisan = ARTISAN_VERTICALS.includes(vertical);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a" }}>
      <header style={{ background: "#111111", borderBottom: "1px solid #2a1a3e", padding: "14px 20px" }}>
        <div className="staro-header-inner">
          <div className="staro-top-row">
            <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
              <img src="/logo-badge.png" alt="Staro.app" width={32} height={32} style={{ borderRadius: 8 }} />
              Staro.app
            </div>
            <Link href="/sign-out" style={{ fontSize: 13, color: "#888" }}>Déconnexion</Link>
          </div>
          <nav className="staro-nav">
            {isRestaurant && <>
              <Link href="/dashboard" className="staro-nav-link">📋 Commandes</Link>
              <Link href="/dashboard/menu" className="staro-nav-link">🍽️ Ma carte</Link>
            </>}
            {isCoiffeur && <>
              <Link href="/dashboard/agenda" className="staro-nav-link">📅 Agenda</Link>
              <Link href="/dashboard/agenda?tab=services" className="staro-nav-link">✂️ Services & Équipe</Link>
            </>}
            {isArtisan && <>
              <Link href="/dashboard/requests" className="staro-nav-link">📨 Mes demandes</Link>
            </>}
            {!isRestaurant && !isCoiffeur && !isArtisan && <>
              <Link href="/dashboard/agenda" className="staro-nav-link">📅 Agenda</Link>
            </>}
            <Link href="/dashboard/settings" className="staro-nav-link">⚙️ Paramètres</Link>
          </nav>
        </div>
      </header>
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
        {children}
      </main>
    </div>
  );
}

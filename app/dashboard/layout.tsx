import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureBusinessForCurrentUser } from "../../lib/business-bootstrap";
import { prisma } from "../../lib/prisma";
import { isAdminEmail } from "../../lib/admin";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const email = user.emailAddresses[0]?.emailAddress;
  if (isAdminEmail(email)) redirect("/admin");

  const business = await ensureBusinessForCurrentUser();
  const menuCount = business ? await prisma.menuItem.count({ where: { businessId: business.id } }) : 0;
  const needsOnboarding = !business?.name || (business.name.startsWith("Business ") && (business.name.includes("@") || business.name.length < 20));
  
  if (needsOnboarding && menuCount === 0) redirect("/onboarding");

  const vertical = business?.vertical ?? "pizzeria";
  const isRestaurant = ["pizzeria", "restaurant"].includes(vertical);
  const isCoiffeur = ["coiffeur"].includes(vertical);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a" }}>
      <header style={{ background: "#111111", borderBottom: "1px solid #2a1a3e", padding: "14px 20px" }}>
        <div className="staro-header-inner">
          <div className="staro-top-row">
            <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ background: "linear-gradient(135deg, #6b1fad, #9b4fdd)", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✦</span>
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
            {!isRestaurant && !isCoiffeur && <>
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

const navStyle: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 10,
  border: "1px solid #2a1a3e",
  fontWeight: 700,
  fontSize: 14,
  textDecoration: "none",
  color: "#ccc",
  background: "#1a1a2e",
};

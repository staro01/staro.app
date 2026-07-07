"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "../../lib/prisma";
import { redirect } from "next/navigation";
import OrdersDashboard from "./OrdersDashboard";

const ARTISAN_VERTICALS = ["paysagiste", "plombier", "electricien"];

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const business = await prisma.business.findFirst({ where: { clerkUserId: user.id } });
  if (!business) redirect("/onboarding");

  const vertical = business.vertical ?? "";
  if (["pizzeria", "restaurant"].includes(vertical)) return <OrdersDashboard />;
  if (ARTISAN_VERTICALS.includes(vertical)) redirect("/dashboard/requests");

  redirect("/dashboard/agenda");
}

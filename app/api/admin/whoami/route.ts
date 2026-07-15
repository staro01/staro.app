import { currentUser } from "@clerk/nextjs/server";
import { isAdminEmail, isCommercialEmail } from "../../../../lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  if (isAdminEmail(email)) return Response.json({ role: "admin" });
  if (isCommercialEmail(email)) return Response.json({ role: "commercial" });
  return Response.json({ role: null }, { status: 403 });
}

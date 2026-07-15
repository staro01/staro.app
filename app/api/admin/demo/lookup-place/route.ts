import { currentUser } from "@clerk/nextjs/server";
import { isAdminOrCommercialEmail } from "../../../../../lib/admin";
import { lookupPlace } from "../../../../../core/googlePlaces";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!isAdminOrCommercialEmail(user?.primaryEmailAddress?.emailAddress)) {
    return Response.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const query = body?.query?.trim();
  if (!query) {
    return Response.json({ error: "Requête vide" }, { status: 400 });
  }

  try {
    const result = await lookupPlace(query);
    if (!result) {
      return Response.json({ error: "Aucun établissement trouvé" }, { status: 404 });
    }
    return Response.json(result);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, { status: 500 });
  }
}

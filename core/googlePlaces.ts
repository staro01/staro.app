export type PlaceLookupResult = {
  name: string;
  address: string | null;
  phone: string | null;
  openingHours: string[] | null;
  primaryType: string | null;
  suggestedVertical: "pizzeria" | "coiffeur" | "electricien" | "plombier" | "garagiste" | "unknown";
};

const HAIR_TYPES = ["hair_salon", "beauty_salon", "hair_care"];
const ELECTRICIAN_TYPES = ["electrician"];
const PLUMBER_TYPES = ["plumber"];
const CAR_REPAIR_TYPES = ["car_repair"];

const FOOD_TYPES = ["restaurant", "pizza_restaurant", "meal_takeaway", "meal_delivery", "fast_food_restaurant", "food"];

function guessVertical(primaryType: string | null): PlaceLookupResult["suggestedVertical"] {
  if (HAIR_TYPES.includes(primaryType ?? "")) return "coiffeur";
  if (ELECTRICIAN_TYPES.includes(primaryType ?? "")) return "electricien";
  if (PLUMBER_TYPES.includes(primaryType ?? "")) return "plombier";
  if (CAR_REPAIR_TYPES.includes(primaryType ?? "")) return "garagiste";
  if (FOOD_TYPES.includes(primaryType ?? "")) return "pizzeria";
  // Pas de type Google dédié pour paysagiste/chauffagiste : on ne devine pas, on laisse le champ tel quel côté UI
  return "unknown";
}

export async function lookupPlace(query: string): Promise<PlaceLookupResult | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_PLACES_API_KEY manquant");

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.internationalPhoneNumber,places.regularOpeningHours,places.primaryType",
    },
    body: JSON.stringify({ textQuery: query, languageCode: "fr", regionCode: "FR" }),
  });

  if (!res.ok) {
    throw new Error(`Erreur Google Places (${res.status}): ${await res.text()}`);
  }

  const data = await res.json();
  const place = data.places?.[0];
  if (!place) return null;

  const openingHours: string[] | null = place.regularOpeningHours?.weekdayDescriptions ?? null;
  const primaryType: string | null = place.primaryType ?? null;

  return {
    name: place.displayName?.text ?? query,
    address: place.formattedAddress ?? null,
    phone: place.internationalPhoneNumber ?? null,
    openingHours,
    primaryType,
    suggestedVertical: guessVertical(primaryType),
  };
}

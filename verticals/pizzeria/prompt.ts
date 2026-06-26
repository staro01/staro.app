import type { Business, MenuItem, Supplement } from "@prisma/client";

export function buildPizzeriaPrompt(
  business: Business,
  menuItems: MenuItem[],
  supplements: Supplement[]
): string {

  if (business.vacationMode) {
    return `Tu es l'assistant vocal de "${business.name}".
Le restaurant est fermé. Dis : "${business.vacationMessage ?? "Le restaurant est actuellement fermé. Merci de rappeler."}"
Raccroche poliment après.`;
  }

  const menu: Record<string, MenuItem[]> = {};
  for (const item of menuItems.filter(i => i.available)) {
    if (!menu[item.category]) menu[item.category] = [];
    menu[item.category].push(item);
  }

  const menuLines = Object.entries(menu).map(([cat, items]) => {
    const lines = items.map(i => `  - ${i.name} : ${i.price}€${i.description ? ` (${i.description})` : ""}`).join("\n");
    return `${cat.charAt(0).toUpperCase() + cat.slice(1)}s :\n${lines}`;
  }).join("\n\n");

  const suppLines = supplements.filter(s => s.available).length > 0
    ? supplements.filter(s => s.available).map(s => `  - ${s.name} : ${s.price > 0 ? `+${s.price}€` : "gratuit"}`).join("\n")
    : "  Aucun supplément disponible.";

  return `Tu es l'assistant vocal de la pizzeria "${business.name}". Tu prends les commandes par téléphone en français.

## Règles absolues
- Phrases courtes et naturelles. Tu parles, tu n'écris pas.
- Zéro formatage : pas de tirets, listes, astérisques.
- UNE seule question par réplique.
- Tu ne récapitules PAS après chaque article.
- Tu confirmes UNE SEULE FOIS à la fin.
- Si le client pose une question hors-script : réponds brièvement et reprends la commande.

## Menu
${menuLines || "Menu non configuré."}

## Suppléments
${suppLines}

## Infos pratiques
- Temps de préparation : ${business.estimatedPrepTime ?? 20} minutes
- ${business.deliveryEnabled ? `Livraison disponible.${business.deliveryFee ? ` Frais : ${business.deliveryFee}€.` : ""}${business.deliveryMinimum ? ` Minimum : ${business.deliveryMinimum}€.` : ""}` : "À emporter uniquement."}
- Paiement : ${business.paymentMethods ?? "CB, espèces"}
${business.allergensInfo ? `- Allergènes : ${business.allergensInfo}` : ""}
${business.currentPromos ? `- Promotions : ${business.currentPromos}` : ""}

## Déroulé
1. Prendre les articles sans récapituler.
2. Proposer boisson/dessert une seule fois.
3. Emporter ou livraison ?
4. Prénom et nom.
5. Numéro de téléphone — répéter en groupes.
6. Si livraison : adresse complète.
7. Confirmer le total UNE SEULE FOIS.
8. Phrase de clôture + bloc COMMANDE_PRETE.

## Signal de fin
<COMMANDE_PRETE>
{"type":"TAKEAWAY_OR_DELIVERY","customerName":"...","phone":"0612345678","address":"...","items":[{"name":"...","qty":1,"note":"..."}],"total":0}
</COMMANDE_PRETE>

Règles JSON :
- "type" : "DELIVERY" ou "TAKEAWAY"
- "phone" : 10 chiffres sans espaces
- "address" : numéro + rue + ville, "" si à emporter
- "note" : suppléments/personnalisations, "" si aucune
- "total" : nombre en euros
- Seulement après confirmation explicite du client.`;
}

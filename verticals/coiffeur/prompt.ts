import type { Business, Service, Staff, Appointment } from "@prisma/client";
import { formatParisDate, formatParisTime, parisDateKey, parisWeekday } from "../../lib/timezone";

const DAY_NAMES = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

type DaySchedule = { open: string; close: string; dinnerOpen: string; dinnerClose: string; closed: boolean };

export function buildCoiffeurPrompt(
  business: Business,
  services: Service[],
  staff: Staff[],
  upcomingAppointments: Appointment[],
  now: Date = new Date()
): string {
  if (business.vacationMode) {
    return `Tu es l'assistant vocal de "${business.name}".
Le salon est fermé. Dis : "${business.vacationMessage ?? "Le salon est actuellement fermé. Merci de rappeler."}"
Raccroche poliment après.`;
  }

  const openingHours = (business.openingHours ?? {}) as Record<string, DaySchedule>;

  const availableServices = services.filter(s => s.available);
  const serviceLines = availableServices
    .map(s => `  - [${s.id}] ${s.name} : ${s.duration} minutes, ${s.price}€`)
    .join("\n");

  const availableStaff = staff.filter(s => s.available);
  const staffLines = availableStaff.length > 0
    ? availableStaff.map(s => `  - [${s.id}] ${s.name}`).join("\n")
    : "";

  const dayBlocks: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const dayKey = DAY_NAMES[parisWeekday(d)];
    const sched = openingHours[dayKey];
    const dateLabel = formatParisDate(d);
    const dayStr = parisDateKey(d);

    if (!sched || sched.closed) {
      dayBlocks.push(`- ${dateLabel} (${dayStr}) : FERMÉ toute la journée, ne propose aucun créneau ce jour-là.`);
      continue;
    }

    const blocks: string[] = [];
    if (sched.open && sched.close) blocks.push(`${sched.open}-${sched.close}`);
    if (sched.dinnerOpen && sched.dinnerClose && sched.dinnerClose !== sched.close) {
      blocks.push(`${sched.dinnerOpen}-${sched.dinnerClose}`);
    }
    if (blocks.length === 0) {
      dayBlocks.push(`- ${dateLabel} (${dayStr}) : FERMÉ toute la journée, ne propose aucun créneau ce jour-là.`);
      continue;
    }

    const busy = upcomingAppointments
      .filter(a => parisDateKey(a.startAt) === dayStr && a.status !== "cancelled")
      .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())
      .map(a => `${formatParisTime(a.startAt)}-${formatParisTime(a.endAt)}${a.staffId ? ` (occupé: ${a.staffId})` : ""}`)
      .join(", ");

    dayBlocks.push(
      `- ${dateLabel} (${dayStr}) : ouvert de ${blocks.join(" puis de ")} (fermé entre les deux si deux créneaux sont listés)${busy ? ` | déjà pris : ${busy}` : " | rien de pris"}`
    );
  }

  const staffInstruction = availableStaff.length === 0
    ? `- Aucun coiffeur n'est configuré : laisse "staffId" vide.`
    : availableStaff.length === 1
      ? `- Un seul coiffeur existe (${availableStaff[0].name}) : assigne-le automatiquement sans le demander, "staffId":"${availableStaff[0].id}".`
      : `- Plusieurs coiffeurs existent : demande "Avec quel coiffeur souhaitez-vous ce rendez-vous ?" après avoir choisi le service. Si le client répond "peu importe" ou ne sait pas, choisis toi-même un coiffeur disponible sur ce créneau (regarde qui est déjà occupé dans les disponibilités ci-dessous) et annonce son nom dans le récapitulatif final. Le champ "staffId" ne doit JAMAIS rester vide s'il y a des coiffeurs disponibles.`;

  return `Tu es l'assistant vocal du salon de coiffure "${business.name}". Tu prends les rendez-vous par téléphone en français.

## Règles ABSOLUES — ne jamais enfreindre
- Réponses TRÈS courtes : 1 à 2 phrases maximum par tour.
- Tu parles, tu n'écris pas. Jamais de liste, tiret, astérisque.
- UNE seule question par réplique.
- Tu NE récapitules PAS ce que le client vient de dire.
- Tu salues toujours avec "Bonjour" peu importe l'heure.
- Si le client dit "[silence]" : dis juste "Vous êtes là ?"
- Si le client demande explicitement à parler à un humain, une vraie personne, ou au salon directement (pas à toi) : dis UNE phrase courte du type "Je vous transfère tout de suite." puis termine IMMÉDIATEMENT ta réponse par le marqueur <TRANSFERT_HUMAIN/>, sans rien ajouter d'autre après.
- Tu ne proposes JAMAIS un créneau qui chevauche un créneau déjà pris pour le coiffeur choisi, ni en dehors des horaires d'ouverture.
- Si un jour est marqué "FERMÉ toute la journée" ci-dessous, dis clairement au client que le salon est fermé CE JOUR-LÀ (pas une autre raison), et propose un autre jour ouvert.
- Nous sommes le ${formatParisDate(now)}, il est ${formatParisTime(now)} (heure de Paris). Ne propose jamais un créneau déjà passé aujourd'hui.
- Toutes les heures que tu donnes ou reçois sont en heure de Paris.
- Quand tu prononces une heure à voix haute, écris-la TOUJOURS en toutes lettres (exemple : "neuf heures trente", "dix-sept heures") et jamais en chiffres abrégés (jamais "9h30" ou "17h"), pour que la voix de synthèse la prononce clairement.
${staffInstruction}

## Services proposés
${serviceLines || "Aucun service configuré."}

${availableStaff.length > 0 ? `## Équipe\n${staffLines}\n` : ""}
## Disponibilités des 7 prochains jours (horaires d'ouverture et créneaux déjà pris par coiffeur, heure de Paris)
${dayBlocks.join("\n") || "Aucune disponibilité configurée."}

## Déroulé naturel — suivre dans l'ordre
1. Demander quel service le client souhaite.
2. S'il y a plusieurs coiffeurs, demander avec qui (voir règle ci-dessus). Si un seul coiffeur, passer directement à l'étape suivante.
3. Demander quel jour l'arrange, puis proposer 2 à 3 créneaux disponibles les plus proches pour ce service et ce coiffeur, en respectant sa durée et les disponibilités ci-dessus. Si le jour demandé est fermé, le dire clairement et proposer un autre jour.
4. Une fois le créneau choisi : "C'est à quel nom ?"
5. "Votre numéro de téléphone ?"
6. Récapituler en une phrase et confirmer : "Donc [service] avec [coiffeur] le [jour] à [heure], c'est bien ça ?"
7. Après confirmation explicite : phrase courte de clôture + bloc RDV_PRET.

## Signal de fin — produire UNIQUEMENT après confirmation explicite du client
<RDV_PRET>
{"serviceId":"...","staffId":"...","customerName":"...","phone":"0612345678","startAt":"2026-07-06T14:30:00","notes":""}
</RDV_PRET>

Règles JSON :
- "serviceId" : l'identifiant exact entre crochets dans la liste des services ci-dessus.
- "staffId" : l'identifiant exact entre crochets du coiffeur assigné (voir règle ci-dessus, ne pas laisser vide s'il y a des coiffeurs disponibles).
- "phone" : 10 chiffres sans espaces ni tirets.
- "startAt" : date et heure ISO du créneau confirmé, SANS "Z" et SANS décalage — c'est l'heure locale de Paris telle quelle.
- "notes" : précisions du client, "" si aucune.
- Ne produire ce bloc QU'après confirmation explicite du client.`;
}

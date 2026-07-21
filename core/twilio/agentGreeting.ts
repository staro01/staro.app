import type { Business } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { gatherSay } from "./incoming";

const ARTISAN_VERTICALS = ["paysagiste", "plombier", "electricien", "chauffagiste", "garagiste"];

export async function buildAgentGreetingResponse(business: Business, baseUrl: string, callSid: string) {
  let defaultGreet: string;
  if (business.vertical === "coiffeur") {
    defaultGreet = `Bonjour, salon ${business.name}, que puis-je faire pour vous ?`;
  } else if (ARTISAN_VERTICALS.includes(business.vertical)) {
    defaultGreet = `Bonjour, ${business.name}, je vous écoute.`;
  } else {
    defaultGreet = `Bonjour, pizzerie ${business.name}, puis-je prendre votre commande ?`;
  }

  const baseGreet = business.welcomeMessage?.trim() ? business.welcomeMessage.trim() : defaultGreet;
  // Mention légale obligatoire : informe l'appelant qu'un assistant vocal IA
  // traite l'appel, avant toute autre chose (art. 226-1 du Code pénal).
  const greet = `${baseGreet} Cet appel est traité par un assistant vocal.`;

  if (callSid) {
    await prisma.conversation.upsert({
      where: { externalId: callSid },
      update: {},
      create: { externalId: callSid, businessId: business.id, messages: [{ role: "assistant", content: greet }] },
    });
  }

  return gatherSay(baseUrl, greet, "/api/twilio/voice/handle-speech");
}

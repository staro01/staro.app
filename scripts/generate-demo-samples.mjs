import { config } from "dotenv";
config({ path: ".env.local" });
import { writeFile, mkdir } from "fs/promises";

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error("ELEVENLABS_API_KEY manquant dans .env.local");
  process.exit(1);
}

const SAMPLES = [
  {
    id: "chaleureux",
    voiceId: "cgSgspJ2msm6clMCkdW9", // Jessica
    text: "Bonjour et bienvenue chez Le Petit Comptoir ! Je peux prendre votre réservation ou répondre à vos questions sur le menu. Comment puis-je vous aider ?",
  },
  {
    id: "elegant",
    voiceId: "pFZP5JQG7iQjIQuC4Bku", // Lily
    text: "Bonjour, vous êtes bien chez Studio Coiffure. Souhaitez-vous prendre rendez-vous ou avez-vous une question sur nos prestations ?",
  },
  {
    id: "efficace",
    voiceId: "BilXxxvRLrA8YTteM2sl", // Oris (voix prod actuelle)
    text: "Bonjour, agence Dupont Plomberie, je vous écoute. Devis, intervention urgente, ou autre chose ?",
  },
  {
    id: "dynamique",
    voiceId: "jGpnMdbhtKgQbVrYezOx", // Kev
    text: "Hello, bienvenue chez Fit Club ! Rendez-vous, question sur nos cours, ou autre chose, je suis là pour vous aider !",
  },
];

await mkdir("public/demo/samples", { recursive: true });

for (const s of SAMPLES) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${s.voiceId}`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      text: s.text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });

  if (!res.ok) {
    console.error(`Échec pour ${s.id}:`, res.status, await res.text());
    continue;
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(`public/demo/samples/${s.id}.mp3`, buffer);
  console.log(`✅ ${s.id}.mp3 généré`);
}

import { config } from "dotenv";
config({ path: ".env.local" });

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error("ELEVENLABS_API_KEY manquant dans .env.local");
  process.exit(1);
}

const res = await fetch("https://api.elevenlabs.io/v1/voices", {
  headers: { "xi-api-key": apiKey },
});

if (!res.ok) {
  console.error("Erreur API:", res.status, await res.text());
  process.exit(1);
}

const data = await res.json();
for (const v of data.voices) {
  const labels = v.labels ? Object.values(v.labels).join(", ") : "";
  console.log(`${v.voice_id}  |  ${v.name}  |  ${labels}`);
}

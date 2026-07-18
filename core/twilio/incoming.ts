import { signTts } from "./ttsSign";

export function xml(body: string) {
  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export function getBaseUrl(req: Request) {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : "";
}

export function escapeXml(s: string) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

export function say(text: string) {
  return `<Say language="fr-FR" voice="Polly.Lea">${escapeXml(text)}</Say>`;
}

export function ttsUrl(baseUrl: string, text: string) {
  const expiresAt = Date.now() + 10 * 60 * 1000; // valide 10 minutes
  const sig = signTts(text, expiresAt);
  const params = new URLSearchParams({ text, exp: String(expiresAt), sig });
  return escapeXml(`${baseUrl}/api/tts?${params.toString()}`);
}

export function gatherSay(baseUrl: string, text: string, actionPath: string) {
  const action = `${baseUrl}${actionPath}`;
  const hasElevenLabs = !!(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_VOICE_ID);
  const audioElement = hasElevenLabs
    ? `<Play>${ttsUrl(baseUrl, text)}</Play>`
    : `${say(text)}`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" language="fr-FR" speechModel="phone_call" hints="oui, non, exact, c'est ça, correct, tout à fait, exactement, d'accord" speechTimeout="auto" actionOnEmptyResult="true" action="${action}" method="POST">
    ${audioElement}
  </Gather>
  ${hasElevenLabs ? `<Play>${ttsUrl(baseUrl, "Je n'ai pas entendu. Répétez s'il vous plaît.")}</Play>` : say("Je n'ai pas entendu. Répétez s'il vous plaît.")}
  <Redirect method="POST">${action}</Redirect>
</Response>`;
}

export function hangupTwiml(baseUrl: string, text: string) {
  const hasElevenLabs = !!(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_VOICE_ID);
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${hasElevenLabs ? `<Play>${ttsUrl(baseUrl, text)}</Play>` : say(text)}
  <Pause length="2"/>
  <Hangup/>
</Response>`;
}

// Joue un message d'accueil court confirmant à l'appelant qu'il est bien au bon endroit,
// puis fait sonner le vrai téléphone de l'artisan, et bascule sur le fallback (l'agent Staro)
// si personne ne répond dans le délai imparti.
export function ringThenFallbackTwiml(baseUrl: string, phoneNumber: string, fallbackActionPath: string, greetingText: string) {
  const action = `${baseUrl}${fallbackActionPath}`;
  const hasElevenLabs = !!(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_VOICE_ID);
  const audioElement = hasElevenLabs
    ? `<Play>${ttsUrl(baseUrl, greetingText)}</Play>`
    : `${say(greetingText)}`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${audioElement}
  <Dial timeout="18" action="${action}" method="POST">${escapeXml(phoneNumber)}</Dial>
</Response>`;
}

export function dialTwiml(baseUrl: string, text: string, phoneNumber: string) {
  const hasElevenLabs = !!(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_VOICE_ID);
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${hasElevenLabs ? `<Play>${ttsUrl(baseUrl, text)}</Play>` : say(text)}
  <Dial>${escapeXml(phoneNumber)}</Dial>
</Response>`;
}

export function normPhone(p?: string | null) {
  const raw = (p ?? "").trim().replace(/\s+/g, "");
  if (!raw) return "";
  if (raw.startsWith("+")) return raw;
  if (raw.startsWith("33")) return `+${raw}`;
  if (raw.startsWith("0") && raw.length === 10) return `+33${raw.slice(1)}`;
  return raw;
}

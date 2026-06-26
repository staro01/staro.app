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

export function gatherSay(baseUrl: string, text: string, actionPath: string) {
  const action = `${baseUrl}${actionPath}`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" language="fr-FR" speechTimeout="auto" actionOnEmptyResult="true" action="${action}" method="POST">
    ${say(text)}
  </Gather>
  ${say("Je n'ai pas entendu. Répétez s'il vous plaît.")}
  <Redirect method="POST">${action}</Redirect>
</Response>`;
}

export function hangupTwiml(text: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${say(text)}
  <Hangup/>
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

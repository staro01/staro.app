import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const audioCache = new Map<string, ArrayBuffer>();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const text = (searchParams.get("text") ?? "").trim();
  if (!text) return new Response("Missing text", { status: 400 });

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  if (!apiKey || !voiceId) return new Response("Missing ElevenLabs env vars", { status: 500 });

  const cacheKey = `${voiceId}:${text}`;

  if (audioCache.has(cacheKey)) {
    return new Response(audioCache.get(cacheKey), {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=3600" },
    });
  }

  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_22050_32`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({
      text,
      model_id: "eleven_turbo_v2_5",
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.0, speaker_boost: false },
    }),
  });

  if (!r.ok) {
    const err = await r.text().catch(() => "");
    console.error("ElevenLabs error:", r.status, err);
    return new Response(`ElevenLabs error: ${r.status}`, { status: 500 });
  }

  const arrayBuffer = await r.arrayBuffer();
  if (text.length < 200) audioCache.set(cacheKey, arrayBuffer);

  return new Response(arrayBuffer, {
    headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=3600" },
  });
}

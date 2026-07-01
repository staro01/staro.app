import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const text = (searchParams.get("text") ?? "").trim();

  if (!text) return new Response("Missing text", { status: 400 });

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey || !voiceId) {
    return new Response("Missing ElevenLabs env vars", { status: 500 });
  }

  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=ulaw_8000`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/ulaw",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.4, similarity_boost: 0.85, style: 0.2, speaker_boost: true },
    }),
  });

  if (!r.ok) {
    const err = await r.text().catch(() => "");
    console.error("ElevenLabs error:", r.status, err);
    return new Response(`ElevenLabs error: ${r.status}`, { status: 500 });
  }

  const audio = await r.arrayBuffer();
  return new Response(audio, {
    headers: {
      "Content-Type": "audio/ulaw",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

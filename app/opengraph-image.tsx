import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Staro.app — L'agent vocal IA pour les commerces locaux";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #05010f 0%, #1a0a2e 60%, #05010f 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 30 }}>
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: 20,
              background: "linear-gradient(135deg, #6b1fad, #9b4fdd)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48,
            }}
          >
            ✦
          </div>
          <div style={{ fontSize: 56, fontWeight: 900 }}>Staro.app</div>
        </div>
        <div style={{ fontSize: 34, fontWeight: 700, textAlign: "center", maxWidth: 900, opacity: 0.9 }}>
          Ne ratez plus aucun appel.
        </div>
        <div style={{ fontSize: 22, marginTop: 20, opacity: 0.7, textAlign: "center", maxWidth: 800 }}>
          L&apos;agent vocal IA qui répond pour votre commerce, 24/7.
        </div>
      </div>
    ),
    { ...size }
  );
}

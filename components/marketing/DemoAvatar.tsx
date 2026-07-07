"use client";

import { DemoPersona } from "./demoPersonas";

function HairShape({ type, gradId }: { type: DemoPersona["hair"]; gradId: string }) {
  switch (type) {
    case "afro":
      return (
        <path
          d="M62,120 Q55,55 130,50 Q205,55 198,120 Q198,95 130,90 Q62,95 62,120 Z"
          fill={`url(#${gradId})`}
        />
      );
    case "long":
      return (
        <path
          d="M62,110 Q55,45 130,40 Q205,45 198,110 L198,222 Q175,192 175,142 L85,142 Q85,192 62,222 Z"
          fill={`url(#${gradId})`}
        />
      );
    case "short":
      return (
        <path d="M65,95 Q65,35 130,35 Q195,35 195,95 Q195,72 130,68 Q65,72 65,95 Z" fill={`url(#${gradId})`} />
      );
    case "cap":
      return (
        <>
          <path
            d="M62,115 Q55,58 130,53 Q205,58 198,115 Q198,96 130,88 Q62,96 62,115 Z"
            fill={`url(#${gradId})`}
          />
          <rect x="60" y="106" width="140" height="16" rx="8" fill={`url(#${gradId})`} />
        </>
      );
  }
}

type Props = {
  persona: DemoPersona;
  isPlaying: boolean;
  onClick: () => void;
};

export default function DemoAvatar({ persona, isPlaying, onClick }: Props) {
  const gradId = `hairGrad-${persona.id}`;
  const [c1, c2] = persona.hairGradient;

  return (
    <button
      onClick={onClick}
      aria-label={`Écouter le style ${persona.name}`}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${isPlaying ? persona.accent : "rgba(255,255,255,0.08)"}`,
        borderRadius: 20,
        padding: "28px 20px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        transition: "border-color 0.2s, transform 0.2s",
        transform: isPlaying ? "translateY(-4px)" : "none",
      }}
    >
      <svg viewBox="0 0 260 260" width="130" height="130">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
          <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f3d2ab" />
            <stop offset="100%" stopColor="#e0b183" />
          </linearGradient>
        </defs>

        <ellipse cx="130" cy="235" rx="48" ry="9" fill="#000" opacity={0.3} />

        <HairShape type={persona.hair} gradId={gradId} />
        <ellipse cx="130" cy="150" rx="68" ry="76" fill="url(#skinGrad)" />

        <circle cx="105" cy="145" r="6" fill="#2b2321" />
        <circle cx="107" cy="142" r="2" fill="#fff" />
        <circle cx="155" cy="145" r="6" fill="#2b2321" />
        <circle cx="157" cy="142" r="2" fill="#fff" />
        <path d="M95,133 Q105,127 115,133" fill="none" stroke="#2b2321" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M145,133 Q155,127 165,133" fill="none" stroke="#2b2321" strokeWidth="2.5" strokeLinecap="round" />

        <ellipse
          cx="130"
          cy="180"
          rx="15"
          ry={isPlaying ? 13 : 8}
          fill="#7a3b2e"
          style={{
            transformOrigin: "130px 180px",
            animation: isPlaying ? "staro-talk 0.28s ease-in-out infinite" : "none",
          }}
        />

        {[
          { d: "M208,130 Q225,140 208,150", op: 0.9 },
          { d: "M220,120 Q245,140 220,160", op: 0.55 },
          { d: "M232,108 Q265,140 232,172", op: 0.3 },
        ].map((wave, i) => (
          <path
            key={i}
            d={wave.d}
            fill="none"
            stroke={persona.accent}
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity={isPlaying ? wave.op : wave.op * 0.25}
            style={{
              animation: isPlaying ? `staro-wave 0.9s ease-in-out ${i * 0.12}s infinite` : "none",
              transformOrigin: "208px 140px",
            }}
          />
        ))}
      </svg>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>{persona.name}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>{persona.tagline}</div>
      </div>

      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: persona.accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          color: "#fff",
        }}
      >
        {isPlaying ? "❚❚" : "▶"}
      </div>

      <style>{`
        @keyframes staro-talk {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1); }
        }
        @keyframes staro-wave {
          0%, 100% { opacity: 0.3; transform: scale(0.92); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </button>
  );
}

import { SignIn } from "@clerk/nextjs";

const clerkAppearance = {
  variables: {
    colorPrimary: "#6b1fad",
    colorBackground: "#111111",
    colorText: "#ffffff",
    colorTextSecondary: "#aaaaaa",
    colorInputBackground: "#0a0a0a",
    colorInputText: "#ffffff",
    borderRadius: "12px",
  },
  elements: {
    card: { border: "1px solid #2a1a3e", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" },
    headerTitle: { color: "#fff" },
    headerSubtitle: { color: "#aaa" },
    socialButtonsBlockButton: { border: "1px solid #2a1a3e" },
    formButtonPrimary: { background: "linear-gradient(135deg, #6b1fad, #9b4fdd)", fontWeight: 800 },
    footerActionLink: { color: "#9b4fdd" },
  },
};

function generateStars(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 4,
    duration: Math.random() * 3 + 2,
  }));
}

function generateShootingStars(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    top: Math.random() * 40,
    left: Math.random() * 60,
    delay: Math.random() * 8,
    duration: Math.random() * 2 + 2.5,
  }));
}

export default function SignInPage() {
  const stars = generateStars(90);
  const shootingStars = generateShootingStars(4);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      background: "#05050a", gap: 28, position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `
          radial-gradient(circle at 20% 15%, rgba(107,31,173,0.25), transparent 40%),
          radial-gradient(circle at 80% 10%, rgba(155,79,221,0.18), transparent 35%),
          radial-gradient(circle at 50% 100%, rgba(107,31,173,0.22), transparent 50%),
          linear-gradient(180deg, #05050a 0%, #0b0614 60%, #0d0714 100%)
        `,
      }} />

      {stars.map(s => (
        <div key={s.id} style={{
          position: "absolute", top: `${s.top}%`, left: `${s.left}%`,
          width: s.size, height: s.size, borderRadius: "50%",
          background: "#fff", pointerEvents: "none",
          animation: `staro-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
        }} />
      ))}

      {shootingStars.map(s => (
        <div key={s.id} style={{
          position: "absolute", top: `${s.top}%`, left: `${s.left}%`,
          width: 2, height: 2, pointerEvents: "none",
          animation: `staro-shoot ${s.duration}s linear ${s.delay}s infinite`,
        }}>
          <div style={{
            width: 90, height: 2, borderRadius: 2,
            background: "linear-gradient(90deg, #fff, rgba(155,79,221,0.6), transparent)",
            transform: "rotate(-35deg)",
            boxShadow: "0 0 6px 1px rgba(255,255,255,0.6)",
          }} />
        </div>
      ))}

      <style>{`
        @keyframes staro-twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        @keyframes staro-shoot {
          0% { transform: translate(0, 0); opacity: 0; }
          5% { opacity: 1; }
          20% { transform: translate(320px, 220px); opacity: 0; }
          100% { transform: translate(320px, 220px); opacity: 0; }
        }
      `}</style>

      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{
          background: "linear-gradient(135deg, #6b1fad, #9b4fdd)", borderRadius: 10, width: 40, height: 40,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
          boxShadow: "0 0 30px rgba(155,79,221,0.5)",
        }}>✦</span>
        <span style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>Staro.app</span>
      </div>
      <div style={{ position: "relative" }}>
        <SignIn appearance={clerkAppearance} />
      </div>
    </div>
  );
}

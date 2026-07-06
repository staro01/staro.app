import { colors } from "./theme";

export default function HeroOverlay({ to = colors.bgDeep }: { to?: string }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background: `linear-gradient(to bottom, transparent 55%, ${to} 100%)`,
      }}
    />
  );
}

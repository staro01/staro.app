"use client";

import { CSSProperties, ReactNode } from "react";
import HeroBackground from "./HeroBackground";
import HeroOverlay from "./HeroOverlay";
import { colors } from "./theme";

export default function PageHero({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        background: colors.bgDeep,
        padding: "150px 20px 90px",
        ...style,
      }}
    >
      <HeroBackground />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
      <HeroOverlay />
    </section>
  );
}

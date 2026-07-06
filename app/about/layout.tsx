import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos | Staro.app",
  description: "Staro est l'agent vocal IA qui répond au téléphone pour les commerces locaux, 24/7, sans jamais se fatiguer.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos",
  description: "Staro est l'agent vocal IA qui répond au téléphone pour les commerces locaux, 24/7, sans jamais se fatiguer.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "À propos de Staro.app",
    description: "Découvrez pourquoi nous avons créé Staro et notre mission pour les commerces locaux.",
    url: "https://www.staro.app/about",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tarifs",
  description: "Une offre simple et sans surprise pour tous les commerces locaux : mise en place unique, puis un abonnement mensuel ou annuel.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Tarifs Staro.app",
    description: "499€ de mise en place, puis 60€/mois ou 700€/an. Un seul palier, pensé pour tous les commerces locaux.",
    url: "https://www.staro.app/pricing",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tarifs | Staro.app",
  description: "Une offre simple et sans surprise pour tous les commerces locaux : mise en place unique, puis un abonnement mensuel ou annuel.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}

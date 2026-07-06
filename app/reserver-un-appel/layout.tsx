import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Réserver un appel",
  description: "Choisissez le créneau qui vous arrange et découvrez comment Staro peut répondre à votre place, dès aujourd'hui.",
  alternates: { canonical: "/reserver-un-appel" },
  openGraph: {
    title: "Réservez un appel avec Staro.app",
    description: "Un échange de 15 minutes pour voir comment Staro peut répondre au téléphone à votre place.",
    url: "https://www.staro.app/reserver-un-appel",
  },
};

export default function ReserverUnAppelLayout({ children }: { children: React.ReactNode }) {
  return children;
}

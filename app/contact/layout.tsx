import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Une question sur Staro ? Écrivez-nous et notre équipe vous répond rapidement.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contactez Staro.app",
    description: "Une question sur Staro ? Écrivez-nous et notre équipe vous répond rapidement.",
    url: "https://www.staro.app/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}

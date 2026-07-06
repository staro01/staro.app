import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Staro.app",
  description: "Réservez un appel avec l'équipe Staro et découvrez comment notre agent vocal IA peut répondre pour votre commerce.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}

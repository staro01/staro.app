import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import { ToastProvider } from "../components/Toast";
import CookieConsent from "../components/CookieConsent";
import OrganizationJsonLd from "../components/seo/OrganizationJsonLd";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.staro.app"),
  title: {
    default: "Staro.app — L'agent vocal IA pour les commerces locaux",
    template: "%s | Staro.app",
  },
  description:
    "Staro répond au téléphone à la place de votre commerce, 24/7. Un agent vocal IA qui prend les appels, note les demandes et informe vos clients automatiquement.",
  keywords: [
    "agent vocal IA",
    "standard téléphonique automatique",
    "répondeur intelligent commerce",
    "IA pour commerce local",
    "assistant vocal restaurant",
    "assistant vocal salon de coiffure",
  ],
  authors: [{ name: "Staro.app" }],
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Staro.app",
    title: "Staro.app — L'agent vocal IA pour les commerces locaux",
    description: "Ne ratez plus aucun appel : Staro répond, prend les demandes et informe vos clients, 24/7.",
    url: "https://www.staro.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Staro.app — L'agent vocal IA pour les commerces locaux",
    description: "Ne ratez plus aucun appel : Staro répond, prend les demandes et informe vos clients, 24/7.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      localization={frFR}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <html lang="fr">
        <body>
          <OrganizationJsonLd />
          <ToastProvider>
            {children}
            <CookieConsent />
          </ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Staro.app",
  description: "Assistant vocal IA pour votre business",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}

import type { Metadata } from "next";
import { colors } from "../components/marketing/theme";
import FloatingHeader from "../components/FloatingHeader";
import Hero from "../components/marketing/Hero";
import Services from "../components/marketing/Services";
import Process from "../components/marketing/Process";
import Benefits from "../components/marketing/Benefits";
import Pricing from "../components/marketing/Pricing";
import Testimonials from "../components/marketing/Testimonials";
import FAQ from "../components/marketing/FAQ";
import FinalCTA from "../components/marketing/FinalCTA";
import Footer from "../components/marketing/Footer";

export const metadata: Metadata = {
  title: "Staro.app — L'agent vocal IA pour les commerces locaux",
  description:
    "Staro répond au téléphone à la place de votre commerce, 24/7. Un agent vocal IA qui prend les appels, note les demandes et informe vos clients automatiquement.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <div style={{ background: colors.bg }}>
      <FloatingHeader />
      <Hero />
      <Services />
      <Process />
      <Benefits />
      <Pricing />
      <Testimonials />
      <FAQ />
      <FinalCTA fadeTop />
      <Footer />
    </div>
  );
}

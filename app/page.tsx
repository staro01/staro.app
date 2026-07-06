import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAdminEmail } from "../lib/admin";
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

export default async function Home() {
  const user = await currentUser();

  if (user) {
    const email = user.emailAddresses[0]?.emailAddress;
    redirect(isAdminEmail(email) ? "/admin" : "/dashboard");
  }

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
      <FinalCTA />
      <Footer />
    </div>
  );
}

import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { Partner } from "@/components/partner";
import { Comparison } from "@/components/comparison";
import { FineTypes } from "@/components/fine-types";
import { Pricing } from "@/components/pricing";
import { FAQ } from "@/components/faq";
import { Trust } from "@/components/trust";
import { Footer } from "@/components/footer";

export default function Page() {
  return (
    <main className="min-h-screen">
      <Hero />
      <HowItWorks />
      <Partner />
      <Comparison />
      <FineTypes />
      <Pricing />
      <FAQ />
      <Trust />
      <Footer />
    </main>
  );
}

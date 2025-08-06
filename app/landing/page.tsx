import { LandingHero } from "@/components/landing/hero-section";
import { ProblemSolution } from "@/components/landing/problem-solution";
import { CoreFeatures } from "@/components/landing/core-features";
import { UseCases } from "@/components/landing/use-cases";
import { HowItWorks } from "@/components/landing/how-it-works";
import { SocialProof } from "@/components/landing/social-proof";
import { PricingSection } from "@/components/landing/pricing-section";
import { FAQ } from "@/components/landing/faq";
import { FinalCTA } from "@/components/landing/final-cta";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <LandingNavbar />
      <main>
        <LandingHero />
        <ProblemSolution />
        <CoreFeatures />
        <UseCases />
        <HowItWorks />
        <SocialProof />
        <PricingSection />
        <FAQ />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
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
import { Metadata } from "next";
import Script from "next/script";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  title: "Talkflo - AI-Powered Voice-to-Text Transcription",
  description: "Tired of typing? Turn your voice into perfectly formatted text, articles, and notes with Talkflo. Our AI captures your ideas so you can focus on what matters.",
  openGraph: {
    title: "Talkflo - AI-Powered Voice-to-Text Transcription",
    description: "Tired of typing? Turn your voice into perfectly formatted text, articles, and notes with Talkflo. Our AI captures your ideas so you can focus on what matters.",
    url: `${defaultUrl}/landing`,
  },
  twitter: {
    title: "Talkflo - AI-Powered Voice-to-Text Transcription",
    description: "Tired of typing? Turn your voice into perfectly formatted text, articles, and notes with Talkflo. Our AI captures your ideas so you can focus on what matters.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Talkflo",
  "applicationCategory": "Productivity",
  "operatingSystem": "Web, iOS, Android",
  "description": "Talkflo is an AI-powered voice-to-text transcription service that turns your spoken ideas into polished text instantly.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "1250"
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": `${defaultUrl}/landing`
  }
};

export default function LandingPage() {
  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
    </>
  );
}
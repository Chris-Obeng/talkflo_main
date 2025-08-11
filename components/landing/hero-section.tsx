"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

export function LandingHero() {
  const [waveformHeights, setWaveformHeights] = useState<number[]>([]);

  useEffect(() => {
    // Generate consistent heights on client side only
    const heights = Array.from({ length: 30 }, () => Math.random() * 30 + 10);
    setWaveformHeights(heights);
  }, []);

  return (
    <section className="relative pt-20 pb-16 overflow-hidden mt-16">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-stone-50 to-stone-100" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Turn Your Voice Into{" "}
            <span className="text-orange-500 relative">
              Perfect Text
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-orange-200 rounded-full" />
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Stop struggling with blank pages. Just hit record, speak your mind, and watch your ideas 
            transform into polished writing <em className="font-semibold">instantly</em>.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button 
              asChild 
              size="lg" 
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Link href="/auth/sign-up">
                <svg aria-hidden="true" className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z"/>
                  <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
                  <path d="M12 18v4M8 22h8"/>
                </svg>
                Start Recording Free
              </Link>
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
}

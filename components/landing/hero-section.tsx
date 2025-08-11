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
    <section className="relative pt-28 pb-24 overflow-hidden mt-12 spotlight">
      {/* Background gradient + grid */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-orange-50/40 to-stone-50" />
      <div className="absolute inset-0 bg-grid-slate-100 opacity-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            Turn Your Voice Into <span className="text-orange-600">Perfect Text</span>
            <span className="block text-xl sm:text-2xl text-slate-700 mt-4 font-normal">
              Instantly. <span className="text-orange-600 font-semibold">100% Free</span>.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Speak naturally and let AI turn rambling thoughts into clear, polished writing.
            Emails, notes, summaries, and more — ready in seconds.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
            >
              <Link href="/auth/sign-up">
                <svg aria-hidden="true" className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z" />
                  <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                  <path d="M12 18v4M8 22h8" />
                </svg>
                Start Speaking for Free
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 py-4 text-lg rounded-xl border-slate-200">
              <Link href="#how-it-works">See How It Works</Link>
            </Button>
          </div>

          {/* Trust row */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-slate-600">
            <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-md border border-stone-200 px-3 py-1.5 rounded-full shadow-sm">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
              100% Free Forever
            </div>
            <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-md border border-stone-200 px-3 py-1.5 rounded-full shadow-sm">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500" />
              No signup required to try
            </div>
          </div>

          {/* Animated demo card */}
          <div className="mt-12">
            <div className="mx-auto max-w-3xl glass-card rounded-2xl p-6">
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Waveform */}
                <div className="col-span-5 flex items-end h-24 gap-1">
                  {waveformHeights.length > 0
                    ? waveformHeights.map((h, i) => (
                        <div
                          key={i}
                          className="w-1.5 rounded-full bg-orange-400/80 animate-pulse"
                          style={{ height: `${h}px`, animationDelay: `${i * 0.05}s`, animationDuration: '1.2s' }}
                        />
                      ))
                    : Array.from({ length: 30 }).map((_, i) => (
                        <div key={i} className="w-1.5 rounded-full bg-orange-300" style={{ height: '20px' }} />
                      ))}
                </div>
                {/* Arrow */}
                <div className="col-span-2 flex justify-center">
                  <div className="bg-orange-100 text-orange-700 rounded-full p-3 shadow">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
                {/* Text lines */}
                <div className="col-span-5 space-y-2">
                  <div className="h-3 rounded bg-stone-200/80" />
                  <div className="h-3 rounded bg-stone-200/80 w-5/6" />
                  <div className="h-3 rounded bg-stone-200/80 w-2/3" />
                  <div className="h-3 rounded bg-stone-200/80 w-4/5" />
                  <div className="pt-2 flex gap-2">
                    <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4 2 2-6 6-4-4 2-2z"/></svg>
                      Formatted
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z"/></svg>
                      Ready to use
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

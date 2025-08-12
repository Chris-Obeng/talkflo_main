"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import type React from "react";
import { Mic, FileText } from "lucide-react";

function generateWavePoints(width: number, height: number, cycles: number, amplitudeFactor = 0.35) {
  const points: string[] = [];
  const centerY = height / 2;
  const pointsCount = 64;
  for (let i = 0; i <= pointsCount; i += 1) {
    const x = (i / pointsCount) * width;
    const t = (i / pointsCount) * cycles * Math.PI * 2;
    const y = centerY + Math.sin(t) * height * amplitudeFactor;
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return points.join(" ");
}

export function LandingHero() {

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
          <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed" itemProp="description">
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
                <Mic aria-hidden="true" className="w-5 h-5 mr-2" />
                Start Speaking for Free
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 py-4 text-lg rounded-xl border-slate-200">
              <Link href="#how-it-works">See How It Works</Link>
            </Button>
          </div>


          {/* Animated demo card */}
          <div className="mt-12">
            <div className="mx-auto max-w-3xl glass-card rounded-2xl p-6 border border-slate-200/60 shadow-xl relative overflow-hidden">
              {/* Decorative background */}
              <div className="absolute -top-10 -left-10 w-56 h-56 rounded-full blob-orange opacity-40" />
              <div className="absolute -bottom-16 -right-12 w-64 h-64 rounded-full blob-sky opacity-40" />
              {/* Sparkles */}
              <div className="sparkle absolute top-6 right-10" style={{ animationDelay: '0.2s' }} />
              <div className="sparkle absolute bottom-8 left-8" style={{ animationDelay: '0.6s' }} />
              <div className="sparkle absolute top-1/2 left-1/2" style={{ animationDelay: '1s' }} />

              {/* Window bar */}
              <div className="flex items-center justify-between mb-5 relative z-10">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-300" />
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-300" />
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-300" />
                </div>
                <span className="text-[11px] tracking-wide text-slate-500">Live demo</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center relative z-10">
                {/* Voice side */}
                <div className="sm:col-span-5">
                  <div className="flex items-center gap-2 mb-3 text-sm text-slate-600">
                    <Mic aria-hidden="true" className="w-4 h-4 text-orange-600" />
                    <span>Your voice</span>
                  </div>
                  <div className="relative h-24">
                    {/* Wave Visualizer Overlay */}
                    <div className="wave-overlay pointer-events-none absolute inset-0 opacity-80">
                      <svg viewBox="0 0 600 96" className="absolute left-0 top-0 h-full w-[200%] -translate-x-1/4">
                        <defs>
                          <filter id="waveGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                              <feMergeNode in="coloredBlur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        <polyline
                          points={generateWavePoints(600, 96, 2.2, 0.32)}
                          className="wave-path stroke-orange-400/80"
                          strokeWidth="2.5"
                          fill="none"
                          filter="url(#waveGlow)"
                        />
                        <polyline
                          points={generateWavePoints(600, 96, 1.6, 0.22)}
                          className="wave-path wave-path-slow stroke-sky-400/60"
                          strokeWidth="2"
                          fill="none"
                          filter="url(#waveGlow)"
                        />
                      </svg>
                    </div>

                    {/* Equalizer bars in front */}
                    <div className="relative z-10 flex items-end h-full gap-[5px]">
                      {Array.from({ length: 28 }).map((_, i) => (
                        <div
                          key={i}
                          className="eq-bar eq-bar-glow w-1.5 rounded-full bg-gradient-to-t from-orange-500/85 to-orange-300"
                          style={{
                            animationDelay: `${i * 0.06}s`,
                            // Slight duration variation across bars
                            // @ts-ignore - CSS variable for animation duration
                            ['--dur' as any]: `${1.2 + (i % 5) * 0.12}s`,
                          } as React.CSSProperties}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="sm:col-span-2 flex justify-center relative">
                  <div className="bg-white/85 backdrop-blur border border-orange-200 text-orange-700 rounded-full p-3 shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                  {/* Floating AI badge */}
                  <div className="hidden sm:flex items-center gap-1 text-[10px] font-medium bg-gradient-to-r from-orange-100 to-sky-100 text-slate-700 px-2.5 py-1 rounded-full border border-white/60 shadow bob absolute -top-3 -right-2">
                    <svg className="w-3 h-3 text-orange-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.546 4.76h5.005l-4.05 2.942 1.546 4.76L12 11.52 7.953 14.46l1.546-4.76-4.05-2.94h5.005L12 2z"/></svg>
                    <span>AI polishing</span>
                  </div>
                </div>

                {/* Text side */}
                <div className="sm:col-span-5">
                  <div className="flex items-center gap-2 mb-3 text-sm text-slate-600">
                    <FileText aria-hidden="true" className="w-4 h-4 text-slate-700" />
                    <span>Polished text</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { w: '92%', d: '0s' },
                      { w: '84%', d: '0.15s' },
                      { w: '68%', d: '0.3s' },
                      { w: '88%', d: '0.45s' },
                    ].map((line, i) => (
                      <div
                        key={i}
                        className="typing-line h-3 rounded bg-stone-200/90 relative overflow-hidden"
                        style={{
                          // @ts-ignore CSS custom properties
                          ['--target-w' as any]: line.w,
                          ['--delay' as any]: line.d,
                          ['--type-dur' as any]: '1.8s',
                        } as React.CSSProperties}
                      >
                        <span className="pointer-events-none absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                      </div>
                    ))}

                    {/* Highlighted concluding line */}
                    <div className="mt-3 h-7 rounded-lg bg-gradient-to-r from-orange-500/10 via-amber-400/10 to-sky-400/10 border border-orange-200/30 flex items-center">
                      <span className="px-2 text-sm font-medium bg-gradient-to-r from-orange-600 to-sky-600 bg-clip-text text-transparent">Clear, ready-to-send text.</span>
                    </div>

                    <div className="pt-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full border border-emerald-200">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4 2 2-6 6-4-4 2-2z"/></svg>
                        Clean and formatted
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs bg-sky-50 text-sky-700 px-2 py-1 rounded-full border border-sky-200">
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
      </div>
    </section>
  );
}

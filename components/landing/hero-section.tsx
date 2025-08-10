"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function LandingHero() {
  const [waveformHeights, setWaveformHeights] = useState<number[]>([]);

  useEffect(() => {
    // Generate consistent heights on client side only
    const heights = Array.from({ length: 30 }, () => Math.random() * 30 + 10);
    setWaveformHeights(heights);
  }, []);

  return (
    <section className="relative pt-20 pb-16 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-stone-50 to-stone-100" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Social proof banner */}
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-orange-200">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className="w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full border-2 border-white"
                />
              ))}
            </div>
            <span className="text-sm text-slate-600 font-medium">
              Join 10,000+ creators who think out loud
            </span>
          </div>

          {/* Main headline */}
          <motion.h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Turn Your Voice Into{" "}
            <span className="text-orange-500 relative">
              Perfect Text
              <motion.div 
                className="absolute -bottom-2 left-0 right-0 h-1 bg-orange-200 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
              />
            </span>
          </motion.h1>

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
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-slate-300 text-slate-700 px-8 py-4 text-lg font-semibold hover:bg-slate-50"
            >
              <svg aria-hidden="true" className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1M9 16v-4a2 2 0 012-2h2a2 2 0 012 2v4M12 8V6a3 3 0 00-3-3H7a3 3 0 00-3 3v2" />
              </svg>
              Watch Demo
            </Button>
          </div>

          {/* Hero visual - Recording interface mockup */}
          <div className="relative max-w-4xl mx-auto" role="img" aria-label="A mockup of the Talkflo recording interface showing a waveform and transcribed text.">
            <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 p-8">
              <div className="bg-orange-500 rounded-xl p-6 text-white text-center mb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <svg aria-hidden="true" className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z"/>
                      <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
                      <path d="M12 18v4M8 22h8"/>
                    </svg>
                  </div>
                </div>
                <div className="text-2xl font-bold mb-2" aria-label="Recording time: 1 minute 23 seconds">01:23</div>
                {/* Animated waveform */}
                <div className="flex justify-center items-center space-x-1 h-12">
                  {waveformHeights.length > 0 ? waveformHeights.map((height, i) => (
                    <div
                      key={i}
                      className="w-1 bg-white/60 rounded-full animate-pulse"
                      style={{
                        height: `${height}px`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '2s'
                      }}
                    />
                  )) : (
                    // Fallback static bars for SSR
                    Array.from({ length: 30 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-white/60 rounded-full"
                        style={{
                          height: '20px'
                        }}
                      />
                    ))
                  )}
                </div>
              </div>
              
              {/* Text output preview */}
              <div className="bg-stone-50 rounded-lg p-6 text-left">
                <h3 className="font-semibold text-slate-800 mb-3">Your Perfect Text Output:</h3>
                <div className="space-y-3 text-slate-600">
                  <p dangerouslySetInnerHTML={{ __html: `"I've been thinking about our marketing strategy for Q2. We should focus on three key areas..."` }} />
                  <p className="opacity-60" dangerouslySetInnerHTML={{ __html: `"First, we need to improve our content creation process..."` }} />
                  <p className="opacity-40" dangerouslySetInnerHTML={{ __html: `"Second, let's explore partnership opportunities..."` }} />
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-orange-200 rounded-full opacity-20 animate-bounce" style={{animationDelay: '1s'}} />
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-orange-300 rounded-full opacity-30 animate-bounce" style={{animationDelay: '2s'}} />
          </div>
        </div>
      </div>
    </section>
  );
}
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border border-white rounded-full" />
        <div className="absolute top-40 right-20 w-24 h-24 border border-white rounded-full" />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 border border-white rounded-full" />
        <div className="absolute bottom-10 right-10 w-20 h-20 border border-white rounded-full" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
          Ready to Unlock Your Voice?
        </h2>
        
        <p className="text-xl sm:text-2xl text-orange-100 mb-8 leading-relaxed">
          Join thousands who&apos;ve ditched typing for speaking. Transform your ideas into perfect text in seconds, not hours.
        </p>

        {/* Value props */}
        <div className="grid sm:grid-cols-3 gap-6 mb-10 text-orange-100">
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span className="font-medium">30-day free trial</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span className="font-medium">No credit card required</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span className="font-medium">Cancel anytime</span>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button 
            asChild 
            size="lg"
            className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-4 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-200 border-0"
          >
            <Link href="/auth/sign-up">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z"/>
                <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
                <path d="M12 18v4M8 22h8"/>
              </svg>
              Start Your Free Trial
            </Link>
          </Button>
          
          <Button 
            variant="outline"
            size="lg"
            className="border-2 border-white text-white hover:bg-white hover:text-orange-600 px-8 py-4 text-lg font-semibold bg-transparent"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1M9 16v-4a2 2 0 012-2h2a2 2 0 012 2v4M12 8V6a3 3 0 00-3-3H7a3 3 0 00-3 3v2" />
            </svg>
            Watch 2-Min Demo
          </Button>
        </div>

        {/* Trust signals */}
        <div className="flex justify-center items-center gap-6 text-orange-200 text-sm flex-wrap">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
            <span>Enterprise Security</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>99.9% Uptime</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            <span>10,000+ Happy Users</span>
          </div>
        </div>

        {/* Urgency */}
        <div className="mt-8 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-orange-100">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm font-medium">Over 50 people signed up in the last 24 hours</span>
        </div>
      </div>
    </section>
  );
}
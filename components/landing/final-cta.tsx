"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mic } from "lucide-react";

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
          Ready to Transform How You Capture Ideas?
        </h2>
        
        <p className="text-xl sm:text-2xl text-orange-100 mb-8 leading-relaxed">
          Join thousands who&apos;ve ditched typing for speaking. Transform your ideas into perfect text in seconds, not hours.
        </p>


        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button 
            asChild 
            size="lg"
            className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-4 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-200 border-0 rounded-xl"
          >
            <Link href="/auth/sign-up">
              <Mic aria-hidden="true" className="w-5 h-5 mr-2" />
              Try Talkflo Free
            </Link>
          </Button>
          
        </div>

      </div>
    </section>
  );
}

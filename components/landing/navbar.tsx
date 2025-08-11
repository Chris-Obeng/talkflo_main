"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";

export function LandingNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/landing" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow ring-1 ring-white/30">
                <Mic aria-hidden="true" className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Talkflo</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="#how-it-works" className="text-slate-600 hover:text-slate-900 transition-colors">
              How it works
            </Link>
            <Link href="#features" className="text-slate-600 hover:text-slate-900 transition-colors">
              Features
            </Link>
            <Link href="/auth/login" className="text-slate-600 hover:text-slate-900 transition-colors">
              Sign In
            </Link>
            <Button asChild className="bg-orange-500 hover:bg-orange-600">
              <Link href="/auth/sign-up">Try Talkflo Free</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600">
              <Link href="/auth/sign-up">Try Free</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
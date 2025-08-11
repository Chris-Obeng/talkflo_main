"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/landing" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z"/>
                  <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
                  <path d="M12 18v4M8 22h8"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-slate-800">Talkflo</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/auth/login" className="text-slate-600 hover:text-slate-900 transition-colors">
              Sign In
            </Link>
            <Button asChild className="bg-orange-500 hover:bg-orange-600">
              <Link href="/auth/sign-up">Start Free</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600">
              <Link href="/auth/sign-up">Start Free</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
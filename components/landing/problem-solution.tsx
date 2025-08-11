"use client";

import { CheckCircle2, XCircle, ArrowRight, Mic, Sparkles } from "lucide-react";

export function ProblemSolution() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-5">
            Your Best Ideas Come When You&apos;re <span className="text-orange-500">Away From Your Desk</span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Tired of staring at blank documents? Your creativity flows when you&apos;re walking, driving, or simply away from the keyboard. Don&apos;t let brilliant thoughts slip away.
          </p>
        </div>

        {/* Cleaner Before / After cards */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Before */}
          <div className="rounded-2xl border border-stone-200 bg-white/70 backdrop-blur-md shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center justify-center rounded-full bg-rose-100 text-rose-700 w-10 h-10">
                <XCircle className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">Before Talkflo</h3>
            </div>
            <ul className="space-y-3 text-slate-700">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 inline-block w-2 h-2 rounded-full bg-rose-400" />
                <span>Staring at blank documents for hours</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 inline-block w-2 h-2 rounded-full bg-rose-400" />
                <span>Great ideas forgotten by the time you sit down</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 inline-block w-2 h-2 rounded-full bg-rose-400" />
                <span>Scattered voice memos you never revisit</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 inline-block w-2 h-2 rounded-full bg-rose-400" />
                <span>Writer&apos;s block killing productivity</span>
              </li>
            </ul>
          </div>

          {/* After */}
          <div className="rounded-2xl border border-stone-200 bg-white/70 backdrop-blur-md shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 w-10 h-10">
                <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">With Talkflo</h3>
            </div>
            <ul className="space-y-3 text-slate-700">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 inline-block w-2 h-2 rounded-full bg-emerald-400" />
                <span>Capture ideas instantly as you think them</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 inline-block w-2 h-2 rounded-full bg-emerald-400" />
                <span>Perfect text ready in seconds, not hours</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 inline-block w-2 h-2 rounded-full bg-emerald-400" />
                <span>Organized notes you actually use</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 inline-block w-2 h-2 rounded-full bg-emerald-400" />
                <span>10x faster content creation</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Simple flow row */}
        <div className="mt-10 grid sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white/70 backdrop-blur-md p-4">
            <div className="inline-flex items-center justify-center rounded-lg bg-orange-100 text-orange-700 w-10 h-10">
              <Mic className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="text-sm">
              <div className="font-medium text-slate-900">Speak anywhere</div>
              <div className="text-slate-600">Capture thoughts on the go</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white/70 backdrop-blur-md p-4">
            <div className="inline-flex items-center justify-center rounded-lg bg-orange-100 text-orange-700 w-10 h-10">
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="text-sm">
              <div className="font-medium text-slate-900">Transcribe instantly</div>
              <div className="text-slate-600">Accurate AI transcription</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white/70 backdrop-blur-md p-4">
            <div className="inline-flex items-center justify-center rounded-lg bg-orange-100 text-orange-700 w-10 h-10">
              <Sparkles className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="text-sm">
              <div className="font-medium text-slate-900">Polished text</div>
              <div className="text-slate-600">Ready to use in seconds</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
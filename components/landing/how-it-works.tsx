"use client";

import { Mic, MessageSquare, FileText } from "lucide-react";

export function HowItWorks() {
  const steps: Array<{
    number: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    visual: React.ReactNode;
  }> = [
    {
      number: "01",
      title: "Hit Record",
      description:
        "Tap the microphone or use the extension. Recording starts instantly—no setup.",
      icon: <Mic className="w-6 h-6" aria-hidden="true" />,
      visual: (
        <div className="rounded-xl border border-stone-200 bg-white/70 p-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-orange-700">
            <Mic className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="mt-3 text-center text-sm text-slate-600">Ready to record</div>
        </div>
      ),
    },
    {
      number: "02",
      title: "Speak Naturally",
      description:
        "Talk like you normally do. We handle accents, pacing, and context.",
      icon: <MessageSquare className="w-6 h-6" aria-hidden="true" />,
      visual: (
        <div className="rounded-xl border border-stone-200 bg-white/70 p-4">
          <div className="mx-auto flex h-14 items-end justify-center gap-1">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="w-1 rounded bg-orange-300"
                style={{ height: `${12 + ((i * 37) % 18)}px` }}
              />
            ))}
          </div>
          <div className="mt-3 text-center text-xs text-slate-600">Listening…</div>
        </div>
      ),
    },
    {
      number: "03",
      title: "Get Perfect Text",
      description:
        "Receive clean, organized writing—copy, edit, or export in seconds.",
      icon: <FileText className="w-6 h-6" aria-hidden="true" />,
      visual: (
        <div className="rounded-xl border border-stone-200 bg-white/70 p-4">
          <div className="space-y-2">
            <div className="h-2 w-5/6 rounded bg-stone-200" />
            <div className="h-2 w-2/3 rounded bg-stone-200" />
            <div className="h-2 w-4/5 rounded bg-stone-200" />
            <div className="pt-1 text-center text-xs text-emerald-700">Polished and ready</div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
            How It Works: <span className="text-orange-600">Simple as 1-2-3</span>
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-slate-600">
            From idea to text in under 30 seconds. No learning curve—just speak and go.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="group rounded-2xl border border-stone-200 bg-white/70 p-6 shadow-sm transition-colors hover:border-orange-300"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700">
                  {step.number}
                </div>
                <div className="text-orange-600">{step.icon}</div>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-slate-900">{step.title}</h3>
              <p className="mb-5 text-slate-600">{step.description}</p>
              <div>{step.visual}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

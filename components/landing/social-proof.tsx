import { Clock, Sparkles, Star } from "lucide-react";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function SocialProof() {
  const testimonials = [
    {
      name: "Ava Thompson",
      role: "Startup Founder",
      quote:
        "Talkflo turned my car-ride thoughts into investor-ready emails. It feels like having a writing assistant in my pocket.",
    },
    {
      name: "Marcus Lee",
      role: "Product Manager",
      quote:
        "Meeting notes used to be chaos. Now I speak, and Talkflo gives me action items and a perfect summary in seconds.",
    },
    {
      name: "Sara Patel",
      role: "Graduate Student",
      quote:
        "I brainstorm out loud and get clean, structured research notes. It legitimately saves hours every week.",
    },
    {
      name: "Daniel Carter",
      role: "Content Creator",
      quote:
        "From voice memos to publish-ready scripts—without friction. The fact that it’s free is wild.",
    },
  ];

  const stats = [
    { label: "Avg. time to text", value: "< 30s", icon: Clock },
    { label: "Users report saving", value: "10+ hrs/week", icon: Sparkles },
    { label: "Satisfaction", value: "4.9/5", icon: Star },
  ];

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Soft background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-orange-50/30 to-stone-50" />
      <div className="absolute inset-0 bg-grid-slate-100 opacity-30" />
      <div className="absolute -top-20 -left-10 w-72 h-72 rounded-full blob-orange opacity-30" />
      <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full blob-sky opacity-30" />
      <div className="sparkle absolute top-8 right-12" />
      <div className="sparkle absolute bottom-10 left-10" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Loved by People Who Think Out Loud
          </h2>
          <p className="text-slate-600 text-lg">Real results from busy humans just like you.</p>
          <div className="mx-auto mt-4 h-0.5 w-24 bg-gradient-to-r from-orange-400 via-amber-300 to-sky-400 rounded-full" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="glass-card rounded-2xl p-6 text-center border border-slate-200/60 shadow-sm">
                <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-sky-100 text-orange-700">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="text-3xl font-bold text-slate-900">{s.value}</div>
                <div className="text-slate-600 text-sm mt-1">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Testimonials */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => {
            const offset = i % 3 === 0 ? "md:-translate-y-2" : i % 3 === 2 ? "md:translate-y-2" : "";
            const gradientAvatar =
              i % 3 === 0
                ? "from-orange-100 to-amber-100 text-orange-700"
                : i % 3 === 1
                ? "from-sky-100 to-cyan-100 text-sky-700"
                : "from-emerald-100 to-lime-100 text-emerald-700";
            return (
              <div
                key={i}
                className={`relative glass-card rounded-2xl p-6 border border-slate-200/60 bg-white/85 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 ${offset}`}
              >
                <div className="h-0.5 w-14 bg-gradient-to-r from-orange-400 via-amber-300 to-sky-400 rounded-full mb-4" />
                <div className="absolute top-4 right-4 text-orange-500/50" aria-hidden="true">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M7.17 6C5.42 6 4 7.42 4 9.17V20h6V10a4 4 0 00-2.83-3.83zM17.17 6C15.42 6 14 7.42 14 9.17V20h6V10a4 4 0 00-2.83-3.83z"/></svg>
                </div>
                <p className="text-slate-800 leading-relaxed">“{t.quote}”</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${gradientAvatar} flex items-center justify-center text-sm font-semibold`}>{getInitials(t.name)}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{t.name}</span>
                      <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4 2 2-6 6-4-4 2-2z"/></svg>
                      </span>
                    </div>
                    <div className="text-slate-500 text-sm">{t.role}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
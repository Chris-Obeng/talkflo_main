export function SocialProof() {
  const testimonials = [
    {
      name: "Ava Thompson",
      role: "Startup Founder",
      quote:
        "Talkflo turned my car-ride thoughts into investor-ready emails. It feels like having a writing assistant in my pocket.",
      avatar: "😄",
    },
    {
      name: "Marcus Lee",
      role: "Product Manager",
      quote:
        "Meeting notes used to be chaos. Now I speak, and Talkflo gives me action items and a perfect summary in seconds.",
      avatar: "🧠",
    },
    {
      name: "Sara Patel",
      role: "Graduate Student",
      quote:
        "I brainstorm out loud and get clean, structured research notes. It legitimately saves hours every week.",
      avatar: "📚",
    },
    {
      name: "Daniel Carter",
      role: "Content Creator",
      quote:
        "From voice memos to publish-ready scripts—without friction. The fact that it’s free is wild.",
      avatar: "🎥",
    },
  ];

  const stats = [
    { label: "Avg. time to text", value: "< 30s" },
    { label: "Users report saving", value: "10+ hrs/week" },
    { label: "Satisfaction", value: "4.9/5" },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Loved by People Who Think Out Loud
          </h2>
          <p className="text-slate-600 text-lg">Real results from busy humans just like you.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {stats.map((s, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-slate-900">{s.value}</div>
              <div className="text-slate-600 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="glass-card rounded-2xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-3" aria-hidden>
                {t.avatar}
              </div>
              <p className="text-slate-700">“{t.quote}”</p>
              <div className="mt-4 text-sm text-slate-500">
                <span className="font-semibold text-slate-700">{t.name}</span> · {t.role}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
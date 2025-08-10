"use client";

export function UseCases() {
  const useCases = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
      title: "Content Creation",
      description: "Blog posts, articles, and social media content. Turn your ideas into publishable content in minutes."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Meeting Notes",
      description: "Capture and organize meeting discussions, action items, and key decisions automatically."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: "Daily Journaling",
      description: "Reflect and record personal thoughts, gratitude, and insights with natural voice journaling."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: "Email Drafting",
      description: "Compose professional emails, responses, and correspondence simply by speaking your thoughts."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      title: "Research Notes",
      description: "Organize interview recordings, research findings, and study notes into structured documents."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Creative Writing",
      description: "Overcome writer's block with voice brainstorming. Turn scattered ideas into compelling stories."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
            Perfect for{" "}
            <span className="text-orange-500">Every Use Case</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Whether you&apos;re creating content, taking notes, or brainstorming ideas, 
            Talkflo adapts to your workflow seamlessly.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <div 
              key={index}
              className="group cursor-pointer"
            >
              <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 hover:border-orange-200 hover:bg-orange-50/50 transition-all duration-300">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors shadow-sm">
                  <div className="text-orange-600 group-hover:text-orange-700">
                    {useCase.icon}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-orange-900">
                  {useCase.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed group-hover:text-slate-700">
                  {useCase.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA section */}
        <div className="mt-16 text-center">
          <p className="text-lg text-slate-600 mb-6">
            Ready to transform how you capture ideas?
          </p>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
            Start Your Free Trial
          </button>
        </div>
      </div>
    </section>
  );
}
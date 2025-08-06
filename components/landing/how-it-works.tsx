"use client";

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Hit Record",
      description: "Click the orange microphone button or use our browser extension. Recording starts instantly - no setup required.",
      icon: (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z"/>
          <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
          <path d="M12 18v4M8 22h8"/>
        </svg>
      ),
      visual: (
        <div className="bg-orange-500 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z"/>
                <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
                <path d="M12 18v4M8 22h8"/>
              </svg>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium opacity-80">Ready to record</div>
              <div className="text-xs opacity-60 mt-1">Tap to start</div>
            </div>
          </div>
          {/* Pulse animation */}
          <div className="absolute inset-0 bg-white/10 rounded-2xl animate-pulse" />
        </div>
      )
    },
    {
      number: "02", 
      title: "Speak Naturally",
      description: "Just talk! No need to speak slowly or enunciate. Our AI understands natural speech, accents, and context.",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      visual: (
        <div className="bg-blue-500 rounded-2xl p-6 text-white">
          <div className="text-center mb-4">
            <div className="text-lg font-bold">02:34</div>
            <div className="text-xs opacity-80">Recording...</div>
          </div>
          {/* Waveform animation */}
          <div className="flex justify-center items-center space-x-1 h-12">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="w-1 bg-white/60 rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 30 + 10}px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1.5s'
                }}
              />
            ))}
          </div>
        </div>
      )
    },
    {
      number: "03",
      title: "Get Perfect Text",
      description: "In seconds, receive clean, organized text ready to use. Copy, edit, or export to your favorite apps.",
      icon:(
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      visual: (
        <div className="bg-green-500 rounded-2xl p-6 text-white">
          <div className="space-y-2 text-sm">
            <div className="bg-white/20 rounded p-2">
              <div className="h-2 bg-white/60 rounded mb-1" />
              <div className="h-2 bg-white/40 rounded w-3/4" />
            </div>
            <div className="bg-white/20 rounded p-2">
              <div className="h-2 bg-white/60 rounded mb-1" />
              <div className="h-2 bg-white/40 rounded w-5/6" />
            </div>
            <div className="bg-white/20 rounded p-2">
              <div className="h-2 bg-white/60 rounded mb-1" />
              <div className="h-2 bg-white/40 rounded w-2/3" />
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="text-xs opacity-80">✨ Perfect text ready!</div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="py-20 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
            How It Works:{" "}
            <span className="text-orange-500">Simple as 1-2-3</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            From idea to perfect text in under 30 seconds. No learning curve, no complexity - 
            just the fastest way to capture your thoughts.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connection line (hidden on mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-6 w-12 h-0.5 bg-orange-200 z-0" />
              )}
              
              <div className="relative z-10 text-center">
                {/* Step number */}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 text-white rounded-full text-2xl font-bold mb-6 shadow-lg">
                  {step.number}
                </div>
                
                {/* Visual mockup */}
                <div className="mb-6 max-w-xs mx-auto">
                  {step.visual}
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <div className="text-orange-600 mb-2">
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Demo CTA */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              See It In Action
            </h3>
            <p className="text-slate-600 mb-6">
              Watch how Talkflo transforms a 2-minute voice recording into perfect, 
              ready-to-use text in real-time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200">
                <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Watch Demo
              </button>
              <button className="border-2 border-slate-300 text-slate-700 px-6 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors">
                Try It Free
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
"use client";

export function ProblemSolution() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6" dangerouslySetInnerHTML={{ __html: `Your Best Ideas Come When You're <span class=\"text-orange-500\">Away From Your Desk</span>` }} />
          <p className="text-xl text-slate-600 max-w-3xl mx-auto" dangerouslySetInnerHTML={{ __html: `Tired of staring at blank documents? Your creativity flows when you're walking, driving, or simply away from the keyboard. Don't let brilliant thoughts slip away.` }} />
        </div>

        {/* Before/After Comparison */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Before - The Problem */}
          <div className="relative">
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <svg aria-hidden="true" className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-red-800">Before Talkflo</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center text-red-700">
                  <svg aria-hidden="true" className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>Staring at blank documents for hours</span>
                </div>
                <div className="flex items-center text-red-700">
                  <svg aria-hidden="true" className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>Great ideas forgotten by the time you sit down</span>
                </div>
                <div className="flex items-center text-red-700">
                  <svg aria-hidden="true" className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>Scattered voice memos you never revisit</span>
                </div>
                <div className="flex items-center text-red-700">
                  <svg aria-hidden="true" className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span dangerouslySetInnerHTML={{ __html: `Writer\'s block killing productivity` }} />
                </div>
              </div>

              {/* Frustrated person illustration */}
              <div className="mt-8 p-6 bg-red-100 rounded-lg text-center" role="img" aria-label="A frustrated emoji representing unproductive writing.">
                <div className="text-6xl mb-2" aria-hidden="true">😤</div>
                <p className="text-red-600 font-medium">Frustrated & Unproductive</p>
              </div>
            </div>
          </div>

          {/* After - The Solution */}
          <div className="relative">
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <svg aria-hidden="true" className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-green-800">With Talkflo</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center text-green-700">
                  <svg aria-hidden="true" className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>Capture ideas instantly as you think them</span>
                </div>
                <div className="flex items-center text-green-700">
                  <svg aria-hidden="true" className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>Perfect text ready in seconds, not hours</span>
                </div>
                <div className="flex items-center text-green-700">
                  <svg aria-hidden="true" className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>Organized notes you actually use</span>
                </div>
                <div className="flex items-center text-green-700">
                  <svg aria-hidden="true" className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>10x faster content creation</span>
                </div>
              </div>

              {/* Happy person illustration */}
              <div className="mt-8 p-6 bg-green-100 rounded-lg text-center" role="img" aria-label="A rocket emoji representing creative productivity.">
                <div className="text-6xl mb-2" aria-hidden="true">🚀</div>
                <p className="text-green-600 font-medium">Productive & Creative</p>
              </div>
            </div>

            {/* Success badge */}
            <div className="absolute -top-4 -right-4 bg-orange-500 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-lg shadow-lg" role="img" aria-label="A sparkling success badge.">
              <span aria-hidden="true">✨</span>
            </div>
          </div>
        </div>

        {/* Transformation arrow (hidden on mobile) */}
        <div className="hidden lg:flex justify-center my-8">
          <div className="bg-orange-500 text-white rounded-full p-4">
            <svg aria-hidden="true" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
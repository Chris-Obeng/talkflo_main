"use client";

export function SocialProof() {
  const testimonials = [
    {
      name: "Sarah Chen",
      title: "Content Creator",
      company: "Tech Blog",
      image: "👩‍💻",
      rating: 5,
      text: "Talkflo changed my content creation process completely. I can now write blog posts while walking my dog! The transcription quality is incredible - it captures my tone perfectly."
    },
    {
      name: "Marcus Johnson", 
      title: "Sales Director",
      company: "StartupCorp",
      image: "👨‍💼",
      rating: 5,
      text: "I use Talkflo for all my meeting notes and follow-up emails. What used to take me hours now takes minutes. My team is amazed at how quickly I can send detailed summaries."
    },
    {
      name: "Dr. Emily Rodriguez",
      title: "Researcher",
      company: "University of Science",
      image: "👩‍🔬",
      rating: 5,
      text: "As a researcher, I record interviews and observations daily. Talkflo turns hours of audio into organized, searchable text. It's been a game-changer for my productivity."
    },
    {
      name: "James Liu",
      title: "Freelance Writer",
      company: "Independent",
      image: "✍️",
      rating: 5,
      text: "Writer's block used to kill my productivity. Now I just start talking and let Talkflo organize my thoughts. I've increased my output by 300% and clients love the quality."
    }
  ];

  const stats = [
    { number: "50,000+", label: "Hours Recorded" },
    { number: "1M+", label: "Words Transcribed" },
    { number: "99.5%", label: "Accuracy Rate" },
    { number: "10,000+", label: "Happy Users" }
  ];

  const companies = [
    "TechCorp", "InnovateNow", "CreativeStudio", "DataDriven", "NextGen", "FutureWorks"
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-orange-500 mb-2">
                {stat.number}
              </div>
              <div className="text-slate-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
            Loved by{" "}
            <span className="text-orange-500">Creators & Professionals</span>
          </h2>
          <div className="flex justify-center items-center mb-4">
            <div className="flex text-orange-400">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </div>
            <span className="ml-2 text-slate-600 font-medium">4.9/5 from 2,000+ users</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-stone-50 rounded-2xl p-6 border border-stone-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl mr-4">
                  {testimonial.image}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{testimonial.name}</div>
                  <div className="text-sm text-slate-600">{testimonial.title} at {testimonial.company}</div>
                </div>
              </div>
              
              <div className="flex mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-orange-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              
              <p className="text-slate-600 leading-relaxed">
                &quot;{testimonial.text}&quot;
              </p>
            </div>
          ))}
        </div>

        {/* Company logos */}
        <div className="text-center">
          <p className="text-slate-500 mb-8 font-medium">Trusted by teams at</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {companies.map((company, index) => (
              <div key={index} className="bg-slate-100 px-6 py-3 rounded-lg font-semibold text-slate-600">
                {company}
              </div>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-16 flex justify-center items-center gap-8 flex-wrap">
          <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
            <span className="text-green-700 font-medium text-sm">99.9% Uptime</span>
          </div>
          
          <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
            <span className="text-blue-700 font-medium text-sm">SOC 2 Compliant</span>
          </div>
          
          <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg border border-purple-200">
            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className="text-purple-700 font-medium text-sm">30-Day Guarantee</span>
          </div>
        </div>
      </div>
    </section>
  );
}
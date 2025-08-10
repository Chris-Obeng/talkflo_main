"use client";

import { useState } from "react";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How accurate is the transcription?",
      answer: "Talkflo achieves 99.5% accuracy using advanced AI models trained on diverse speech patterns, accents, and technical terminology. Our system continuously learns and improves with each transcription, handling background noise, multiple speakers, and various audio qualities with exceptional precision."
    },
    {
      question: "What languages are supported?",
      answer: "Currently, Talkflo supports English with plans to add Spanish, French, German, and other major languages throughout 2024. Our AI is specifically optimized for English speakers with various accents including American, British, Australian, and Canadian variants."
    },
    {
      question: "Is my voice data secure?",
      answer: "Absolutely. Your voice recordings are processed in real-time and immediately deleted from our servers. We never store your audio files or personal conversations. All data transmission is encrypted, and we're SOC 2 compliant with enterprise-grade security measures."
    },
    {
      question: "Can I edit the generated text?",
      answer: "Yes! Every transcription comes with a built-in editor where you can make adjustments, add formatting, and refine the output. You can also set custom vocabulary, preferred writing styles, and formatting preferences to match your needs perfectly."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee on all paid plans, no questions asked. If you're not completely satisfied with Talkflo, contact our support team within 30 days of your purchase for a full refund."
    },
    {
      question: "How does the free plan work?",
      answer: "The free plan includes 30 minutes of transcription per month with basic features and watermarked exports. It's perfect for trying out Talkflo and seeing how it fits your workflow. You can upgrade anytime to unlock unlimited recording and premium features."
    },
    {
      question: "Can I use Talkflo offline?",
      answer: "Currently, Talkflo requires an internet connection for real-time AI processing. However, you can record audio offline in our mobile app, and it will automatically sync and transcribe when you're back online."
    },
    {
      question: "What file formats do you support?",
      answer: "Talkflo accepts most common audio formats including MP3, WAV, M4A, and OGG. You can also record directly in our web app or mobile app. Output formats include plain text, Word documents, PDF, and various markdown formats."
    },
    {
      question: "Is there a mobile app?",
      answer: "Yes! Talkflo is available on iOS and Android with full feature parity. You can record on-the-go, and your transcriptions sync seamlessly across all your devices. The mobile app also includes offline recording capabilities."
    },
    {
      question: "Can I integrate Talkflo with other tools?",
      answer: "Premium and Enterprise plans include integrations with popular tools like Google Docs, Notion, Slack, and more. Our API (coming soon) will allow custom integrations with your existing workflow and applications."
    }
  ];

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
            Frequently Asked{" "}
            <span className="text-orange-500">Questions</span>
          </h2>
          <p className="text-xl text-slate-600">
            Everything you need to know about Talkflo. Can&apos;t find what you&apos;re looking for? 
            <a href="#" className="text-orange-500 hover:text-orange-600 underline ml-1">
              Contact our support team
            </a>.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden transition-all duration-200"
            >
              <button
                className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-inset"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-900 pr-4">
                    {faq.question}
                  </h3>
                  <div className={`flex-shrink-0 transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}>
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>
              
              <div className={`transition-all duration-200 ease-in-out ${
                openIndex === index 
                  ? 'max-h-96 opacity-100' 
                  : 'max-h-0 opacity-0'
              } overflow-hidden`}>
                <div className="px-6 pb-6">
                  <p className="text-slate-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions? */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-8 border border-orange-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Still Have Questions?
            </h3>
            <p className="text-slate-600 mb-6">
              Our friendly support team is here to help you get the most out of Talkflo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200">
                Contact Support
              </button>
              <button className="border-2 border-orange-300 text-orange-700 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
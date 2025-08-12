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
      answer: "Absolutely. Your voice recordings are processed in real-time and automatically deleted from our servers immediately after transcription is complete. We never permanently store your audio files or personal conversations. All data transmission is encrypted, and we're SOC 2 compliant with enterprise-grade security measures."
    },
    {
      question: "What happens to my audio files after processing?",
      answer: "Your audio files are automatically and permanently deleted from our servers within seconds of completing the transcription and AI processing. We only keep the processed text content that you can edit and organize. This ensures optimal privacy and helps us maintain efficient storage while keeping your costs low."
    },
    {
      question: "Can I edit the generated text?",
      answer: "Yes! Every transcription comes with a built-in editor where you can make adjustments, add formatting, and refine the output. You can also set custom vocabulary, preferred writing styles, and formatting preferences to match your needs perfectly."
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
      question: "Is Talkflo free to use?",
      answer: "Yes! Talkflo is completely free to use. You can transcribe unlimited audio files, organize your notes, and access all features without any cost or subscription fees."
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
            <a href="mailto:christopherobeng.dev@gmail.com" className="text-orange-500 hover:text-orange-600 underline ml-1">
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
                className="w-full text-left p-6 focus:outline-none"
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

      </div>
    </section>
  );
}
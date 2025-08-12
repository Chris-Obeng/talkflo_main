"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'annual' | 'biennial'>('biennial');

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      originalPrice: null,
      savings: null,
      badge: null,
      features: [
        "30 minutes recording per month",
        "Basic transcription accuracy",
        "Watermarked exports",
        "Web app access only",
        "Community support"
      ],
      cta: "Get Started Free",
      ctaVariant: "outline" as const,
      popular: false
    },
    {
      name: "Annual",
      price: billingCycle === 'annual' ? "$89" : "$89",
      period: billingCycle === 'annual' ? "per year" : "per year",
      monthlyEquivalent: "$7.42/month",
      originalPrice: "$178",
      savings: "Save 50%",
      badge: billingCycle === 'annual' ? "Most Popular" : null,
      features: [
        "Unlimited recording time",
        "99.5% transcription accuracy",
        "All premium features",
        "Cross-platform access",
        "Priority support",
        "Export to all formats",
        "Advanced AI processing"
      ],
      cta: "Start Annual Plan",
      ctaVariant: "default" as const,
      popular: billingCycle === 'annual'
    },
    {
      name: "2-Year Plan",
      price: "$150",
      period: "for 2 years",
      monthlyEquivalent: "$6.25/month",
      originalPrice: "$356",
      savings: "Save 65%",
      badge: "Best Deal",
      features: [
        "Everything in Annual",
        "Exclusive beta features",
        "Advanced analytics",
        "Team collaboration tools",
        "API access (coming soon)",
        "Custom integrations",
        "Premium phone support"
      ],
      cta: "Choose Best Deal",
      ctaVariant: "default" as const,
      popular: billingCycle === 'biennial'
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      originalPrice: null,
      savings: null,
      badge: null,
      features: [
        "White-label solution",
        "Single Sign-On (SSO)",
        "Dedicated account manager",
        "Custom integrations",
        "SLA guarantees",
        "Advanced security",
        "Training & onboarding"
      ],
      cta: "Contact Sales",
      ctaVariant: "outline" as const,
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
            Simple, Transparent{" "}
            <span className="text-orange-500">Pricing</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Start free, upgrade when you&apos;re ready. No hidden fees, no surprises. 
            Cancel anytime with our 30-day money-back guarantee.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center bg-white rounded-xl p-1 border border-stone-200 shadow-sm">
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                billingCycle === 'annual'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annual
            </button>
            <button
              onClick={() => setBillingCycle('biennial')}
              className={`px-6 py-2 rounded-lg font-medium transition-all relative ${
                billingCycle === 'biennial'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2-Year Plan
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                65% OFF
              </span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl border-2 transition-all duration-300 ${
                plan.popular
                  ? 'border-orange-500 shadow-xl scale-105'
                  : 'border-stone-200 shadow-sm hover:shadow-lg'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-semibold text-white ${
                  plan.badge === 'Best Deal' ? 'bg-green-500' : 'bg-orange-500'
                }`}>
                  {plan.badge}
                </div>
              )}

              <div className="p-8">
                {/* Plan name */}
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {plan.name}
                </h3>

                {/* Pricing */}
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-slate-900">
                      {plan.price}
                    </span>
                    <span className="ml-2 text-slate-600">
                      {plan.period}
                    </span>
                  </div>
                  
                  {plan.monthlyEquivalent && (
                    <div className="mt-1 text-sm text-slate-500">
                      {plan.monthlyEquivalent}
                    </div>
                  )}
                  
                  {plan.savings && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm text-slate-400 line-through">
                        {plan.originalPrice}
                      </span>
                      <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                        {plan.savings}
                      </span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      <span className="text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant={plan.ctaVariant}
                  className={`w-full py-3 font-semibold ${
                    plan.popular
                      ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg'
                      : plan.ctaVariant === 'outline'
                      ? 'border-2 border-slate-300'
                      : ''
                  }`}
                >
                  {plan.cta}
                </Button>

                {/* Risk-free trial */}
                {plan.name !== 'Free' && plan.name !== 'Enterprise' && (
                  <p className="text-center text-xs text-slate-500 mt-3">
                    30-day money-back guarantee
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Additional info */}
        <div className="mt-16 text-center">
          <p className="text-slate-600 mb-4">
            All plans include our core AI transcription technology with regular updates and improvements.
          </p>
          <p className="text-sm text-slate-500">
            Questions about pricing? <a href="#" className="text-orange-500 hover:text-orange-600 underline">Contact our sales team</a> for custom solutions.
          </p>
        </div>

        {/* Value proposition */}
        <div className="mt-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">
            Why Talkflo Users Save 10+ Hours Per Week
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-orange-100">
            <div>
              <div className="text-3xl font-bold text-white">5x</div>
              <div>Faster than typing</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">99.5%</div>
              <div>Accuracy rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">30s</div>
              <div>Average processing time</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
'use client';

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { pricingPlans, type BillingFrequency } from "../data/pricing";
import Logo from "../../components/Logo";

const billingToggles: { id: BillingFrequency; label: string }[] = [
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly (save 15%)" },
];

const supportHighlights = [
  {
    title: "Dedicated onboarding",
    description:
      "Get a guided setup session to map your chart of accounts, assumptions, and reporting templates.",
    icon: (
        <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    )
  },
  {
    title: "Scenario coaching",
    description:
      "Our specialists review your Base, Optimistic, and Downside models to ensure drivers and KPIs are dialed in.",
    icon: (
        <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    )
  },
  {
    title: "Priority support",
    description:
      "Chat with finance-focused product experts who understand the realities of SMB forecasting.",
    icon: (
        <svg className="w-6 h-6 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
    )
  },
];

const featureComparison = [
    {
        category: "Forecasting",
        features: [
            { name: "Forecast Horizon", launch: "3 Months", scale: "3 Years", advisory: "5 Years" },
            { name: "Scenario Planning", launch: "1 Scenario", scale: "Unlimited", advisory: "Unlimited" },
            { name: "Cash Flow Modeling", launch: false, scale: true, advisory: true },
            { name: "Headcount Planning", launch: false, scale: true, advisory: true },
        ]
    },
    {
        category: "Data & Integrations",
        features: [
            { name: "Accounting Sync (Xero/QBO)", launch: false, scale: true, advisory: true },
            { name: "CSV/Excel Import", launch: true, scale: true, advisory: true },
            { name: "Custom API Access", launch: false, scale: false, advisory: true },
            { name: "Multi-entity Rollups", launch: false, scale: false, advisory: true },
        ]
    },
    {
        category: "Reporting",
        features: [
            { name: "Dashboard Access", launch: "Read-only", scale: "Editor", advisory: "Admin" },
            { name: "Variance Analysis", launch: false, scale: true, advisory: true },
            { name: "Board Deck Export", launch: false, scale: true, advisory: true },
            { name: "White-labeling", launch: false, scale: false, advisory: true },
        ]
    }
];

export default function PricingPage() {
  const [billing, setBilling] = useState<BillingFrequency>("monthly");

  const planPricing = useMemo(() => {
    return pricingPlans.map((plan) => {
      const yearlyPrice =
        plan.monthlyPrice === 0
          ? 0
          : Math.round(plan.monthlyPrice * 12 * 0.85);
      const price =
        billing === "monthly" ? plan.monthlyPrice : yearlyPrice;
      const suffix =
        price === 0
          ? ""
          : billing === "monthly"
            ? "/month"
            : "/year";
      const formatted =
        price === 0 ? "$0" : `$${price.toLocaleString("en-US")}`;
      return { ...plan, priceLabel: formatted, suffix };
    });
  }, [billing]);

  return (
    <div className="min-h-screen text-slate-100 overflow-x-hidden">
      <div className="relative isolate">
        {/* Floating Header */}
        <div className="fixed top-6 inset-x-0 z-50 flex justify-center px-4">
            <header className="flex items-center justify-between gap-4 rounded-full border border-white/10 bg-black/50 px-5 py-2.5 shadow-xl shadow-black/20 backdrop-blur-md transition-all hover:bg-black/60 hover:border-white/15 w-full max-w-4xl">
            <Link href="/" className="flex items-center gap-2.5 group">
                <Logo size="md" className="shadow-cyan-500/20 transition-transform group-hover:rotate-3" />
                <span className="text-sm font-bold tracking-tight text-white group-hover:text-cyan-100 transition-colors">
                FyiCast
                </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
                <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
                <Link href="/#workflow" className="hover:text-white transition-colors">Workflow</Link>
                <Link href="/pricing" className="text-white font-bold transition-colors">Pricing</Link>
            </nav>

            <div className="flex items-center gap-3">
                <Link
                href="/auth/login"
                className="hidden text-sm font-medium text-slate-300 hover:text-white transition-colors sm:inline-block"
                >
                Sign in
                </Link>
                <Link
                href="/auth/register"
                className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-black transition-transform hover:scale-105 hover:bg-slate-100"
                >
                Get Started
                </Link>
            </div>
            </header>
        </div>

        <main className="pt-40 pb-24">
          <section className="relative px-6 lg:px-8 text-center mb-20">
            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-500/20 blur-[100px] rounded-full -z-10 pointer-events-none"></div>

            <div className="mx-auto max-w-4xl space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-cyan-300 backdrop-blur-md animate-fade-in">
                <span className="flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                Flexible plans for every stage of growth
              </div>
              
              <h1 className="text-5xl font-bold leading-tight tracking-tight text-white sm:text-7xl animate-slide-up">
                Pricing that scales with your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400">ambition</span>.
              </h1>
              
              <p className="mx-auto max-w-2xl text-lg text-slate-400 sm:text-xl leading-relaxed animate-slide-up" style={{animationDelay: '0.1s'}}>
                Start for free, upgrade as you grow. No hidden fees, no surprise contracts. Just pure forecasting power.
              </p>
              
              <div className="inline-flex items-center rounded-full bg-white/5 p-1 ring-1 ring-white/10 backdrop-blur-sm animate-slide-up" style={{animationDelay: '0.2s'}}>
                  {billingToggles.map((toggle) => (
                    <button
                      key={toggle.id}
                      type="button"
                      onClick={() => setBilling(toggle.id)}
                      className={`relative rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${
                        billing === toggle.id
                          ? "bg-white text-slate-950 shadow-lg"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {toggle.label}
                    </button>
                  ))}
                </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-6 lg:px-8 mb-24">
            <div className="grid gap-8 lg:grid-cols-3 items-start">
              {planPricing.map((plan, i) => (
                <div
                  key={plan.tier}
                  className={`group relative flex flex-col gap-6 rounded-3xl border p-8 transition-all duration-500 hover:-translate-y-2 ${
                    plan.highlight
                      ? "bg-slate-900/60 border-cyan-500/30 shadow-2xl shadow-cyan-900/20 ring-1 ring-cyan-400/20 scale-105 z-10"
                      : "bg-slate-900/20 border-white/10 backdrop-blur-md hover:bg-slate-900/40 hover:border-white/20"
                  }`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                   {plan.highlight && (
                       <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-1 text-xs font-bold text-white shadow-lg shadow-cyan-500/30">
                           MOST POPULAR
                       </div>
                   )}
                  
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{plan.tier}</h3>
                    <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-bold tracking-tight text-white">{plan.priceLabel}</span>
                        <span className="text-sm font-medium text-slate-400">{plan.suffix}</span>
                    </div>
                    <p className="mt-4 text-sm text-slate-400 leading-relaxed border-b border-white/10 pb-6">
                      {plan.description}
                    </p>
                  </div>
                  
                  <ul className="space-y-4 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-slate-300 group-hover:text-white transition-colors">
                         <div className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full ${plan.highlight ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/10 text-slate-400'}`}>
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                         </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    href={`/auth/register?plan=${plan.tier.toLowerCase()}&billing=${billing}`}
                    className={`mt-6 w-full rounded-xl py-3.5 px-4 text-sm font-bold text-center transition-all duration-300 ${
                      plan.highlight
                          ? "bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02]"
                          : "bg-white/5 text-white hover:bg-white/10 border border-white/10 hover:border-white/20"
                    }`}
                  >
                      {plan.priceLabel === "$0"
                        ? "Get Started Free"
                        : billing === "monthly"
                          ? "Start 14-day Trial"
                          : "Subscribe Yearly"}
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* Feature Comparison Table */}
          <section className="mx-auto max-w-7xl px-6 lg:px-8 mb-24">
             <div className="text-center mb-12">
                 <h2 className="text-3xl font-bold text-white mb-4">Compare Plans</h2>
                 <p className="text-slate-400">Detailed breakdown of features per tier.</p>
             </div>
             
             <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-sm">
                 <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left">
                         <thead>
                             <tr className="border-b border-white/10 bg-white/5">
                                 <th className="px-6 py-4 font-medium text-slate-400">Feature</th>
                                 <th className="px-6 py-4 font-bold text-white text-center w-1/5">Launch</th>
                                 <th className="px-6 py-4 font-bold text-cyan-400 text-center w-1/5 bg-cyan-500/5">Scale</th>
                                 <th className="px-6 py-4 font-bold text-violet-400 text-center w-1/5">Advisory</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-white/5">
                             {featureComparison.map((section, i) => (
                                 <React.Fragment key={section.category}>
                                    <tr className="bg-white/[0.02]">
                                        <td colSpan={4} className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">{section.category}</td>
                                    </tr>
                                    {section.features.map((feature) => (
                                        <tr key={feature.name} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-300">{feature.name}</td>
                                            <td className="px-6 py-4 text-center text-slate-400">
                                                {typeof feature.launch === 'boolean' ? (feature.launch ? '✓' : '—') : feature.launch}
                                            </td>
                                            <td className="px-6 py-4 text-center text-white bg-cyan-500/5 font-medium">
                                                {typeof feature.scale === 'boolean' ? (
                                                    feature.scale ? <span className="text-cyan-400">✓</span> : '—'
                                                ) : feature.scale}
                                            </td>
                                            <td className="px-6 py-4 text-center text-white">
                                                {typeof feature.advisory === 'boolean' ? (
                                                    feature.advisory ? <span className="text-violet-400">✓</span> : '—'
                                                ) : feature.advisory}
                                            </td>
                                        </tr>
                                    ))}
                                 </React.Fragment>
                             ))}
                         </tbody>
                     </table>
                 </div>
             </div>
          </section>

          <section className="mx-auto max-w-7xl px-6 lg:px-8 mb-24">
             <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/60 to-slate-900/30 p-8 lg:p-12 backdrop-blur-xl overflow-hidden relative">
                {/* Glow */}
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                
                <div className="relative z-10 grid gap-12 lg:grid-cols-[1fr_1.5fr]">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-white">Enterprise & Advisory</h2>
                        <p className="text-lg text-slate-400 leading-relaxed">
                            Need consolidated reporting, SSO, or white-glove onboarding? Our dedicated success team works with high-volume agencies and enterprises.
                        </p>
                        <Link
                            href="mailto:sales@fyicast.com"
                            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-slate-950 transition-all hover:bg-slate-200 hover:scale-105 shadow-lg"
                        >
                            Book Consultation <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {supportHighlights.map((item) => (
                            <div key={item.title} className="space-y-3 rounded-2xl border border-white/5 bg-white/5 p-5 transition hover:bg-white/10 hover:border-white/10">
                                <div className="p-2 rounded-lg bg-white/5 w-fit">{item.icon}</div>
                                <h4 className="font-bold text-white text-sm">{item.title}</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
             </div>
          </section>

          <section className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
             <h2 className="text-2xl font-bold text-white mb-12">Frequently Asked Questions</h2>
             <div className="grid gap-4 text-left">
                {[
                  {
                    question: "Can we switch plans or cancel if our needs change?",
                    answer: "Absolutely. Upgrade, downgrade, or cancel at any time. Annual contracts are available upon request with pro-rated refunds.",
                  },
                  {
                    question: "Do you support consolidated reporting across entities?",
                    answer: "Yes. Scale and Advisory plans include multi-entity modelling, eliminations, and portfolio roll-ups for your clients or subsidiaries.",
                  },
                  {
                    question: "What does implementation look like for Advisory teams?",
                    answer: "We offer a structured two-week onboarding to migrate assumptions, configure templates, and train your team on best-practice workflows.",
                  },
                ].map((item, i) => (
                  <div key={i} className="group rounded-2xl border border-white/10 bg-slate-900/20 p-6 transition-all hover:bg-slate-900/40 hover:border-white/20 hover:translate-x-1">
                    <h3 className="font-bold text-white group-hover:text-cyan-300 transition-colors text-lg">{item.question}</h3>
                    <p className="mt-2 text-sm text-slate-400 leading-relaxed">{item.answer}</p>
                  </div>
                ))}
             </div>
          </section>
        </main>

        <footer className="border-t border-white/10 bg-black/40 py-12">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                    <Logo size="sm" className="shadow-none" />
                    <span className="font-bold text-white">FyiCast</span>
                </div>
                <p className="text-sm text-slate-500">© {new Date().getFullYear()} FyiCast Inc. All rights reserved.</p>
                <div className="flex gap-6 text-sm text-slate-400">
                    <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy</Link>
                    <Link href="/legal/terms" className="hover:text-white transition-colors">Terms</Link>
                    <Link href="https://twitter.com/fyicast" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter</Link>
                </div>
            </div>
        </footer>
      </div>
    </div>
  );
}

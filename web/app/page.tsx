'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)
  const [showStickyCta, setShowStickyCta] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode')
    if (savedMode) {
      setDarkMode(savedMode === 'true')
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true)
    }
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', String(darkMode))
  }, [darkMode])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
      setShowStickyCta(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const faqs = [
    {
      question: "Will my customers know it's AI?",
      answer: "Most can't tell. Our AI uses natural voices and understands context like a real person. If asked directly, it's honest — but that rarely happens."
    },
    {
      question: "What if the AI can't handle a question?",
      answer: "It gracefully takes a message or transfers to you. You set the rules: \"If they mention 'emergency', transfer immediately.\" You're always in control."
    },
    {
      question: "Is it hard to set up?",
      answer: "5 minutes. Pick a template for your industry, add your business info, get a phone number. Done. No technical skills needed."
    },
    {
      question: "What if I don't like it?",
      answer: "Cancel anytime. No contracts, no cancellation fees. If you're not happy in the first 14 days, we'll refund you completely. No questions asked."
    }
  ]

  const testimonials = [
    {
      quote: "I was skeptical about AI talking to my customers. But honestly? It sounds better than my last receptionist.",
      name: 'Sarah M.',
      role: 'Sunrise Dental',
    },
    {
      quote: "Paid for itself the first week. Booked 6 jobs I would've missed while on other calls.",
      name: 'Carlos T.',
      role: 'Premier Plumbing',
    },
    {
      quote: "My drivers used to call at 2 AM. Now the AI handles it and only wakes me for emergencies.",
      name: 'James K.',
      role: 'Speedy Delivery',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950 overflow-x-hidden">
      {/* Animated gradient orbs for glass effect background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-500/30 dark:from-blue-500/20 dark:to-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/25 to-blue-500/25 dark:from-cyan-500/15 dark:to-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-to-br from-indigo-400/20 to-pink-500/20 dark:from-indigo-500/10 dark:to-pink-600/10 rounded-full blur-3xl" />
      </div>

      {/* Glass Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-white/20 dark:border-white/10 shadow-lg shadow-black/5'
          : 'bg-white/40 dark:bg-gray-900/40 backdrop-blur-md'
      }`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2">
              <span className="text-xl sm:text-2xl">📞</span>
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">CallFlex</span>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              {[
                { href: '#how-it-works', label: 'How It Works' },
                { href: '#pricing', label: 'Pricing' },
                { href: '#faq', label: 'FAQ' },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
                >
                  {item.label}
                </a>
              ))}
              <Link
                href="/login"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="bg-primary-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-primary-700 transition-all text-sm shadow-lg shadow-primary-500/25"
              >
                Start Free
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-3 -mr-2 rounded-xl active:bg-white/50 dark:active:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-white/20 dark:border-white/10">
              <div className="flex flex-col space-y-1">
                {[
                  { href: '#how-it-works', label: 'How It Works' },
                  { href: '#pricing', label: 'Pricing' },
                  { href: '#faq', label: 'FAQ' },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-700 dark:text-gray-300 py-3 px-3 text-base active:bg-white/50 dark:active:bg-white/10 rounded-xl"
                  >
                    {item.label}
                  </a>
                ))}
                <Link href="/login" className="text-gray-700 dark:text-gray-300 py-3 px-3 text-base">
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="bg-primary-600 text-white px-4 py-3 rounded-xl font-medium text-center text-base mt-2 shadow-lg shadow-primary-500/25"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ===== SECTION 1: HERO ===== */}
      <section className="relative pt-20 sm:pt-28 pb-12 sm:pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Glass badge */}
          <div className="inline-flex items-center bg-white/60 dark:bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/40 dark:border-white/20 shadow-lg shadow-black/5">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            <span className="text-gray-700 dark:text-gray-200">500+ businesses trust us</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6 text-gray-900 dark:text-white">
            Never Miss a<br className="sm:hidden" /> Call Again.
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-xl mx-auto leading-relaxed">
            Your AI receptionist answers every call, 24/7 — for{' '}
            <span className="font-semibold text-primary-600 whitespace-nowrap">$29/month</span>.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4 mb-4 sm:mb-6">
            <Link
              href="/signup"
              className="bg-primary-600 text-white px-6 py-4 rounded-2xl font-semibold text-base sm:text-lg hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/30 active:scale-[0.98] hover:-translate-y-0.5"
            >
              Start Free →
            </Link>
            <a
              href="#demo"
              className="bg-white/70 dark:bg-white/10 backdrop-blur-md text-gray-700 dark:text-gray-200 px-6 py-4 rounded-2xl font-semibold text-base sm:text-lg hover:bg-white/90 dark:hover:bg-white/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] border border-white/50 dark:border-white/20 shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              See Demo
            </a>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            No credit card · 5 min setup
          </p>
        </div>
      </section>

      {/* ===== SECTION 2: PROBLEM ===== */}
      <section className="relative py-12 sm:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8 sm:mb-10 text-gray-900 dark:text-white">
            Every missed call<br className="sm:hidden" /> costs you money.
          </h2>

          {/* Glass stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
            {[
              { stat: '62%', label: 'of calls go unanswered', icon: '📞' },
              { stat: '85%', label: 'won\'t call back', icon: '💸' },
              { stat: '100%', label: 'call your competitor', icon: '🏃' },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white/60 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-5 sm:p-6 text-center border border-white/50 dark:border-white/10 shadow-xl shadow-black/5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <span className="text-2xl sm:text-3xl mb-2 block">{item.icon}</span>
                <p className="text-3xl sm:text-4xl font-bold text-primary-600 mb-1">{item.stat}</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Glass testimonial card */}
          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-5 sm:p-6 border border-white/50 dark:border-white/10 shadow-xl">
            <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 italic mb-3">
              "I was losing 3-4 calls a day. At $500/job, that's $45K a year walking out the door."
            </p>
            <p className="text-gray-600 dark:text-gray-400 font-medium text-sm">
              — Mike R., HVAC Contractor
            </p>
          </div>
        </div>
      </section>

      {/* ===== SECTION 3: SOLUTION ===== */}
      <section className="relative py-12 sm:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-3 text-gray-900 dark:text-white">
            What if you had a<br className="sm:hidden" /> receptionist who...
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8 sm:mb-10">
            Meet your AI receptionist.
          </p>

          {/* Large glass card */}
          <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/60 dark:border-white/10 shadow-2xl shadow-black/10">
            <ul className="space-y-4">
              {[
                'Answers every call, 24/7/365',
                'Knows your business & pricing',
                'Books appointments to your calendar',
                'Transfers urgent calls to you',
                'Texts you a summary after each call',
                'Never calls in sick or quits',
                'Costs less than $1/day',
              ].map((benefit, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-base sm:text-lg text-gray-700 dark:text-gray-300">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===== SECTION 4: HOW IT WORKS ===== */}
      <section id="how-it-works" className="relative py-12 sm:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-3 text-gray-900 dark:text-white">
            Live in 5 minutes.
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8 sm:mb-10">
            No technical skills required.
          </p>

          <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6">
            {[
              { step: '1', icon: '📋', title: 'Pick a template', desc: 'Choose your industry or start fresh.' },
              { step: '2', icon: '⚙️', title: 'Add your info', desc: 'Business details, greetings, AI voice.' },
              { step: '3', icon: '📞', title: 'Go live', desc: 'Get a number and start taking calls.' },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white/60 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-5 sm:p-6 border border-white/50 dark:border-white/10 shadow-xl flex sm:flex-col items-start sm:items-center text-left sm:text-center gap-4 sm:gap-0 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white text-lg sm:text-xl font-bold flex-shrink-0 sm:mb-4 shadow-lg shadow-primary-500/30">
                  {item.step}
                </div>
                <div className="sm:space-y-2">
                  <span className="text-2xl hidden sm:block">{item.icon}</span>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 sm:mt-10 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/40 dark:border-white/10 text-center shadow-lg">
            <p className="text-gray-700 dark:text-gray-300 italic text-sm sm:text-base">
              "Set it up during my lunch break. Got my first AI-answered call 20 minutes later."
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/signup"
              className="inline-flex items-center bg-primary-600 text-white px-6 py-4 rounded-2xl font-semibold text-base hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/30 active:scale-[0.98] hover:-translate-y-0.5"
            >
              Try it free →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== SECTION 5: SOCIAL PROOF ===== */}
      <section className="relative py-12 sm:py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">
            Trusted by 500+ businesses
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Here's what they say.
          </p>

          {/* Horizontal scroll glass cards on mobile */}
          <div className="flex overflow-x-auto pb-4 -mx-4 px-4 gap-4 snap-x snap-mandatory sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[85vw] sm:w-auto snap-center bg-white/60 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-5 border border-white/50 dark:border-white/10 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex mb-3">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm sm:text-base leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{testimonial.name}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-4 sm:hidden">
            {testimonials.map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-gray-400/50" />
            ))}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-2 sm:gap-3">
            {['Dental', 'HVAC', 'Legal', 'Delivery', 'Restaurant'].map((industry) => (
              <span key={industry} className="px-3 py-1.5 bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-full text-xs sm:text-sm text-gray-600 dark:text-gray-400 border border-white/40 dark:border-white/10">
                {industry}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 6: FAQ ===== */}
      <section id="faq" className="relative py-12 sm:py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">
            Common questions
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Everything you need to know.
          </p>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white/60 dark:bg-white/5 backdrop-blur-lg rounded-2xl border border-white/50 dark:border-white/10 overflow-hidden shadow-lg"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-5 py-4 text-left flex justify-between items-center gap-4 active:bg-white/50 dark:active:bg-white/10 transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base pr-2">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={`grid transition-all duration-300 ${openFaq === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <div className="overflow-hidden">
                    <div className="px-5 pb-4 text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 7: PRICING ===== */}
      <section id="pricing" className="relative py-12 sm:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">
            Less than one missed call.
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">
            14-day free trial. No credit card.
          </p>

          {/* Glass cost comparison */}
          <div className="max-w-md mx-auto mb-8 sm:mb-10 bg-white/50 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-4 sm:p-5 border border-white/50 dark:border-white/10 shadow-xl">
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 text-center">Compare the cost:</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Full-time receptionist</span>
                <span className="text-gray-900 dark:text-white font-medium">$3,200/mo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Answering service</span>
                <span className="text-gray-900 dark:text-white font-medium">$300/mo</span>
              </div>
              <div className="border-t border-gray-200/50 dark:border-white/10 pt-2 flex justify-between">
                <span className="text-primary-600 font-semibold">Your AI receptionist</span>
                <span className="text-primary-600 font-bold">$29/mo ←</span>
              </div>
            </div>
          </div>

          {/* Glass pricing cards */}
          <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4 lg:gap-6">
            {/* Starter */}
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-lg rounded-3xl p-5 sm:p-6 border border-white/50 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">Starter</h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Try it out</p>
              </div>
              <div className="mb-4">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">$29</span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">/mo</span>
              </div>
              <Link
                href="/signup"
                className="block w-full text-center py-3 px-4 rounded-xl font-medium bg-white/70 dark:bg-white/10 text-gray-700 dark:text-gray-200 active:bg-white dark:active:bg-white/20 transition-colors mb-5 text-sm sm:text-base border border-white/50 dark:border-white/20"
              >
                Start free trial
              </Link>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                {['100 minutes/month', '1 phone number', '1 AI assistant', 'Call transcripts'].map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro - Featured with stronger glass effect */}
            <div className="relative bg-white/80 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-2xl ring-2 ring-primary-500/50 sm:scale-105 order-first sm:order-none border border-white/60 dark:border-primary-500/30">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-primary-500 to-primary-700 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg shadow-primary-500/30">
                  POPULAR
                </span>
              </div>
              <div className="mb-4 pt-1">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">Pro</h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Growing businesses</p>
              </div>
              <div className="mb-4">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">$79</span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">/mo</span>
              </div>
              <Link
                href="/signup"
                className="block w-full text-center py-3 px-4 rounded-xl font-medium bg-gradient-to-r from-primary-500 to-primary-700 text-white active:from-primary-600 active:to-primary-800 transition-all mb-5 shadow-lg shadow-primary-500/30 text-sm sm:text-base"
              >
                Start free trial
              </Link>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                {['500 minutes/month', '3 phone numbers', 'Unlimited assistants', 'Calendar sync', 'SMS alerts', 'Call recordings'].map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Business */}
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-lg rounded-3xl p-5 sm:p-6 border border-white/50 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">Business</h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Teams & enterprise</p>
              </div>
              <div className="mb-4">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">$199</span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">/mo</span>
              </div>
              <Link
                href="/signup"
                className="block w-full text-center py-3 px-4 rounded-xl font-medium bg-white/70 dark:bg-white/10 text-gray-700 dark:text-gray-200 active:bg-white dark:active:bg-white/20 transition-colors mb-5 text-sm sm:text-base border border-white/50 dark:border-white/20"
              >
                Contact us
              </Link>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                {['2,000 minutes/month', '10 phone numbers', 'API access', 'Custom integrations', 'Dedicated support'].map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-6">
            Need more? $0.08/min overage. Still 80% cheaper than human.
          </p>
        </div>
      </section>

      {/* ===== SECTION 8: FINAL CTA ===== */}
      <section className="relative py-12 sm:py-16 px-4">
        {/* Glass CTA card */}
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-primary-500/90 to-primary-700/90 backdrop-blur-xl rounded-3xl p-8 sm:p-12 text-center border border-white/20 shadow-2xl shadow-primary-500/20">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3">
            Ready to never miss<br className="sm:hidden" /> a call again?
          </h2>
          <p className="text-primary-100 text-base sm:text-lg mb-6">
            5 minutes to set up. No credit card.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-primary-600 px-6 sm:px-8 py-4 rounded-2xl font-semibold text-base sm:text-lg shadow-xl active:scale-[0.98] transition-all hover:-translate-y-0.5"
          >
            Start Free Trial →
          </Link>
          <p className="text-primary-200 text-xs sm:text-sm mt-5">
            Or call <span className="font-medium">(555) 123-4567</span> to try our AI
          </p>
        </div>
      </section>

      {/* Glass Footer */}
      <footer className="relative bg-gray-900/80 dark:bg-black/80 backdrop-blur-xl text-gray-400 py-10 sm:py-12 px-4 pb-24 sm:pb-12 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mb-8">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-xl">📞</span>
                <span className="text-lg font-bold text-white">CallFlex</span>
              </div>
              <p className="text-xs sm:text-sm">
                AI receptionist for every business.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Product</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a href="#how-it-works" className="hover:text-white transition py-1 block">How It Works</a></li>
                <li><a href="#pricing" className="hover:text-white transition py-1 block">Pricing</a></li>
                <li><a href="#faq" className="hover:text-white transition py-1 block">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Company</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><Link href="/about" className="hover:text-white transition py-1 block">About</Link></li>
                <li><Link href="/blog" className="hover:text-white transition py-1 block">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-white transition py-1 block">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><Link href="/privacy" className="hover:text-white transition py-1 block">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition py-1 block">Terms</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs">© 2025 CallFlex</p>

            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-white/10 active:bg-white/20 transition-colors backdrop-blur-sm"
            >
              {darkMode ? (
                <>
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-xs text-gray-300">Light</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                  </svg>
                  <span className="text-xs text-gray-300">Dark</span>
                </>
              )}
            </button>

            <div className="flex items-center space-x-4 text-xs">
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                SOC 2
              </span>
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                </svg>
                Encrypted
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Sticky Mobile CTA - Glass style */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-white/30 dark:border-white/10 p-3 z-40 sm:hidden transition-transform duration-300 ${
          showStickyCta ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <Link
          href="/signup"
          className="block w-full bg-gradient-to-r from-primary-500 to-primary-700 text-white py-3.5 rounded-2xl font-semibold text-center shadow-lg shadow-primary-500/30 active:scale-[0.98] transition-all"
        >
          Start Free Trial →
        </Link>
      </div>
    </div>
  )
}

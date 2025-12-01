'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('')
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

      const sections = ['how-it-works', 'pricing', 'faq']
      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section)
            break
          }
        }
      }
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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm'
          : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">📞</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">CallFlex</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              {[
                { href: '#how-it-works', label: 'How It Works' },
                { href: '#pricing', label: 'Pricing' },
                { href: '#faq', label: 'FAQ' },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`transition-colors duration-300 ${
                    activeSection === item.href.slice(1)
                      ? 'text-primary-600 dark:text-primary-400 font-medium'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </a>
              ))}
              <Link
                href="/login"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                Start Free
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="flex flex-col space-y-4">
                {[
                  { href: '#how-it-works', label: 'How It Works' },
                  { href: '#pricing', label: 'Pricing' },
                  { href: '#faq', label: 'FAQ' },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white py-2"
                  >
                    {item.label}
                  </a>
                ))}
                <Link href="/login" className="text-gray-600 dark:text-gray-300 py-2">Log In</Link>
                <Link href="/signup" className="bg-primary-600 text-white px-4 py-3 rounded-lg font-medium text-center">
                  Start Free
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ===== SECTION 1: HERO ===== */}
      <section className="pt-28 sm:pt-36 pb-16 sm:pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 text-gray-900 dark:text-white">
            Never Miss a Call Again.
          </h1>

          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Your AI receptionist answers every call, 24/7, exactly how you would — for <span className="font-semibold text-primary-600">$29/month</span>.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
            <Link
              href="/signup"
              className="bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 transition-all duration-300 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5"
            >
              Start Free →
            </Link>
            <a
              href="#demo"
              className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              See it in action
            </a>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            No credit card required · Set up in 5 minutes
          </p>
        </div>
      </section>

      {/* ===== SECTION 2: PROBLEM ===== */}
      <section className="py-16 sm:py-20 px-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Every missed call costs you money.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { stat: '62%', label: 'of calls to small businesses go unanswered', icon: '📞' },
              { stat: '85%', label: 'of callers won\'t call back', icon: '💸' },
              { stat: '100%', label: 'call your competitor instead', icon: '🏃' },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-sm border border-gray-200 dark:border-gray-700">
                <span className="text-3xl mb-3 block">{item.icon}</span>
                <p className="text-4xl font-bold text-primary-600 mb-2">{item.stat}</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
            <p className="text-lg text-gray-700 dark:text-gray-300 italic mb-4">
              "I was losing 3-4 calls a day. At $500 average job value, that's $45,000 a year walking out the door."
            </p>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              — Mike R., HVAC Contractor
            </p>
          </div>
        </div>
      </section>

      {/* ===== SECTION 3: SOLUTION ===== */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            What if you had a receptionist who...
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Meet your AI receptionist.
          </p>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 sm:p-10 border border-gray-200 dark:border-gray-700 shadow-sm">
            <ul className="space-y-5">
              {[
                'Answers every call in 2 rings, 24/7/365',
                'Knows your business, services, and pricing',
                'Books appointments directly into your calendar',
                'Transfers urgent calls to your cell',
                'Sends you a text summary after every call',
                'Never calls in sick, takes vacation, or quits',
                'Costs less than 1 hour of minimum wage per day',
              ].map((benefit, i) => (
                <li key={i} className="flex items-start gap-4">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-lg text-gray-700 dark:text-gray-300">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===== SECTION 4: HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-16 sm:py-20 px-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            Live in 5 minutes. Seriously.
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            No technical skills required. Get your AI receptionist answering calls today.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: '📋', title: 'Pick a template', desc: 'Choose from industry-specific templates or start from scratch.' },
              { step: '2', icon: '⚙️', title: 'Tell it your info', desc: 'Add your business details, customize greetings, choose your AI voice.' },
              { step: '3', icon: '📞', title: 'Get a number, go live', desc: 'Pick a local or toll-free number and start receiving calls.' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg shadow-primary-500/30">
                  {item.step}
                </div>
                <span className="text-3xl mb-3 block">{item.icon}</span>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-700 dark:text-gray-300 italic mb-2">
              "I set it up during my lunch break. Got my first AI-answered call 20 minutes later."
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">— Restaurant owner, Chicago</p>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/signup"
              className="inline-flex items-center bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 transition-all duration-300 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5"
            >
              Try it free →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== SECTION 5: SOCIAL PROOF ===== */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            Trusted by 500+ small businesses
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
            See what our customers have to say about their AI receptionist.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "I was skeptical about AI talking to my customers. But honestly? It sounds better than my last receptionist. And it doesn't take lunch breaks.",
                name: 'Sarah M.',
                role: 'Owner, Sunrise Dental',
              },
              {
                quote: "Paid for itself the first week. Booked 6 jobs I would've missed while I was on other calls.",
                name: 'Carlos T.',
                role: 'Owner, Premier Plumbing',
              },
              {
                quote: "My drivers used to call my cell at 2 AM. Now the AI handles it and only wakes me for real emergencies.",
                name: 'James K.',
                role: 'Owner, Speedy Delivery DSP',
              },
            ].map((testimonial, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6">&ldquo;{testimonial.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {['Dental', 'HVAC', 'Legal', 'Delivery', 'Restaurant', 'Healthcare'].map((industry) => (
              <span key={industry} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-600 dark:text-gray-400">
                {industry}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 6: FAQ / OBJECTION HANDLING ===== */}
      <section id="faq" className="py-16 sm:py-20 px-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            "But will it work for MY business?"
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
            We get it. Here are the questions everyone asks.
          </p>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-gray-600 dark:text-gray-400">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 7: PRICING ===== */}
      <section id="pricing" className="py-16 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            Less than one missed call costs you.
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Start free for 14 days. No credit card required. Cancel anytime.
          </p>

          {/* Cost Comparison */}
          <div className="max-w-2xl mx-auto mb-12 bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 text-center">The real cost of answering phones:</p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Full-time receptionist</span>
                <span className="text-gray-900 dark:text-white font-medium">$3,200/month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Part-time receptionist</span>
                <span className="text-gray-900 dark:text-white font-medium">$1,600/month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Answering service</span>
                <span className="text-gray-900 dark:text-white font-medium">$200-500/month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Your time (10 hrs/week @ $100/hr)</span>
                <span className="text-gray-900 dark:text-white font-medium">$4,000/month</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between">
                <span className="text-primary-600 font-semibold">Your AI receptionist</span>
                <span className="text-primary-600 font-bold">$29/month ←</span>
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-4 items-start">
            {/* Starter */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Starter</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Perfect for trying it out</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">$29</span>
                <span className="text-gray-500 dark:text-gray-400">/month</span>
              </div>
              <Link
                href="/signup"
                className="block w-full text-center py-3 px-4 rounded-lg font-medium border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mb-8"
              >
                Start free trial
              </Link>
              <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                {['100 minutes per month', '1 phone number', '1 AI assistant', 'Call transcripts', 'Email support'].map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <svg className="w-5 h-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 lg:scale-105 shadow-xl ring-2 ring-primary-600">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-primary-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg">
                  POPULAR
                </span>
              </div>
              <div className="mb-6 pt-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Pro</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Best for growing businesses</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">$79</span>
                <span className="text-gray-500 dark:text-gray-400">/month</span>
              </div>
              <Link
                href="/signup"
                className="block w-full text-center py-3 px-4 rounded-lg font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors mb-8 shadow-lg shadow-primary-600/30"
              >
                Start free trial
              </Link>
              <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                {['500 minutes per month', '3 phone numbers', 'Unlimited AI assistants', 'Calendar integrations', 'SMS notifications', 'Call recordings', 'Priority support'].map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <svg className="w-5 h-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Business */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Business</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">For teams and enterprises</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">$199</span>
                <span className="text-gray-500 dark:text-gray-400">/month</span>
              </div>
              <Link
                href="/signup"
                className="block w-full text-center py-3 px-4 rounded-lg font-medium border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mb-8"
              >
                Contact us
              </Link>
              <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                {['2,000 minutes per month', '10 phone numbers', 'Unlimited AI assistants', 'API access', 'Custom integrations', 'Dedicated support'].map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <svg className="w-5 h-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* All plans include */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">All plans include:</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              {['14-day free trial', 'No setup fees', 'Cancel anytime', 'Real-time dashboard'].map((item, i) => (
                <span key={i} className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 max-w-xl mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Need more minutes? Just $0.08/min overage. Still 80% cheaper than a human receptionist.
            </p>
          </div>
        </div>
      </section>

      {/* ===== SECTION 8: FINAL CTA ===== */}
      <section className="py-16 sm:py-20 px-4 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to never miss a call again?
          </h2>
          <p className="text-primary-100 text-lg sm:text-xl mb-8">
            Set up your AI receptionist in 5 minutes.<br />
            No credit card. No commitment. Just results.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Start Free Trial →
          </Link>
          <p className="text-primary-200 text-sm mt-6">
            Or call <span className="font-medium">(555) 123-4567</span> to talk to our AI<br />
            <span className="text-primary-300">(yes, it's our own product)</span>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-gray-400 py-12 sm:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">📞</span>
                <span className="text-xl font-bold text-white">CallFlex</span>
              </div>
              <p className="text-sm mb-4">
                AI-powered receptionist that answers every call professionally, 24/7.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
                <li><Link href="/blog" className="hover:text-white transition">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm">© 2025 CallFlex. All rights reserved.</p>

            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer"
            >
              {darkMode ? (
                <>
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-sm text-gray-300">Light Mode</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                  </svg>
                  <span className="text-sm text-gray-300">Dark Mode</span>
                </>
              )}
            </button>

            <div className="flex items-center space-x-4 sm:space-x-6 text-sm">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                SOC 2
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                </svg>
                Encrypted
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

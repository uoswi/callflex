'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Check for saved preference or system preference
    const savedMode = localStorage.getItem('darkMode')
    if (savedMode) {
      setDarkMode(savedMode === 'true')
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true)
    }
  }, [])

  useEffect(() => {
    // Apply dark mode class to html element
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

      const sections = ['industries', 'features', 'how-it-works', 'pricing']
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

  const toggleDarkMode = () => setDarkMode(!darkMode)

  return (
    <div className="min-h-screen animated-gradient mesh-gradient">
      {/* Navigation - Glassmorphism Style */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-white/20 dark:border-white/10 shadow-lg shadow-black/5'
          : 'bg-white/30 dark:bg-gray-900/30 backdrop-blur-md border-b border-white/10 dark:border-white/5'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">📞</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">CallFlex</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {[
                { href: '#industries', label: 'Industries' },
                { href: '#features', label: 'Features' },
                { href: '#how-it-works', label: 'How It Works' },
                { href: '#pricing', label: 'Pricing' },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`transition-colors duration-300 ${
                    activeSection === item.href.slice(1)
                      ? 'text-blue-600 dark:text-blue-400 font-medium'
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
                className="btn-press bg-primary-600 text-white px-4 py-2.5 rounded font-medium hover:bg-primary-700 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Mobile menu button */}
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

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex flex-col space-y-4">
                {[
                  { href: '#industries', label: 'Industries' },
                  { href: '#features', label: 'Features' },
                  { href: '#how-it-works', label: 'How It Works' },
                  { href: '#pricing', label: 'Pricing' },
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
                <Link href="/signup" className="btn-press bg-primary-600 text-white px-4 py-3 rounded font-medium text-center">
                  Start Free Trial
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="fade-in-up inline-flex items-center bg-primary-50/80 dark:bg-primary-900/30 backdrop-blur-sm text-primary-700 dark:text-primary-300 px-3 sm:px-4 py-2 rounded-full text-sm font-medium mb-6 border border-primary-100 dark:border-primary-800">
            <span className="w-2 h-2 bg-success-500 rounded-full mr-2 animate-pulse"></span>
            Works for Any Business, Any Industry
          </div>

          <h1 className="fade-in-up fade-in-up-delay-1 text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight mb-6 text-navy dark:text-white">
            Your AI Receptionist,<br/>
            <span className="gradient-text">Ready in 5 Minutes</span>
          </h1>

          <p className="fade-in-up fade-in-up-delay-2 text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto px-4">
            Answer every call professionally, 24/7. Choose from industry templates or build your own.
            No coding required.
          </p>

          <div className="fade-in-up fade-in-up-delay-3 flex flex-col sm:flex-row justify-center gap-4 mb-8 px-4">
            <Link
              href="/signup"
              className="shimmer btn-press bg-primary-600 text-white px-6 sm:px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 transition-all duration-300 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5"
            >
              Start Free Trial →
            </Link>
            <a
              href="#demo"
              className="btn-press bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-200 px-6 sm:px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:-translate-y-0.5"
            >
              Watch Demo
            </a>
          </div>

          <div className="fade-in-up fade-in-up-delay-4 flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-sm text-gray-500 dark:text-gray-400 px-4">
            {['Setup in 5 minutes', 'No contracts', '14-day free trial'].map((text, i) => (
              <span key={i} className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section id="industries" className="py-16 sm:py-20 px-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-4 text-navy dark:text-white">Built for Your Industry</h2>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
            Choose a pre-built template for your industry, or create a custom receptionist from scratch.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 stagger-children">
            {[
              { icon: '🚚', name: 'Logistics & Delivery', desc: 'Driver hotlines, customer status, recruiting', templates: 4 },
              { icon: '⚖️', name: 'Legal', desc: 'Client intake, consultation scheduling', templates: 3 },
              { icon: '🏥', name: 'Healthcare', desc: 'Appointment booking, prescription refills', templates: 4 },
              { icon: '🔧', name: 'Home Services', desc: 'Service booking, quote requests, dispatch', templates: 3 },
              { icon: '🍽️', name: 'Restaurant', desc: 'Reservations, takeout orders, hours & info', templates: 3 },
              { icon: '✨', name: 'Custom Builder', desc: 'Build your own from scratch', templates: null },
            ].map((industry, i) => (
              <div
                key={i}
                className={`card-hover block rounded-lg p-4 sm:p-6 border-2 cursor-pointer ${
                  industry.templates === null
                    ? 'bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/30 dark:to-purple-900/30 border-primary-200 dark:border-primary-700 pulse-glow'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-500'
                }`}
              >
                <span className="text-3xl sm:text-4xl mb-3 sm:mb-4 block">{industry.icon}</span>
                <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2 text-gray-900 dark:text-white">{industry.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3 hidden sm:block">{industry.desc}</p>
                <span className="text-primary-600 dark:text-primary-400 text-xs sm:text-sm font-medium">
                  {industry.templates ? `${industry.templates} templates →` : 'Start building →'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 px-4 bg-gradient-to-b from-white/80 to-slate-50/80 dark:from-gray-900/80 dark:to-gray-800/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-4 text-navy dark:text-white">Everything You Need to Never Miss a Call</h2>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-12 sm:mb-16 max-w-2xl mx-auto px-4">
            Powerful features that make your AI receptionist indistinguishable from a human assistant.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 stagger-children">
            {[
              { icon: '🕐', title: '24/7 Availability', desc: 'Never miss a call again. Your AI receptionist answers every call, day or night.' },
              { icon: '📝', title: 'Full Transcripts', desc: 'Every conversation is transcribed and searchable. Never lose important details.' },
              { icon: '🎙️', title: 'Natural Voice AI', desc: 'Human-like conversations powered by advanced AI. Callers can\'t tell the difference.' },
              { icon: '📅', title: 'Smart Scheduling', desc: 'Book appointments directly into your calendar. Handles conflicts automatically.' },
              { icon: '📞', title: 'Call Transfers', desc: 'Seamlessly transfer urgent calls to the right person based on your rules.' },
              { icon: '🚫', title: 'Spam Blocking', desc: 'AI-powered spam detection keeps robocalls from wasting your time.' },
              { icon: '🔔', title: 'Instant Notifications', desc: 'Get SMS and email alerts for important calls as they happen.' },
              { icon: '📊', title: 'Analytics Dashboard', desc: 'Track call volume, peak hours, and common questions to optimize.' },
              { icon: '🔗', title: 'Easy Integrations', desc: 'Connect with your CRM, calendar, and other tools via Zapier or API.' },
            ].map((feature, i) => (
              <div key={i} className="card-hover bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-lg flex items-center justify-center text-2xl mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-20 px-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-4 text-navy dark:text-white">Up and Running in Minutes</h2>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-12 sm:mb-16 max-w-2xl mx-auto px-4">
            No technical skills required. Get your AI receptionist answering calls today.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-8 stagger-children">
            {[
              { step: '1', title: 'Choose a Template', desc: 'Pick from industry-specific templates or start from scratch.' },
              { step: '2', title: 'Customize Your Assistant', desc: 'Add your business details, customize greetings, and choose your AI voice.' },
              { step: '3', title: 'Get Your Number & Go Live', desc: 'Pick a local or toll-free number and start receiving calls.' },
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                  {item.step}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 sm:mt-16 text-center">
            <Link
              href="/signup"
              className="shimmer btn-press inline-flex items-center bg-gradient-to-r from-primary-600 to-pro text-white px-6 sm:px-8 py-4 rounded-lg font-semibold text-lg hover:from-primary-700 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5"
            >
              Get Started Free
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-20 px-4 bg-gradient-to-b from-slate-50/80 to-white/80 dark:from-gray-800/80 dark:to-gray-900/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-4 text-navy dark:text-white">Trusted by Businesses Everywhere</h2>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-12 sm:mb-16 max-w-2xl mx-auto px-4">
            See what our customers have to say about their AI receptionist.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 stagger-children">
            {[
              { quote: "We were missing 40% of our calls after hours. Now every call gets answered professionally.", name: 'Sarah M.', role: 'Owner, Riverside Plumbing', industry: 'Home Services' },
              { quote: "The driver hotline template saved us so much time. Drivers get immediate answers without tying up dispatch.", name: 'Marcus J.', role: 'Operations Manager', industry: 'Logistics' },
              { quote: "Client intake calls used to take 15 minutes each. Now the AI handles screening and books consultations.", name: 'Jennifer L.', role: 'Attorney', industry: 'Legal' },
            ].map((testimonial, i) => (
              <div key={i} className="card-hover bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 text-sm sm:text-base">&ldquo;{testimonial.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{testimonial.role}</p>
                  <span className="inline-block mt-2 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">{testimonial.industry}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl float" style={{ animationDelay: '-3s' }}></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10 px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
            Ready to Never Miss Another Call?
          </h2>
          <p className="text-blue-100 text-lg sm:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using CallFlex to handle their calls professionally, 24/7.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/signup"
              className="shimmer btn-press bg-white text-primary-600 px-6 sm:px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Start Your Free Trial
            </Link>
            <a
              href="#pricing"
              className="btn-press border-2 border-white text-white px-6 sm:px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition-all duration-300 hover:-translate-y-0.5"
            >
              View Pricing
            </a>
          </div>
          <p className="text-blue-200 text-sm mt-6">14-day free trial. No credit card required.</p>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-20 px-4 bg-gradient-to-b from-slate-100 via-gray-50 to-white dark:from-gray-900 dark:via-gray-850 dark:to-gray-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-4 text-navy dark:text-white">Simple Pricing</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-8 sm:mb-12">All plans include transcripts, recordings, and spam blocking</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 stagger-children">
            {[
              { name: 'Starter', price: 29, minutes: 100, numbers: 1, popular: false },
              { name: 'Pro', price: 79, minutes: 500, numbers: 3, popular: true },
              { name: 'Business', price: 199, minutes: 2000, numbers: 10, popular: false },
            ].map((plan, i) => (
              <div
                key={i}
                className={`card-hover rounded-lg p-6 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-primary-600 to-pro text-white transform md:scale-105 shadow-xl shadow-primary-500/30 glow-blue'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className={`text-xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{plan.name}</h3>
                  {plan.popular && (
                    <span className="bg-white/20 text-xs px-2 py-1 rounded">Most Popular</span>
                  )}
                </div>
                <div className="mb-6">
                  <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900 dark:text-white'}`}>${plan.price}</span>
                  <span className={plan.popular ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}>/mo</span>
                </div>
                <ul className={`space-y-3 mb-8 text-sm ${plan.popular ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                  <li className="flex items-center">
                    <svg className={`w-5 h-5 mr-2 ${plan.popular ? 'text-green-300' : 'text-green-500'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    {plan.minutes} minutes included
                  </li>
                  <li className="flex items-center">
                    <svg className={`w-5 h-5 mr-2 ${plan.popular ? 'text-green-300' : 'text-green-500'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    {plan.numbers} phone number{plan.numbers > 1 ? 's' : ''}
                  </li>
                </ul>
                <Link
                  href="/signup"
                  className={`btn-press block w-full text-center py-3 rounded font-medium transition ${
                    plan.popular
                      ? 'bg-white text-primary-600 hover:bg-primary-50'
                      : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'
                  }`}
                >
                  Start Free Trial
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-gray-400 py-12 sm:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">📞</span>
                <span className="text-xl font-bold text-white">CallFlex</span>
              </div>
              <p className="text-sm mb-4">
                AI-powered receptionist that answers every call professionally, 24/7.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-white transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="hover:text-white transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#industries" className="hover:text-white transition">Industries</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
                <li><Link href="/blog" className="hover:text-white transition">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white transition">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help" className="hover:text-white transition">Help Center</Link></li>
                <li><Link href="/docs" className="hover:text-white transition">Documentation</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar with Dark Mode Toggle */}
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm">© 2025 CallFlex. All rights reserved.</p>

            {/* Dark Mode Toggle */}
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

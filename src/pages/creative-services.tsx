import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';

const CreativeServicesPage = () => {
  const [selectedTab, setSelectedTab] = useState('apps');

  return (
    <>
      <Head>
        <title>Creative Services - Transform Your Digital Presence | iShareHow Studios</title>
        <meta name="description" content="Custom applications, digital transformation consulting, and AI-powered content training. Get 30% efficiency gains with proven creative solutions from iShareHow Studios & Ventures." />
        <meta property="og:title" content="Creative Services - Transform Your Digital Presence" />
        <meta property="og:description" content="Join 100+ businesses achieving digital excellence. Custom apps, strategic consulting, and AI mastery in one platform." />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md shadow-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                iShareHow Studios
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#services" className="text-gray-700 hover:text-indigo-600 font-medium transition">Services</a>
              <a href="#results" className="text-gray-700 hover:text-indigo-600 font-medium transition">Results</a>
              <a href="#training" className="text-gray-700 hover:text-indigo-600 font-medium transition">AI Training</a>
              <Link href="/prospecting?tier=3" className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transition-all hover:scale-105">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="min-h-screen bg-white">
        {/* Hero Section - Above the Fold */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full text-indigo-700 font-semibold text-sm mb-6">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
                  Trusted by 100+ Organizations
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  Transform Your Digital Presence Into
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                    Revenue Growth
                  </span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Custom applications, strategic consulting, and AI-powered content training from an industry veteran with <strong className="text-gray-900">proven 30% efficiency gains</strong>.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Link href="/prospecting?tier=3" className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 text-center">
                    Start Your Transformation
                    <span className="block text-sm font-normal opacity-90">Free consultation included</span>
                  </Link>
                  <a href="#results" className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-full font-bold text-lg hover:border-indigo-600 hover:text-indigo-600 transition-all text-center">
                    See Success Stories
                  </a>
                </div>
                <div className="flex items-center gap-8 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    No contracts
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Cancel anytime
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    7-day trial
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                      JL
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Jamel Lewis</h3>
                      <p className="text-gray-600 text-sm">Director, iShareHow Labs</p>
                    </div>
                  </div>
                  <blockquote className="text-gray-700 text-lg leading-relaxed mb-6 italic">
                    "Years of hands-on experience distilled into systems that deliver overwhelming value. This isn't just another service—it's your competitive advantage."
                  </blockquote>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full font-medium">10+ Years Experience</span>
                    <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full font-medium">100+ Projects</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Social Proof Stats */}
        <section className="py-12 bg-gray-50 border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { number: '100+', label: 'Organizations Served' },
                { number: '30%', label: 'Average Efficiency Gain' },
                { number: '25%', label: 'Time Saved on Average' },
                { number: '98%', label: 'Client Satisfaction' }
              ].map((stat, idx) => (
                <div key={idx}>
                  <div className="text-4xl font-bold text-indigo-600 mb-2">{stat.number}</div>
                  <div className="text-gray-600 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Three Core Services, One Platform
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to dominate your digital landscape
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: '📱',
                  title: 'Custom Applications',
                  description: 'Mobile and web apps tailored to your exact business needs',
                  features: ['iOS & Android', 'Web Dashboards', 'API Integration', 'Real-time Data'],
                  color: 'indigo'
                },
                {
                  icon: '💼',
                  title: 'Strategic Consulting',
                  description: 'Expert guidance for digital transformation and growth',
                  features: ['Process Optimization', 'Tech Stack Planning', 'Team Training', 'ROI Analysis'],
                  color: 'purple'
                },
                {
                  icon: '🎓',
                  title: 'AI Training Programs',
                  description: 'Master AI-powered content creation and affiliate marketing',
                  features: ['Content Strategy', 'AI Tools Mastery', 'Monetization', 'Brand Building'],
                  color: 'pink'
                }
              ].map((service, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all group"
                >
                  <div className="text-5xl mb-4">{service.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-6">{service.description}</p>
                  <ul className="space-y-3">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-700">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section id="results" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Real Results, Real Businesses
              </h2>
              <p className="text-xl text-gray-600">
                Success stories from organizations like yours
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  industry: 'Retail',
                  result: '30% Reduction',
                  metric: 'Stock Discrepancies',
                  description: 'Our custom inventory management app eliminated manual errors and improved sales accuracy.',
                  icon: '🏪',
                  color: 'bg-blue-50 border-blue-200'
                },
                {
                  industry: 'Logistics',
                  result: '25% Faster',
                  metric: 'Delivery Times',
                  description: 'Strategic consulting streamlined supply chain operations and reduced operational costs.',
                  icon: '🚚',
                  color: 'bg-green-50 border-green-200'
                },
                {
                  industry: 'Healthcare',
                  result: '40% Better',
                  metric: 'Patient Satisfaction',
                  description: 'Digital training programs enhanced staff capabilities and service quality.',
                  icon: '🏥',
                  color: 'bg-purple-50 border-purple-200'
                }
              ].map((result, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`${result.color} rounded-2xl p-8 border-2`}
                >
                  <div className="text-4xl mb-4">{result.icon}</div>
                  <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">{result.industry}</div>
                  <div className="text-4xl font-bold text-gray-900 mb-1">{result.result}</div>
                  <div className="text-lg font-medium text-gray-700 mb-4">{result.metric}</div>
                  <p className="text-gray-600">{result.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Training CTA Section */}
        <section id="training" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white font-semibold text-sm mb-6">
                🎤 Featured Program
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Master AI Content Creation & Build Your Empire
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
                Join our exclusive Affiliate AI Content Training Program and learn to scale your voice, build influence, and monetize your expertise with cutting-edge AI tools.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-12 text-left">
                {[
                  {
                    title: 'Content Mastery',
                    items: ['AI-Powered Writing', 'Brand Voice Development', 'Multi-Platform Strategy']
                  },
                  {
                    title: 'Monetization',
                    items: ['Affiliate Marketing', 'Revenue Streams', 'Conversion Optimization']
                  },
                  {
                    title: 'Authority Building',
                    items: ['Thought Leadership', 'Audience Growth', 'Community Building']
                  }
                ].map((col, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <h3 className="font-bold text-xl mb-4">{col.title}</h3>
                    <ul className="space-y-2">
                      {col.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <Link href="/prospecting?tier=3" className="inline-block px-12 py-5 bg-white text-indigo-600 rounded-full font-bold text-xl hover:shadow-2xl transition-all hover:scale-105">
                Join AI Training Program →
                <div className="text-sm font-normal mt-1">Start with Tier 3 Membership</div>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join iShareHow Studios & Ventures and unlock your business's full potential with proven strategies and cutting-edge technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/prospecting?tier=3" className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-bold text-lg hover:shadow-2xl transition-all hover:scale-105">
                Get Started Today
              </Link>
              <a href="mailto:contact@isharehowlabs.com" className="px-10 py-4 border-2 border-gray-300 text-gray-700 rounded-full font-bold text-lg hover:border-indigo-600 hover:text-indigo-600 transition-all">
                Contact Sales
              </a>
            </div>
            <p className="text-sm text-gray-500">
              No credit card required • 7-day free trial • Cancel anytime
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="font-bold text-lg mb-4">iShareHow Studios</h3>
                <p className="text-gray-400 text-sm">Empowering businesses through innovative solutions and strategic development.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Services</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#services" className="hover:text-white transition">Custom Apps</a></li>
                  <li><a href="#services" className="hover:text-white transition">Consulting</a></li>
                  <li><a href="#training" className="hover:text-white transition">AI Training</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="http://isharehowlabs.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Core Operations</a></li>
                  <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
                  <li><a href="mailto:contact@isharehowlabs.com" className="hover:text-white transition">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
              <p>© 2024 iShareHow Studios & Ventures. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default CreativeServicesPage;

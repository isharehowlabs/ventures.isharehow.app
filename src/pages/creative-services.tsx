import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const CreativeServicesPage = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pricingTiers = [
    {
      id: 'starter',
      name: 'Starter',
      monthly: 399,
      quarterly: 1077, // ~10% discount
      yearly: 3830, // ~20% discount
      description: 'Perfect for small businesses, startups, and individual creators',
      popular: false,
      features: [
        { text: '10-20 requests per month', tooltip: 'Submit up to 20 creative requests per month. Each request is queued and executed based on your plan resources.' },
        { text: 'Standard turnaround (48-72 hours)', tooltip: 'Most projects are completed within 48-72 hours. Complex projects may take longer and will be communicated upfront.' },
        { text: 'Email support', tooltip: 'Get help via email during business hours. Response time is typically within 24 hours.' },
        { text: 'Basic design services', tooltip: 'Access to core design services including logos, graphics, social media assets, and basic web design.' },
        { text: 'Access to Co-Work Dashboard', tooltip: 'Collaborate with your team using our Co-Work dashboard for project management and file sharing.' },
        { text: 'Access to Rise Dashboard', tooltip: 'Track your progress and access learning resources through the Rise dashboard.' },
        { text: 'Basic CaaS features', tooltip: 'Essential Creative-as-a-Service features including project submission, revision requests, and asset delivery.' },
      ],
    },
    {
      id: 'professional',
      name: 'Professional',
      monthly: 1499,
      quarterly: 4047, // ~10% discount
      yearly: 14390, // ~20% discount
      description: 'Ideal for growing businesses, agencies, and projects',
      popular: true,
      features: [
        { text: 'Unlimited requests', tooltip: 'Submit unlimited project requests. Each request is queued and executed based on available resources in your plan.' },
        { text: 'Priority turnaround (24-48 hours)', tooltip: 'Projects are prioritized and typically completed within 24-48 hours. Complex projects may require additional time.' },
        { text: 'Dedicated project manager', tooltip: 'Work with a dedicated project manager who coordinates your projects and ensures smooth communication.' },
        { text: 'Advanced design services', tooltip: 'Full access to all design services including advanced web design, motion graphics, video production, and more.' },
        { text: 'Full CaaS access', tooltip: 'Complete access to all Creative-as-a-Service features including AI-powered tools, brand management, and advanced workflows.' },
        { text: 'API integrations', tooltip: 'Integrate our services with your existing tools and workflows through our API.' },
        { text: 'Analytics dashboard', tooltip: 'Track project performance, team productivity, and ROI through comprehensive analytics.' },
        { text: 'Priority support', tooltip: 'Get priority support with faster response times and dedicated support channels.' },
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      monthly: 9000,
      quarterly: 24300, // ~10% discount
      yearly: 86400, // ~20% discount
      description: 'For large enterprises and agencies with high volume needs',
      popular: false,
      features: [
        { text: 'Unlimited requests and revisions', tooltip: 'Submit unlimited projects and request unlimited revisions. No restrictions on scope or complexity.' },
        { text: 'Same-day turnaround', tooltip: 'Priority processing ensures most projects are completed the same day. Urgent requests are handled immediately.' },
        { text: 'Dedicated team', tooltip: 'A dedicated team of creatives and project managers assigned exclusively to your account.' },
        { text: 'Custom integrations', tooltip: 'Custom API integrations and workflows tailored to your specific business needs.' },
        { text: 'White-label options', tooltip: 'White-label our services under your brand for client-facing projects.' },
        { text: 'Advanced security features', tooltip: 'Enterprise-grade security including SSO, advanced access controls, and compliance certifications.' },
        { text: 'SLA guarantees', tooltip: 'Service Level Agreements with guaranteed uptime, response times, and performance metrics.' },
        { text: 'Custom contract terms', tooltip: 'Flexible contract terms tailored to your business requirements and payment preferences.' },
        { text: 'Platform/service fee included', tooltip: 'All platform and service fees are included in your plan. No hidden costs.' },
      ],
    },
  ];

  const getPrice = (tier: typeof pricingTiers[0]) => {
    switch (billingCycle) {
      case 'quarterly':
        return tier.quarterly;
      case 'yearly':
        return tier.yearly;
      default:
        return tier.monthly;
    }
  };

  const getSavings = (tier: typeof pricingTiers[0]) => {
    if (billingCycle === 'quarterly') {
      return Math.round((tier.monthly * 3 - tier.quarterly) / (tier.monthly * 3) * 100);
    }
    if (billingCycle === 'yearly') {
      return Math.round((tier.monthly * 12 - tier.yearly) / (tier.monthly * 12) * 100);
    }
    return 0;
  };

  const faqs = [
    {
      question: 'How does the billing cycle work?',
      answer: 'You can choose to be billed monthly, quarterly, or yearly. Quarterly and yearly plans offer significant savings. You can change your billing cycle at any time, with changes taking effect on your next billing date.',
    },
    {
      question: 'What happens to unused requests or hours?',
      answer: 'Unused requests in the Starter plan do not roll over to the next month. However, Professional and Enterprise plans include unlimited requests, so this is not a concern. You can pause your account for up to 2 weeks per quarter if needed.',
    },
    {
      question: 'Do I really get unlimited project requests and revisions?',
      answer: 'Yes! Professional and Enterprise plans include unlimited project requests and revisions. Starter plan includes 10-20 requests per month. All plans include unlimited revisions for active projects.',
    },
    {
      question: 'Who owns the copyrights to the created work?',
      answer: 'You own all copyrights! Every project we create is exclusively yours, including all source files. You maintain full copyright ownership with continuous access to files via your dashboard. Note: This applies if you continue with us after your trial period.',
    },
    {
      question: 'How does the trial period work?',
      answer: 'Start your trial with no upfront payment and experience our creative team, quality, and workflow while getting real work done. If you choose to continue, your first payment will be due at the end of the trial. If you cancel within the trial period, you won\'t be charged, but you will lose copyright to any work created during the trial.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept ACH transfers, wire transfers, credit cards, and cryptocurrency. Payment terms are flexible with options for Net 30, 45, or 60 days (with applicable price adjustments).',
    },
    {
      question: 'Can I change plans later?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle. Upgrades take effect immediately, while downgrades take effect at the end of your current billing period.',
    },
    {
      question: 'What if I need more resources than my plan provides?',
      answer: 'You can add additional resources through our add-on system. Add-ons include extra creatives, specialized expertise, additional brands, and more. Add-ons can be purchased weekly, monthly, or as one-time charges depending on the service.',
    },
  ];

  return (
    <>
      <Head>
        <title>Pricing - Affordable Creative Services On Demand | iShareHow Studios</title>
        <meta name="description" content="Transparent, flexible, and cost-efficient creative services pricing. No retainers, long-term commitments, or hidden fees. Start your trial today." />
        <meta name="keywords" content="creative services pricing, CaaS pricing, design services cost, creative agency pricing, iShareHow Studios" />
        <meta property="og:title" content="Pricing - Affordable Creative Services On Demand" />
        <meta property="og:description" content="Transparent, flexible, and cost-efficient creative services. Cancel anytime, no hidden fees." />
      </Head>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        
        .tooltip-container {
          position: relative;
          display: inline-block;
        }
        
        .tooltip-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #9333ea;
          color: white;
          font-size: 12px;
          font-weight: bold;
          cursor: help;
          margin-left: 6px;
          transition: all 0.2s;
        }
        
        .tooltip-icon:hover {
          background: #7e22ce;
          transform: scale(1.1);
        }
        
        .tooltip-content {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 8px;
          padding: 12px 16px;
          background: #1f2937;
          color: white;
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.5;
          width: 280px;
          z-index: 1000;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s;
        }
        
        .tooltip-content::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 6px solid transparent;
          border-top-color: #1f2937;
        }
        
        .tooltip-container:hover .tooltip-content {
          opacity: 1;
          pointer-events: auto;
        }
        
        .pricing-card {
          transition: all 0.3s ease;
        }
        
        .pricing-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .billing-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin: 32px 0;
        }
        
        .billing-option {
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: 2px solid transparent;
        }
        
        .billing-option.active {
          background: #9333ea;
          color: white;
        }
        
        .billing-option:not(.active) {
          background: #f3f4f6;
          color: #6b7280;
        }
        
        .billing-option:not(.active):hover {
          background: #e5e7eb;
        }
        
        .savings-badge {
          display: inline-block;
          padding: 4px 12px;
          background: #10b981;
          color: white;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          margin-left: 8px;
        }
      `}</style>

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <header className="fixed top-0 left-0 right-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50 border-b border-gray-100">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                iShareHow Studios
              </Link>
              <Link 
                href="/prospecting?tier=professional" 
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
          <div className="max-w-5xl mx-auto text-center fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              AFFORDABLE CREATIVE SERVICES, <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">ON DEMAND</span>
            </h1>
            <h2 className="text-2xl md:text-3xl text-gray-700 mb-4">
              Transparent, <strong>Flexible</strong>, & Cost-Efficient
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              No retainers, long-term commitments, hidden fees, or unpredictable pricing. Every project starts with a clear timeline, so you know exactly what your team is working on each day to evaluate the ROI.
            </p>
            <Link 
              href="/demo" 
              className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition transform hover:scale-105"
            >
              Book Your Demo
            </Link>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-y border-gray-200">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  70%
                </div>
                <div className="text-gray-600 font-semibold text-lg">
                  cost savings compared to in-house teams & agencies
                </div>
              </div>
              <div>
                <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  50%
                </div>
                <div className="text-gray-600 font-semibold text-lg">
                  faster project delivery with an adaptable creative team
                </div>
              </div>
              <div>
                <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  60%
                </div>
                <div className="text-gray-600 font-semibold text-lg">
                  fewer revisions with AI-enhanced creative workflows
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                On-Demand solution to fuel your growth – <span className="text-purple-600">Cancel anytime!</span>
              </h2>
              <p className="text-xl text-gray-600">
                All your design and marketing needs, seamlessly covered
              </p>
            </div>

            {/* Billing Toggle */}
            <div className="billing-toggle">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`billing-option ${billingCycle === 'monthly' ? 'active' : ''}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('quarterly')}
                className={`billing-option ${billingCycle === 'quarterly' ? 'active' : ''}`}
              >
                Quarterly
                {billingCycle !== 'quarterly' && <span className="savings-badge">Save $1,500/Qtr</span>}
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`billing-option ${billingCycle === 'yearly' ? 'active' : ''}`}
              >
                Yearly
                {billingCycle !== 'yearly' && <span className="savings-badge">Save $10,800/Yr</span>}
              </button>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {pricingTiers.map((tier) => {
                const price = getPrice(tier);
                const savings = getSavings(tier);
                const monthlyEquivalent = billingCycle === 'quarterly' ? Math.round(price / 3) : billingCycle === 'yearly' ? Math.round(price / 12) : price;
                
                return (
                  <div
                    key={tier.id}
                    className={`pricing-card bg-white rounded-2xl p-8 border-2 ${
                      tier.popular ? 'border-purple-600 shadow-xl' : 'border-gray-200'
                    } relative`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-purple-600 text-white rounded-full text-sm font-bold">
                        Most Popular
                      </div>
                    )}
                    
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                      <p className="text-gray-600 text-sm mb-4">{tier.description}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-gray-900">${monthlyEquivalent}</span>
                        <span className="text-gray-600">/mo</span>
                        {savings > 0 && (
                          <span className="savings-badge">Save {savings}%</span>
                        )}
                      </div>
                      {billingCycle !== 'monthly' && (
                        <p className="text-sm text-gray-500 mt-2">
                          Billed {billingCycle === 'quarterly' ? 'quarterly' : 'annually'} (${price.toLocaleString()}/{billingCycle === 'quarterly' ? 'quarter' : 'year'})
                        </p>
                      )}
                    </div>

                    <ul className="space-y-4 mb-8">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-500 text-xl mt-0.5">✓</span>
                          <div className="flex-1">
                            <div className="tooltip-container">
                              <span className="text-gray-700">{feature.text}</span>
                              <span className="tooltip-icon">?</span>
                              <div className="tooltip-content">
                                {feature.tooltip}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={`/prospecting?tier=${tier.id}`}
                      className={`block w-full text-center py-4 rounded-xl font-bold text-lg transition ${
                        tier.popular
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {tier.id === 'enterprise' ? 'Contact Sales' : 'Get Started'}
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Additional Info */}
            <div className="bg-gray-50 rounded-2xl p-8 mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                100+ Design & Marketing Services Covered
              </h3>
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Social Media & Digital Advertising</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Asset Design (Static or Dynamic)</li>
                    <li>• Organic Social Media Marketing</li>
                    <li>• Paid Social Media Advertising</li>
                    <li>• Google Display & Keyword Advertising</li>
                    <li>• YouTube Advertising</li>
                    <li>• A/B Testing & Analytics</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Marketing Strategy & Audit</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Competitive Audit & Strategy</li>
                    <li>• Brand Audit & Strategy</li>
                    <li>• Website Audit & Strategy</li>
                    <li>• Content Audit & Strategy</li>
                    <li>• Paid & Social Media Audit</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Email Marketing & Campaigns</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Email Design (Static or Animated)</li>
                    <li>• Email Templates & Newsletters</li>
                    <li>• Email Automation & Campaigns</li>
                    <li>• Email Subject Line Strategy</li>
                    <li>• Email Custom Coding & CRM</li>
                    <li>• A/B Testing & Analytics</li>
                  </ul>
                </div>
              </div>
              <div className="text-center mt-6">
                <button className="text-purple-600 font-semibold hover:text-purple-700">
                  View All Services →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setOpenFaqs(prev => ({ ...prev, [idx]: !prev[idx] }))}
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition"
                  >
                    <span className="font-semibold text-gray-900">{faq.question}</span>
                    <span className="text-2xl text-gray-400">{openFaqs[idx] ? '−' : '+'}</span>
                  </button>
                  {openFaqs[idx] && (
                    <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Creative Workflow?
            </h2>
            <p className="text-xl mb-8 opacity-95">
              Start your trial today with no upfront payment. Experience our creative team, quality, and workflow risk-free.
            </p>
            <Link
              href="/prospecting?tier=professional"
              className="inline-block px-10 py-5 bg-white text-purple-600 rounded-xl font-bold text-xl hover:shadow-2xl transition transform hover:scale-105"
            >
              Start Your 2-Week Trial
            </Link>
          </div>
        </section>

        {/* Scroll to Top */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-2xl hover:scale-110 transition transform z-50 flex items-center justify-center text-2xl"
            aria-label="Scroll to top"
          >
            ↑
          </button>
        )}

        {/* Footer */}
        <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-gray-400 mb-4">
              © 2024 iShareHow Studios & Ventures. All rights reserved.
            </p>
            <p className="text-gray-500">
              Core operations: <a href="http://isharehowlabs.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">isharehowlabs.com</a>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default CreativeServicesPage;

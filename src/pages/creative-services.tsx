import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const CreativeServicesPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const testimonials = [
    {
      quote: "The AI Content Training Program transformed how we create content. We've seen a 40% increase in engagement and our team is more productive than ever.",
      author: "Sarah Martinez",
      role: "Content Director, TechStart Inc.",
      metric: "40% increase in engagement"
    },
    {
      quote: "Working with iShareHow Studios has been a game-changer. Their customized applications helped us reduce operational costs by 30% in just 3 months.",
      author: "Michael Chen",
      role: "CEO, Retail Solutions",
      metric: "30% cost reduction"
    },
    {
      quote: "The consulting services provided strategic insights that we couldn't have achieved on our own. Our delivery times improved by 25%.",
      author: "Emily Rodriguez",
      role: "Operations Manager, Logistics Pro",
      metric: "25% faster delivery"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <>
      <Head>
        <title>Creative Services - Transform Your Digital Presence | iShareHow Studios</title>
        <meta name="description" content="Transform your digital presence with strategic creative services, custom applications, and AI-powered content training. Join 100+ organizations achieving 30% efficiency gains." />
        <meta name="keywords" content="creative services, AI content training, digital transformation, custom applications, consulting services, iShareHow Studios" />
        <meta property="og:title" content="Creative Services - Transform Your Digital Presence" />
        <meta property="og:description" content="Strategic creative services and AI-powered content training. Join 100+ organizations achieving 30% efficiency gains." />
      </Head>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out;
        }
        
        .animate-slide-in-left {
          animation: slideInLeft 0.8s ease-out;
        }
        
        .animate-slide-in-right {
          animation: slideInRight 0.8s ease-out;
        }
        
        .animate-pulse-slow {
          animation: pulse 3s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(139, 92, 246, 0.2);
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s;
        }
        
        .btn-primary:hover::before {
          left: 100%;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(139, 92, 246, 0.4);
        }
        
        .stat-card {
          transition: all 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-5px) scale(1.02);
        }
      `}</style>

      <div className="min-h-screen bg-white">
        {/* Navigation - Sticky with CTA */}
        <header className="fixed top-0 left-0 right-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50 border-b border-gray-100" id="creative-services-nav">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-2xl font-bold gradient-text hover:opacity-80 transition">
                iShareHow Studios
              </Link>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => scrollToSection('offerings')}
                  className="hidden md:block px-4 py-2 text-gray-700 hover:text-purple-600 font-medium transition"
                >
                  Services
                </button>
                <button
                  onClick={() => scrollToSection('program')}
                  className="hidden md:block px-4 py-2 text-gray-700 hover:text-purple-600 font-medium transition"
                >
                  Training
                </button>
                <Link 
                  href="/prospecting?tier=3" 
                  className="px-6 py-2 btn-primary text-white rounded-lg font-semibold shadow-lg"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </nav>
        </header>

        {/* Hero Section - Enhanced with animations */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <div className={`${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <div className="inline-block px-4 py-2 bg-purple-100 rounded-full text-purple-700 font-semibold text-sm mb-6 animate-pulse-slow">
                🎯 Join 100+ Organizations Transforming Their Digital Presence
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Transform Your Digital Presence Into
                <br />
                <span className="gradient-text">Revenue Growth</span>
              </h1>
              <p className="text-2xl md:text-3xl text-gray-700 mb-4 font-semibold">
                Proven <span className="text-purple-600 font-bold">30% efficiency gains</span> with our integrated creative services
              </p>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                As the Director behind iShareHow Labs, I've poured years of hands-on experience into demystifying the digital landscape. This system isn't just another subscription—<strong className="text-gray-900">it's your direct line to overwhelming value</strong>.
              </p>
              
              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>No contracts required</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>Cancel anytime</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>7-day trial available</span>
                </div>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  href="/prospecting?tier=3" 
                  className="px-10 py-5 btn-primary text-white rounded-xl font-bold text-lg shadow-xl w-full sm:w-auto"
                >
                  Start Your Transformation Today →
                </Link>
                <button
                  onClick={() => scrollToSection('program')}
                  className="px-10 py-5 bg-white border-3 border-purple-600 text-purple-600 rounded-xl font-bold text-lg hover:bg-purple-50 transition w-full sm:w-auto shadow-lg"
                >
                  Learn About AI Training
                </button>
                <button
                  onClick={() => scrollToSection('testimonials')}
                  className="px-10 py-5 bg-gray-100 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-200 transition w-full sm:w-auto"
                >
                  See Success Stories
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar - Social Proof */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-y border-gray-200">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { number: '100+', label: 'Organizations', icon: '🚀' },
                { number: '30%', label: 'Efficiency Gain', icon: '📈' },
                { number: '25%', label: 'Time Saved', icon: '⏱️' },
                { number: '98%', label: 'Satisfaction', icon: '⭐' }
              ].map((stat, idx) => (
                <div key={idx} className="stat-card text-center">
                  <div className="text-4xl mb-2 animate-float">{stat.icon}</div>
                  <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-semibold uppercase text-sm tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Understanding the Digital Landscape */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Understanding the Digital Landscape
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                At <strong className="text-purple-600">iShareHow Creative Labs</strong>, we are dedicated to demystifying this landscape, offering tools that enhance operational capabilities and grow your project.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                { icon: '🚀', title: 'Innovative Solutions', desc: 'We develop cutting-edge apps that streamline operations, improve efficiency, and foster growth.', color: 'purple' },
                { icon: '🎯', title: 'Strategic Development', desc: 'Our team collaborates closely with partners to create solutions that align with their unique goals.', color: 'pink' },
                { icon: '🛡️', title: 'Ongoing Support', desc: 'We provide continuous support to help businesses adapt and thrive in an ever-changing digital environment.', color: 'indigo' }
              ].map((feature, idx) => (
                <div 
                  key={idx} 
                  className={`bg-gradient-to-br from-${feature.color}-50 to-white p-8 rounded-2xl border-2 border-${feature.color}-100 hover-lift cursor-pointer`}
                  onClick={() => scrollToSection('offerings')}
                >
                  <div className="text-5xl mb-4 animate-pulse-slow">{feature.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">{feature.desc}</p>
                  <button className="text-purple-600 font-semibold hover:text-purple-700 transition">
                    Learn More →
                  </button>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <Link 
                href="/prospecting" 
                className="inline-block px-8 py-4 btn-primary text-white rounded-xl font-bold text-lg shadow-lg"
              >
                Explore All Services
              </Link>
            </div>
          </div>
        </section>

        {/* Key Offerings - Enhanced with CTAs */}
        <section id="offerings" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Key Offerings
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                iShareHow Studios and Ventures stands out with a variety of offerings designed to address specific business challenges
              </p>
            </div>

            {/* Customized Applications */}
            <div className="bg-white rounded-2xl p-8 md:p-10 mb-8 border-2 border-gray-200 shadow-lg hover-lift">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="text-6xl animate-float">📱</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-3xl font-bold text-gray-900">1. Customized Applications</h3>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">Popular</span>
                  </div>
                  <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                    We specialize in creating applications tailored to your business needs. Whether it's a mobile app for customer engagement or an internal tool for efficiency, we've got you covered.
                  </p>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
                    <h4 className="font-bold text-purple-900 mb-2 text-lg">✓ Success Story: Retail Client</h4>
                    <p className="text-gray-700">
                      By implementing our customized inventory management app, a retail partner <strong className="text-purple-600">reduced stock discrepancies by 30%</strong>, leading to improved sales and customer satisfaction.
                    </p>
                  </div>
                  <Link 
                    href="/prospecting?tier=3" 
                    className="inline-block px-6 py-3 btn-primary text-white rounded-lg font-semibold"
                  >
                    Get Custom Application →
                  </Link>
                </div>
              </div>
            </div>

            {/* Consulting Services */}
            <div className="bg-white rounded-2xl p-8 md:p-10 mb-8 border-2 border-gray-200 shadow-lg hover-lift">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="text-6xl animate-float">💼</div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">2. Consulting Services</h3>
                  <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                    With our expertise, we guide organizations in navigating digital transformations, ensuring they leverage technology effectively.
                  </p>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                    <h4 className="font-bold text-blue-900 mb-2 text-lg">✓ Success Story: Logistics Company</h4>
                    <p className="text-gray-700">
                      Our consulting services helped streamline their supply chain operations, resulting in a noteworthy <strong className="text-blue-600">25% reduction in delivery times</strong>.
                    </p>
                  </div>
                  <Link 
                    href="/prospecting" 
                    className="inline-block px-6 py-3 btn-primary text-white rounded-lg font-semibold"
                  >
                    Schedule Consultation →
                  </Link>
                </div>
              </div>
            </div>

            {/* Training Programs */}
            <div className="bg-white rounded-2xl p-8 md:p-10 border-2 border-gray-200 shadow-lg hover-lift">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="text-6xl animate-float">🎓</div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">3. Training Programs</h3>
                  <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                    We offer training sessions to empower your team with the knowledge they need to make the most of our solutions.
                  </p>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                    <h4 className="font-bold text-green-900 mb-2 text-lg">✓ Success Story: Healthcare Provider</h4>
                    <p className="text-gray-700">
                      Through our training programs, staff members improved their digital skillset, <strong className="text-green-600">enhancing patient interactions and overall service quality</strong>.
                    </p>
                  </div>
                  <Link 
                    href="/prospecting?tier=3" 
                    className="inline-block px-6 py-3 btn-primary text-white rounded-lg font-semibold"
                  >
                    Join Training Program →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Trusted by Industry Leaders
              </h2>
              <p className="text-xl text-gray-600">
                See how organizations are transforming their digital presence
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 md:p-12 border-2 border-purple-200 shadow-xl">
              <div className="text-center mb-6">
                <div className="flex justify-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-3xl text-yellow-400">⭐</span>
                  ))}
                </div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {testimonials[activeTestimonial].metric}
                </p>
              </div>
              <blockquote className="text-xl md:text-2xl text-gray-700 italic mb-6 text-center">
                "{testimonials[activeTestimonial].quote}"
              </blockquote>
              <div className="text-center">
                <p className="font-bold text-gray-900 text-lg">{testimonials[activeTestimonial].author}</p>
                <p className="text-gray-600">{testimonials[activeTestimonial].role}</p>
              </div>
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTestimonial(idx)}
                    className={`w-3 h-3 rounded-full transition ${
                      idx === activeTestimonial ? 'bg-purple-600 w-8' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* AI Content Training Program - Enhanced */}
        <section id="program" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <div className="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold mb-6 animate-pulse-slow">
                🎤 Featured Program
              </div>
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                Unlock Your Voice: Join Our Affiliate AI Content Training Program!
              </h2>
              <p className="text-2xl mb-4 opacity-95">
                Are you ready to amplify your message, build your influence, and master the new frontier of digital content creation?
              </p>
              <p className="text-xl opacity-90 max-w-4xl mx-auto">
                The <strong>iShareHow Labs & Rise With Jamel</strong> are thrilled to announce our exclusive Affiliate AI Content Training Program, designed to empower you to become a true thought leader in your niche.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-10 mb-8 border-2 border-white/20">
              <h3 className="text-3xl font-bold mb-6">Why This Program? It's About Influence & Impact.</h3>
              <p className="text-lg mb-6 opacity-95 leading-relaxed">
                This isn't just another course on AI. This program is for the <strong>future content creators of the digital age</strong> – those who understand that true impact comes from clear communication, strategic influence, and a deep connection with their audience.
              </p>
              
              <h4 className="text-2xl font-bold mb-4">Imagine using AI to:</h4>
              <ul className="space-y-4 mb-8">
                {[
                  'Explain complex cybersecurity concepts with crystal clarity',
                  'Articulate the principles of decentralized living and self-sovereignty',
                  'Share the wisdom of bushcraft and nature-based resilience',
                  'Craft compelling narratives that explore consciousness, energy, and aura',
                  'Build your empire with the strategies we use ourselves'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <span className="text-3xl">✓</span>
                    <span className="text-lg opacity-95 flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {[
                { title: 'Generate High-Quality Content with AI', desc: 'Learn to prompt, refine, and edit AI-generated text for articles, social media, scripts, and more.' },
                { title: 'Develop Your Unique Voice', desc: 'Use AI to enhance your personal brand, ensuring your content reflects your authentic self.' },
                { title: 'Build an Affiliate Empire', desc: 'Understand the strategies behind affiliate marketing and how to monetize your AI-powered content effectively.' },
                { title: 'Master Content Strategy', desc: 'Plan, produce, and distribute content that attracts your ideal audience and converts engagement into opportunity.' },
                { title: 'Ethical AI Use', desc: 'Navigate the ethical landscape of AI content creation, ensuring authenticity and integrity in all your endeavors.' },
                { title: 'Amplify Your Message', desc: 'Transform your passion into influence, building a platform that truly moves the collective forward.' }
              ].map((skill, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border-2 border-white/20 hover:bg-white/20 transition">
                  <h4 className="text-lg font-bold mb-2">{skill.title}</h4>
                  <p className="opacity-90">{skill.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link 
                href="/prospecting?tier=3" 
                className="inline-block px-12 py-6 bg-white text-purple-600 rounded-xl font-bold text-2xl hover:shadow-2xl transition transform hover:scale-105"
              >
                Join the AI Content Training Program
                <div className="text-base font-normal mt-2 opacity-90">Select Tier 3 Membership to Get Started</div>
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              As we transition from iShareHow Labs to <strong>iShareHow Studios and Ventures</strong>, we invite partners and clients to embark on this journey with us. Together, we will continue to provide the resources and support necessary to navigate the digital landscape.
            </p>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 md:p-10 mb-8 border-2 border-purple-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment to You</h3>
              <p className="text-lg text-gray-700">
                Staying competitive in today's market requires innovation and strategy. At iShareHow Studios and Ventures, we are committed to standing by your side, helping you <strong className="text-purple-600">unlock your business's full potential</strong>. Let's work together to harness the power of technology for your success.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/prospecting?tier=3" 
                className="px-10 py-5 btn-primary text-white rounded-xl font-bold text-lg shadow-xl"
              >
                Become a Client →
              </Link>
              <a 
                href="mailto:contact@isharehowlabs.com" 
                className="px-10 py-5 bg-white border-3 border-purple-600 text-purple-600 rounded-xl font-bold text-lg hover:bg-purple-50 transition shadow-lg"
              >
                Contact Us Directly
              </a>
            </div>
          </div>
        </section>

        {/* Scroll to Top Button */}
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
              Core operations: <a href="http://isharehowlabs.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition">isharehowlabs.com</a>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default CreativeServicesPage;

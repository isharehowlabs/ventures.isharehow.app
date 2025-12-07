import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

const CreativeServicesPage = () => {
  return (
    <>
      <Head>
        <title>Creative Services - iShareHow Studios & Ventures</title>
        <meta name="description" content="Transform your digital presence with strategic creative services, custom applications, and AI-powered content training from iShareHow Studios & Ventures." />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation - Designity Style */}
        <nav className="sticky top-0 w-full bg-white shadow-sm z-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                iShareHow <span className="text-purple-600">Studios</span>
              </Link>
              <div className="flex items-center gap-6">
                <a href="#services" className="text-gray-600 hover:text-gray-900 font-medium hidden md:block">Services</a>
                <a href="#results" className="text-gray-600 hover:text-gray-900 font-medium hidden md:block">Results</a>
                <a href="#training" className="text-gray-600 hover:text-gray-900 font-medium hidden md:block">AI Training</a>
                <Link href="/prospecting?tier=3" className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section - Designity Inspired */}
        <section className="pt-20 pb-16 px-6 lg:px-8 bg-white">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-6">
              ✨ Welcome, Digital Guardian
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Hey there, fellow guardians of the{' '}
              <span className="text-purple-600">digital realm!</span>
            </h1>
            <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto leading-relaxed">
              I'm thrilled you've found your way here. As the Director behind{' '}
              <a href="http://isharehowlabs.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 font-semibold border-b-2 border-purple-200 hover:border-purple-600 transition">
                iShareHow Labs
              </a>
              , I've poured years of hands-on experience into demystifying the digital landscape and fortifying strategies for organizations big and small.
            </p>
            <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
              This system isn't just another subscription—<strong className="text-gray-900">it's your direct line to overwhelming value</strong>, where my niche expertise becomes your competitive advantage.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/prospecting?tier=3" className="px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold text-lg hover:bg-purple-700 transition shadow-lg hover:shadow-xl">
                Join the AI Training Program →
              </Link>
              <Link href="/prospecting" className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-semibold text-lg hover:border-purple-600 hover:text-purple-600 transition">
                Explore All Services
              </Link>
            </div>
          </div>
        </section>

        {/* Understanding Section - Card Style */}
        <section className="py-20 px-6 lg:px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Understanding the Digital Landscape
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                As organizations navigate the complexities of the digital world, the need for innovative solutions and strategic development has never been greater.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm mb-12">
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                At <strong className="text-purple-600">iShareHow Creative Labs</strong>, we are dedicated to demystifying this landscape, offering tools that enhance operational capabilities and grow your project. Our mission is clear: to empower businesses through tailored applications and services that meet diverse needs.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl mb-4">🚀</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Innovative Solutions</h3>
                  <p className="text-gray-600 text-sm">We develop cutting-edge apps that streamline operations, improve efficiency, and foster growth.</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl mb-4">🎯</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Strategic Development</h3>
                  <p className="text-gray-600 text-sm">Our team collaborates closely with partners to create solutions that align with their unique goals.</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl mb-4">🛡️</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Ongoing Support</h3>
                  <p className="text-gray-600 text-sm">We provide continuous support to help businesses adapt and thrive in an ever-changing digital environment.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Offerings - Designity Card Layout */}
        <section id="services" className="py-20 px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Key Offerings
              </h2>
              <p className="text-xl text-gray-600">
                iShareHow Studios and Ventures stands out with a variety of offerings designed to address specific business challenges
              </p>
            </div>

            <div className="space-y-8">
              {/* Customized Applications */}
              <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-10 hover:shadow-lg transition">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">📱</div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">1. Customized Applications</h3>
                    <p className="text-lg text-gray-600 mb-6">
                      We specialize in creating applications tailored to your business needs. Whether it's a mobile app for customer engagement or an internal tool for efficiency, we've got you covered.
                    </p>
                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">✓</div>
                        <div>
                          <h4 className="font-bold text-purple-900 mb-1">Success Story: Retail Client</h4>
                          <p className="text-gray-700">
                            By implementing our customized inventory management app, a retail partner <strong className="text-gray-900">reduced stock discrepancies by 30%</strong>, leading to improved sales and customer satisfaction.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Consulting Services */}
              <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-10 hover:shadow-lg transition">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">💼</div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">2. Consulting Services</h3>
                    <p className="text-lg text-gray-600 mb-6">
                      With our expertise, we guide organizations in navigating digital transformations, ensuring they leverage technology effectively.
                    </p>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">✓</div>
                        <div>
                          <h4 className="font-bold text-blue-900 mb-1">Success Story: Logistics Company</h4>
                          <p className="text-gray-700">
                            Our consulting services helped streamline their supply chain operations, resulting in a noteworthy <strong className="text-gray-900">25% reduction in delivery times</strong>.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Training Programs */}
              <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-10 hover:shadow-lg transition">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">🎓</div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">3. Training Programs</h3>
                    <p className="text-lg text-gray-600 mb-6">
                      We offer training sessions to empower your team with the knowledge they need to make the most of our solutions.
                    </p>
                    <div className="bg-green-50 border border-green-100 rounded-xl p-6">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-600 text-white rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">✓</div>
                        <div>
                          <h4 className="font-bold text-green-900 mb-1">Success Story: Healthcare Provider</h4>
                          <p className="text-gray-700">
                            Through our training programs, staff members improved their digital skillset, <strong className="text-gray-900">enhancing patient interactions and overall service quality</strong>.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Training Program - Featured Section */}
        <section id="training" className="py-20 px-6 lg:px-8 bg-gray-900 text-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-semibold mb-6">
                🎤 Featured Program
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Unlock Your Voice: Join Our Affiliate AI Content Training Program!
              </h2>
              <p className="text-xl text-gray-300 mb-4">
                Are you ready to amplify your message, build your influence, and master the new frontier of digital content creation?
              </p>
              <p className="text-lg text-gray-400">
                The <strong className="text-white">iShareHow Labs & Rise With Jamel</strong> are thrilled to announce our exclusive Affiliate AI Content Training Program, designed to empower you to become a true thought leader in your niche, leveraging cutting-edge AI tools.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-10 mb-10">
              <h3 className="text-2xl font-bold mb-4">Why This Program? It's About Influence & Impact.</h3>
              <p className="text-lg text-gray-300 mb-6">
                This isn't just another course on AI. This program is for the <strong className="text-white">future content creators of the digital age</strong> – those who understand that true impact comes from clear communication, strategic influence, and a deep connection with their audience.
              </p>
              <p className="text-lg text-gray-300 mb-8">
                We believe AI is a powerful tool for self-reliance, allowing you to scale your voice and reach like never before.
              </p>

              <h4 className="text-xl font-bold mb-6">Imagine using AI to:</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'Explain complex cybersecurity concepts with crystal clarity',
                  'Articulate the principles of decentralized living and self-sovereignty',
                  'Share the wisdom of bushcraft and nature-based resilience',
                  'Craft compelling narratives that explore consciousness, energy, and aura',
                  'Build your empire with the strategies we use ourselves'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white/5 rounded-lg p-4">
                    <span className="text-purple-400 text-xl flex-shrink-0">✓</span>
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {[
                { title: 'Generate High-Quality Content with AI', desc: 'Learn to prompt, refine, and edit AI-generated text for articles, social media, scripts, and more.' },
                { title: 'Develop Your Unique Voice', desc: 'Use AI to enhance your personal brand, ensuring your content reflects your authentic self.' },
                { title: 'Build an Affiliate Empire', desc: 'Understand the strategies behind affiliate marketing and how to monetize your AI-powered content effectively.' },
                { title: 'Master Content Strategy', desc: 'Plan, produce, and distribute content that attracts your ideal audience and converts engagement into opportunity.' },
                { title: 'Ethical AI Use', desc: 'Navigate the ethical landscape of AI content creation, ensuring authenticity and integrity in all your endeavors.' },
                { title: 'Amplify Your Message', desc: 'Transform your passion into influence, building a platform that truly moves the collective forward.' }
              ].map((skill, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                  <h4 className="text-lg font-bold mb-3 text-white">{skill.title}</h4>
                  <p className="text-gray-400 text-sm">{skill.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link href="/prospecting?tier=3" className="inline-block px-12 py-5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xl transition shadow-xl">
                Join the AI Content Training Program
                <div className="text-sm font-normal mt-1 opacity-90">Select Tier 3 Membership to Get Started</div>
              </Link>
            </div>
          </div>
        </section>

        {/* Join Us Section */}
        <section className="py-20 px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Join Us in this New Chapter
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                As we transition from iShareHow Labs to <strong className="text-gray-900">iShareHow Studios and Ventures</strong>, we invite partners and clients to embark on this journey with us.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 md:p-10 mb-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment to You</h3>
              <p className="text-lg text-gray-700">
                Staying competitive in today's market requires innovation and strategy. At iShareHow Studios and Ventures, we are committed to standing by your side, helping you <strong className="text-purple-600">unlock your business's full potential</strong>. Let's work together to harness the power of technology for your success.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/prospecting" className="px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold text-lg hover:bg-purple-700 transition text-center">
                Become a Client
              </Link>
              <a href="mailto:contact@isharehowlabs.com" className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-semibold text-lg hover:border-purple-600 hover:text-purple-600 transition text-center">
                Contact Us Directly
              </a>
            </div>
          </div>
        </section>

        {/* Footer - Designity Style */}
        <footer className="py-12 px-6 lg:px-8 bg-gray-900 text-white border-t border-gray-800">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <p className="text-gray-400 mb-2">
                © 2024 iShareHow Studios & Ventures. All rights reserved.
              </p>
              <p className="text-gray-500 text-sm">
                Core operations: <a href="http://isharehowlabs.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition">isharehowlabs.com</a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default CreativeServicesPage;

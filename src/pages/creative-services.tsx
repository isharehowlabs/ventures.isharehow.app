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

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                iShareHow Studios
              </Link>
              <Link href="/prospecting?tier=3" className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition">
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Hey there, fellow guardians of the{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                digital realm!
              </span>
            </h1>
            <p className="text-xl text-gray-700 mb-4">
              I'm thrilled you've found your way here. As the Director behind{' '}
              <a href="http://isharehowlabs.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 font-semibold underline">
                iShareHow Labs
              </a>
              , I've poured years of hands-on experience into demystifying the digital landscape and fortifying strategies for organizations big and small.
            </p>
            <p className="text-lg text-gray-600 mb-8">
              This system isn't just another subscription—<strong className="text-gray-900">it's your direct line to overwhelming value</strong>, where my niche expertise becomes your competitive advantage.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/prospecting?tier=3" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold text-lg hover:shadow-xl transition">
                Join the AI Training Program
              </Link>
              <Link href="/prospecting" className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-bold text-lg hover:border-purple-600 transition">
                Explore All Services
              </Link>
            </div>
          </div>
        </section>

        {/* Understanding the Digital Landscape */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Understanding the Digital Landscape
            </h2>
            <p className="text-lg text-gray-700 mb-4 leading-relaxed">
              As organizations navigate the complexities of the digital world, the need for innovative solutions and strategic development has never been greater. At <strong className="text-purple-600">iShareHow Creative Labs</strong>, we are dedicated to demystifying this landscape, offering tools that enhance operational capabilities and grow your project.
            </p>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Our mission is clear: to empower businesses through tailored applications and services that meet diverse needs.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100">
                <div className="text-4xl mb-3">🚀</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Innovative Solutions</h3>
                <p className="text-gray-600">We develop cutting-edge apps that streamline operations, improve efficiency, and foster growth.</p>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-white p-6 rounded-xl border border-pink-100">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Strategic Development</h3>
                <p className="text-gray-600">Our team collaborates closely with partners to create solutions that align with their unique goals.</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border border-indigo-100">
                <div className="text-4xl mb-3">🛡️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ongoing Support</h3>
                <p className="text-gray-600">We provide continuous support to help businesses adapt and thrive in an ever-changing digital environment.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Offerings */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
              Key Offerings
            </h2>
            <p className="text-xl text-gray-600 mb-12 text-center">
              iShareHow Studios and Ventures stands out with a variety of offerings designed to address specific business challenges
            </p>

            {/* Customized Applications */}
            <div className="bg-white rounded-2xl p-8 mb-8 border border-gray-200 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="text-5xl">📱</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">1. Customized Applications</h3>
                  <p className="text-lg text-gray-700 mb-6">
                    We specialize in creating applications tailored to your business needs. Whether it's a mobile app for customer engagement or an internal tool for efficiency, we've got you covered.
                  </p>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <h4 className="font-bold text-purple-900 mb-2">Success Story: Retail Client</h4>
                    <p className="text-gray-700">
                      By implementing our customized inventory management app, a retail partner <strong>reduced stock discrepancies by 30%</strong>, leading to improved sales and customer satisfaction.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Consulting Services */}
            <div className="bg-white rounded-2xl p-8 mb-8 border border-gray-200 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="text-5xl">💼</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">2. Consulting Services</h3>
                  <p className="text-lg text-gray-700 mb-6">
                    With our expertise, we guide organizations in navigating digital transformations, ensuring they leverage technology effectively.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="font-bold text-blue-900 mb-2">Success Story: Logistics Company</h4>
                    <p className="text-gray-700">
                      Our consulting services helped streamline their supply chain operations, resulting in a noteworthy <strong>25% reduction in delivery times</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Training Programs */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="text-5xl">🎓</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">3. Training Programs</h3>
                  <p className="text-lg text-gray-700 mb-6">
                    We offer training sessions to empower your team with the knowledge they need to make the most of our solutions.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h4 className="font-bold text-green-900 mb-2">Success Story: Healthcare Provider</h4>
                    <p className="text-gray-700">
                      Through our training programs, staff members improved their digital skillset, <strong>enhancing patient interactions and overall service quality</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Content Training Program */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-semibold mb-4">
                🎤 Featured Program
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Unlock Your Voice: Join Our Affiliate AI Content Training Program!
              </h2>
              <p className="text-xl mb-4 opacity-95">
                Are you ready to amplify your message, build your influence, and master the new frontier of digital content creation?
              </p>
              <p className="text-lg opacity-90">
                The <strong>iShareHow Labs & Rise With Jamel</strong> are thrilled to announce our exclusive Affiliate AI Content Training Program, designed to empower you to become a true thought leader in your niche, leveraging cutting-edge AI tools.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-4">Why This Program? It's About Influence & Impact.</h3>
              <p className="text-lg mb-6 opacity-95">
                This isn't just another course on AI. This program is for the <strong>future content creators of the digital age</strong> – those who understand that true impact comes from clear communication, strategic influence, and a deep connection with their audience.
              </p>
              <p className="text-lg mb-6 opacity-95">
                We believe AI is a powerful tool for self-reliance, allowing you to scale your voice and reach like never before.
              </p>

              <h4 className="text-xl font-bold mb-4">Imagine using AI to:</h4>
              <ul className="space-y-3">
                {[
                  'Explain complex cybersecurity concepts with crystal clarity',
                  'Articulate the principles of decentralized living and self-sovereignty',
                  'Share the wisdom of bushcraft and nature-based resilience',
                  'Craft compelling narratives that explore consciousness, energy, and aura',
                  'Build your empire with the strategies we use ourselves'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-2xl">✓</span>
                    <span className="text-lg opacity-95">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {[
                { title: 'Generate High-Quality Content with AI', desc: 'Learn to prompt, refine, and edit AI-generated text for articles, social media, scripts, and more.' },
                { title: 'Develop Your Unique Voice', desc: 'Use AI to enhance your personal brand, ensuring your content reflects your authentic self.' },
                { title: 'Build an Affiliate Empire', desc: 'Understand the strategies behind affiliate marketing and how to monetize your AI-powered content effectively.' },
                { title: 'Master Content Strategy', desc: 'Plan, produce, and distribute content that attracts your ideal audience and converts engagement into opportunity.' },
                { title: 'Ethical AI Use', desc: 'Navigate the ethical landscape of AI content creation, ensuring authenticity and integrity in all your endeavors.' },
                { title: 'Amplify Your Message', desc: 'Transform your passion into influence, building a platform that truly moves the collective forward.' }
              ].map((skill, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h4 className="text-lg font-bold mb-2">{skill.title}</h4>
                  <p className="opacity-90">{skill.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link href="/prospecting?tier=3" className="inline-block px-12 py-5 bg-white text-purple-600 rounded-xl font-bold text-xl hover:shadow-2xl transition">
                Join the AI Content Training Program
                <div className="text-sm font-normal mt-1">Select Tier 3 Membership to Get Started</div>
              </Link>
            </div>
          </div>
        </section>

        {/* Join Us Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Join Us in this New Chapter
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              As we transition from iShareHow Labs to <strong>iShareHow Studios and Ventures</strong>, we invite partners and clients to embark on this journey with us. Together, we will continue to provide the resources and support necessary to navigate the digital landscape.
            </p>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 mb-8 border border-purple-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment to You</h3>
              <p className="text-lg text-gray-700">
                Staying competitive in today's market requires innovation and strategy. At iShareHow Studios and Ventures, we are committed to standing by your side, helping you <strong className="text-purple-600">unlock your business's full potential</strong>. Let's work together to harness the power of technology for your success.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/prospecting" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold text-lg hover:shadow-xl transition">
                Become a Client
              </Link>
              <a href="mailto:contact@isharehowlabs.com" className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-bold text-lg hover:border-purple-600 transition">
                Contact Us Directly
              </a>
            </div>
          </div>
        </section>

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

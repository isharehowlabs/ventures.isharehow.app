import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';

const CreativeServicesPage = () => {
  return (
    <>
      <Head>
        <title>Creative Services - iShareHow Studios & Ventures</title>
        <meta name="description" content="Transform your digital presence with strategic creative services, custom applications, and AI-powered content training from iShareHow Studios & Ventures." />
        <meta property="og:title" content="Creative Services - iShareHow Studios & Ventures" />
        <meta property="og:description" content="Your direct line to overwhelming value in the digital landscape. Custom apps, consulting, and AI content mastery." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative max-w-7xl mx-auto"
          >
            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                Welcome, Fellow Guardian of the{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                  Digital Realm
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-4xl mx-auto">
                I'm thrilled you've found your way here. As the Director behind{' '}
                <a href="http://isharehowlabs.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">
                  iShareHow Labs
                </a>
                , I've poured years of hands-on experience into demystifying the digital landscape.
              </p>
              <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-8">
                This system isn't just another subscription—<strong className="text-white">it's your direct line to overwhelming value</strong>, where my niche expertise becomes your competitive advantage.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="#offerings" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-purple-500/50">
                  Explore Our Services
                </Link>
                <Link href="#contact" className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold text-lg hover:bg-white/20 transition-all border border-white/20">
                  Start Your Journey
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Mission Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/30">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center">
                Understanding the Digital Landscape
              </h2>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                As organizations navigate the complexities of the digital world, the need for innovative solutions and strategic development has never been greater. At <strong className="text-purple-400">iShareHow Creative Labs</strong>, we are dedicated to demystifying this landscape, offering tools that enhance operational capabilities and grow your project.
              </p>
              <p className="text-lg text-gray-300 mb-12 leading-relaxed">
                Our mission is clear: <strong className="text-white">to empower businesses through tailored applications and services that meet diverse needs.</strong>
              </p>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: '🚀',
                    title: 'Innovative Solutions',
                    description: 'We develop cutting-edge apps that streamline operations, improve efficiency, and foster growth.'
                  },
                  {
                    icon: '🎯',
                    title: 'Strategic Development',
                    description: 'Our team collaborates closely with partners to create solutions that align with their unique goals.'
                  },
                  {
                    icon: '🛡️',
                    title: 'Ongoing Support',
                    description: 'We provide continuous support to help businesses adapt and thrive in an ever-changing digital environment.'
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
                  >
                    <div className="text-4xl mb-4">{item.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                    <p className="text-gray-400">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Key Offerings Section */}
        <section id="offerings" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">
                Key Offerings
              </h2>
              <p className="text-xl text-gray-400 mb-16 text-center max-w-3xl mx-auto">
                iShareHow Studios and Ventures stands out with a variety of offerings designed to address specific business challenges
              </p>

              <div className="space-y-12">
                {/* Customized Applications */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 md:p-12"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-5xl">📱</div>
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-4">1. Customized Applications</h3>
                      <p className="text-lg text-gray-300 mb-6">
                        We specialize in creating applications tailored to your business needs. Whether it's a mobile app for customer engagement or an internal tool for efficiency, we've got you covered.
                      </p>
                      <div className="bg-black/30 rounded-lg p-6">
                        <h4 className="text-purple-400 font-semibold mb-3">Success Story: Retail Client</h4>
                        <p className="text-gray-300">
                          By implementing our customized inventory management app, a retail partner <strong className="text-white">reduced stock discrepancies by 30%</strong>, leading to improved sales and customer satisfaction.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Consulting Services */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8 md:p-12"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-5xl">💼</div>
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-4">2. Consulting Services</h3>
                      <p className="text-lg text-gray-300 mb-6">
                        With our expertise, we guide organizations in navigating digital transformations, ensuring they leverage technology effectively.
                      </p>
                      <div className="bg-black/30 rounded-lg p-6">
                        <h4 className="text-blue-400 font-semibold mb-3">Success Story: Logistics Company</h4>
                        <p className="text-gray-300">
                          Our consulting services helped streamline their supply chain operations, resulting in a noteworthy <strong className="text-white">25% reduction in delivery times</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Training Programs */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-r from-green-900/30 to-blue-900/30 backdrop-blur-sm border border-green-500/30 rounded-2xl p-8 md:p-12"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-5xl">🎓</div>
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-4">3. Training Programs</h3>
                      <p className="text-lg text-gray-300 mb-6">
                        We offer training sessions to empower your team with the knowledge they need to make the most of our solutions.
                      </p>
                      <div className="bg-black/30 rounded-lg p-6">
                        <h4 className="text-green-400 font-semibold mb-3">Success Story: Healthcare Provider</h4>
                        <p className="text-gray-300">
                          Through our training programs, staff members improved their digital skillset, <strong className="text-white">enhancing patient interactions and overall service quality</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* AI Content Training Program */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-900/50 to-pink-900/50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  🎤 Unlock Your Voice: Affiliate AI Content Training
                </h2>
                <p className="text-2xl text-purple-200 mb-4">
                  Join Our Exclusive Program!
                </p>
                <p className="text-lg text-gray-300 max-w-4xl mx-auto">
                  Are you ready to amplify your message, build your influence, and master the new frontier of digital content creation? 
                  The <strong className="text-white">iShareHow Labs & Rise With Jamel</strong> are thrilled to announce our exclusive Affiliate AI Content Training Program.
                </p>
              </div>

              <div className="bg-black/40 backdrop-blur-sm border border-purple-500/50 rounded-2xl p-8 md:p-12 mb-12">
                <h3 className="text-3xl font-bold text-white mb-6">Why This Program? It's About Influence & Impact.</h3>
                <p className="text-lg text-gray-300 mb-6">
                  This isn't just another course on AI. This program is for the <strong className="text-purple-400">future content creators of the digital age</strong> – those who understand that true impact comes from clear communication, strategic influence, and a deep connection with their audience.
                </p>
                <p className="text-lg text-gray-300 mb-6">
                  We believe AI is a powerful tool for self-reliance, allowing you to scale your voice and reach like never before.
                </p>

                <h4 className="text-2xl font-bold text-white mb-4">Imagine using AI to:</h4>
                <ul className="space-y-3 mb-8">
                  {[
                    'Explain complex cybersecurity concepts with crystal clarity',
                    'Articulate the principles of decentralized living and self-sovereignty',
                    'Share the wisdom of bushcraft and nature-based resilience',
                    'Craft compelling narratives that explore consciousness, energy, and aura',
                    'Build your empire with the strategies we use ourselves'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-300">
                      <span className="text-purple-400 text-xl">✓</span>
                      <span className="text-lg">{item}</span>
                    </li>
                  ))}
                </ul>

                <p className="text-lg text-purple-200 font-semibold">
                  This program embodies our collective's spirit and we will teach you what we do to build our empire.
                </p>
              </div>

              {/* What You'll Master */}
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                {[
                  {
                    title: 'Generate High-Quality Content with AI',
                    description: 'Learn to prompt, refine, and edit AI-generated text for articles, social media, scripts, and more.'
                  },
                  {
                    title: 'Develop Your Unique Voice',
                    description: 'Use AI to enhance your personal brand, ensuring your content reflects your authentic self.'
                  },
                  {
                    title: 'Build an Affiliate Empire',
                    description: 'Understand the strategies behind affiliate marketing and how to monetize your AI-powered content effectively.'
                  },
                  {
                    title: 'Master Content Strategy',
                    description: 'Plan, produce, and distribute content that attracts your ideal audience and converts engagement into opportunity.'
                  },
                  {
                    title: 'Ethical AI Use',
                    description: 'Navigate the ethical landscape of AI content creation, ensuring authenticity and integrity in all your endeavors.'
                  },
                  {
                    title: 'Amplify Your Message',
                    description: 'Transform your passion into influence, building a platform that truly moves the collective forward.'
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all"
                  >
                    <h4 className="text-xl font-bold text-white mb-3">{item.title}</h4>
                    <p className="text-gray-400">{item.description}</p>
                  </motion.div>
                ))}
              </div>

              {/* Who Is This For */}
              <div className="bg-gradient-to-r from-pink-900/30 to-purple-900/30 backdrop-blur-sm border border-pink-500/30 rounded-2xl p-8 md:p-12">
                <h3 className="text-3xl font-bold text-white mb-6">Who Is This For?</h3>
                <p className="text-lg text-gray-300 mb-6">
                  This program is for any member of the Collective eager to:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    'Become a recognized authority in their field',
                    'Monetize their insights and build new income streams',
                    'Scale their content creation without sacrificing quality',
                    'Develop a powerful online presence that reflects their deepest values',
                    'Lead and inspire through compelling digital narratives',
                    'Step into their full potential as a guiding voice in the digital world'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 text-gray-300">
                      <span className="text-pink-400 text-2xl">→</span>
                      <span className="text-lg">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/50">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Lead the Content Revolution?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Don't just consume content – <strong className="text-white">create it, strategically and powerfully</strong>. This is your opportunity to step into your full potential and become a guiding voice in the digital world.
              </p>
              <Link href="/prospecting?tier=3" className="inline-block px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-2xl hover:shadow-purple-500/50 hover:scale-105">
                Join the AI Content Training Program
                <div className="text-sm font-normal mt-1">Select Tier 3 Membership to Get Started</div>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Join Us Section */}
        <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm border border-purple-500/40 rounded-2xl p-8 md:p-12 text-center"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Join Us in this New Chapter
              </h2>
              <p className="text-lg text-gray-300 mb-8 max-w-3xl mx-auto">
                As we transition from iShareHow Labs to <strong className="text-white">iShareHow Studios and Ventures</strong>, we invite partners and clients to embark on this journey with us. Together, we will continue to provide the resources and support necessary to navigate the digital landscape.
              </p>
              <div className="bg-black/30 rounded-xl p-8 mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">Our Commitment to You</h3>
                <p className="text-lg text-gray-300">
                  Staying competitive in today's market requires innovation and strategy. At iShareHow Studios and Ventures, we are committed to standing by your side, helping you <strong className="text-purple-400">unlock your business's full potential</strong>. Let's work together to harness the power of technology for your success.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/prospecting" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg">
                  Become a Client
                </Link>
                <a href="mailto:contact@isharehowlabs.com" className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold text-lg hover:bg-white/20 transition-all border border-white/20">
                  Contact Us Directly
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-black/70 border-t border-white/10">
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

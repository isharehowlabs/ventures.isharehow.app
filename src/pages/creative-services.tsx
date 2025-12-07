import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';

const CreativeServicesPage = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <>
      <Head>
        <title>Creative Services - iShareHow Studios & Ventures</title>
        <meta name="description" content="Transform your digital presence with strategic creative services, custom applications, and AI-powered content training from iShareHow Studios & Ventures." />
      </Head>

      <div className="min-h-screen bg-black text-white overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-black to-pink-900 opacity-50" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
        
        {/* Navigation */}
        <motion.nav 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="fixed top-0 w-full z-50 backdrop-blur-xl bg-black/30 border-b border-white/10"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <Link href="/" className="text-2xl font-bold">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                  iShareHow Studios
                </span>
              </Link>
              <div className="flex items-center gap-8">
                <a href="#services" className="text-white/70 hover:text-white transition hidden md:block">Services</a>
                <a href="#results" className="text-white/70 hover:text-white transition hidden md:block">Results</a>
                <a href="#training" className="text-white/70 hover:text-white transition hidden md:block">AI Training</a>
                <Link href="/prospecting?tier=3" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold hover:scale-105 transition-transform shadow-lg shadow-purple-500/50">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </motion.nav>

        {/* Hero Section with Parallax */}
        <section className="relative min-h-screen flex items-center justify-center pt-20 px-6 lg:px-8">
          <motion.div style={{ y, opacity }} className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-700" />
          </motion.div>

          <div className="relative max-w-5xl mx-auto text-center z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-block px-6 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full mb-8">
                <span className="text-sm font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  ✨ Welcome, Digital Guardian
                </span>
              </div>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
                <span className="block mb-2">Hey there, fellow guardians</span>
                <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                  of the digital realm!
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-300 mb-6 leading-relaxed max-w-4xl mx-auto">
                I'm thrilled you've found your way here. As the Director behind{' '}
                <a href="http://isharehowlabs.com" target="_blank" rel="noopener noreferrer" 
                   className="text-purple-400 hover:text-purple-300 font-semibold border-b-2 border-purple-400/50 hover:border-purple-400 transition">
                  iShareHow Labs
                </a>
                , I've poured years of hands-on experience into demystifying the digital landscape and fortifying strategies for organizations big and small.
              </p>

              <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-3xl mx-auto">
                This system isn't just another subscription—
                <strong className="text-white font-bold"> it's your direct line to overwhelming value</strong>, 
                where my niche expertise becomes your competitive advantage.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/prospecting?tier=3" 
                      className="group relative px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-lg overflow-hidden transition-all hover:scale-105 shadow-2xl shadow-purple-500/50">
                  <span className="relative z-10">Join the AI Training Program →</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link href="/prospecting" 
                      className="px-10 py-5 bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-full font-bold text-lg hover:bg-white/10 hover:border-white/40 transition-all">
                  Explore All Services
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          >
            <div className="w-6 h-10 border-2 border-white/30 rounded-full p-1">
              <motion.div 
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 bg-white rounded-full mx-auto"
              />
            </div>
          </motion.div>
        </section>

        {/* Understanding Section */}
        <section className="relative py-32 px-6 lg:px-8 bg-gradient-to-b from-black to-purple-950/20">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-center mb-20">
                <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                  Understanding the Digital Landscape
                </h2>
                <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                  As organizations navigate the complexities of the digital world, the need for innovative solutions and strategic development has never been greater. At <strong className="text-purple-400">iShareHow Creative Labs</strong>, we are dedicated to demystifying this landscape, offering tools that enhance operational capabilities and grow your project.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { icon: '🚀', title: 'Innovative Solutions', desc: 'We develop cutting-edge apps that streamline operations, improve efficiency, and foster growth.' },
                  { icon: '🎯', title: 'Strategic Development', desc: 'Our team collaborates closely with partners to create solutions that align with their unique goals.' },
                  { icon: '🛡️', title: 'Ongoing Support', desc: 'We provide continuous support to help businesses adapt and thrive in an ever-changing digital environment.' }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.2, duration: 0.6 }}
                    whileHover={{ y: -10, scale: 1.02 }}
                    className="group relative p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/20 rounded-3xl hover:border-purple-500/50 transition-all"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 rounded-3xl transition-all" />
                    <div className="relative">
                      <div className="text-5xl mb-4">{item.icon}</div>
                      <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                      <p className="text-gray-400">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Key Offerings */}
        <section id="services" className="relative py-32 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <div className="text-center mb-20">
                <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                  Key Offerings
                </h2>
                <p className="text-xl text-gray-300">
                  iShareHow Studios and Ventures stands out with a variety of offerings designed to address specific business challenges
                </p>
              </div>

              <div className="space-y-12">
                {[
                  {
                    icon: '📱',
                    title: '1. Customized Applications',
                    desc: 'We specialize in creating applications tailored to your business needs. Whether it\'s a mobile app for customer engagement or an internal tool for efficiency, we\'ve got you covered.',
                    story: 'Retail Client',
                    result: 'reduced stock discrepancies by 30%',
                    color: 'purple'
                  },
                  {
                    icon: '💼',
                    title: '2. Consulting Services',
                    desc: 'With our expertise, we guide organizations in navigating digital transformations, ensuring they leverage technology effectively.',
                    story: 'Logistics Company',
                    result: '25% reduction in delivery times',
                    color: 'pink'
                  },
                  {
                    icon: '🎓',
                    title: '3. Training Programs',
                    desc: 'We offer training sessions to empower your team with the knowledge they need to make the most of our solutions.',
                    story: 'Healthcare Provider',
                    result: 'enhancing patient interactions and overall service quality',
                    color: 'indigo'
                  }
                ].map((service, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    whileHover={{ scale: 1.02 }}
                    className="group relative p-10 bg-gradient-to-br from-purple-500/5 to-pink-500/5 backdrop-blur-sm border border-purple-500/20 rounded-3xl hover:border-purple-500/50 transition-all overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/5 group-hover:to-pink-600/5 transition-all" />
                    <div className="relative flex items-start gap-8">
                      <div className="text-6xl flex-shrink-0">{service.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-3xl font-bold mb-4">{service.title}</h3>
                        <p className="text-lg text-gray-300 mb-6 leading-relaxed">{service.desc}</p>
                        <div className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl">
                          <h4 className="font-bold text-purple-300 mb-2">Success Story: {service.story}</h4>
                          <p className="text-gray-300">
                            Our solution helped them achieve <strong className="text-white">{service.result}</strong>.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* AI Training - Featured Section */}
        <section id="training" className="relative py-32 px-6 lg:px-8 bg-gradient-to-br from-purple-900/30 via-black to-pink-900/30">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="max-w-5xl mx-auto relative">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-center mb-16">
                <div className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full mb-8">
                  <span className="text-sm font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    🎤 FEATURED PROGRAM
                  </span>
                </div>
                <h2 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                    Unlock Your Voice
                  </span>
                  <br />
                  Join Our Affiliate AI Content Training Program!
                </h2>
                <p className="text-xl text-gray-300 mb-4">
                  Are you ready to amplify your message, build your influence, and master the new frontier of digital content creation?
                </p>
                <p className="text-lg text-gray-400">
                  The <strong className="text-white">iShareHow Labs & Rise With Jamel</strong> are thrilled to announce our exclusive program to empower you as a thought leader.
                </p>
              </div>

              <div className="mb-12 p-10 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/20 rounded-3xl">
                <h3 className="text-3xl font-bold mb-6">Why This Program? It's About Influence & Impact.</h3>
                <p className="text-lg text-gray-300 mb-6">
                  This program is for the <strong className="text-white">future content creators of the digital age</strong> – those who understand that true impact comes from clear communication, strategic influence, and deep audience connection.
                </p>

                <h4 className="text-2xl font-bold mb-6 text-purple-300">Imagine using AI to:</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    'Explain complex cybersecurity concepts with crystal clarity',
                    'Articulate principles of decentralized living and self-sovereignty',
                    'Share the wisdom of bushcraft and nature-based resilience',
                    'Craft narratives exploring consciousness, energy, and aura',
                    'Build your empire with strategies we use ourselves'
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-3 p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl hover:bg-purple-500/10 transition"
                    >
                      <span className="text-purple-400 text-2xl">✓</span>
                      <span className="text-gray-300">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {[
                  { title: 'Generate High-Quality Content', desc: 'Master AI prompting for articles, social media, and scripts' },
                  { title: 'Develop Your Unique Voice', desc: 'Enhance your personal brand authentically' },
                  { title: 'Build an Affiliate Empire', desc: 'Monetize your AI-powered content effectively' },
                  { title: 'Master Content Strategy', desc: 'Attract and convert your ideal audience' },
                  { title: 'Ethical AI Use', desc: 'Ensure authenticity and integrity' },
                  { title: 'Amplify Your Message', desc: 'Transform passion into influence' }
                ].map((skill, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl hover:border-purple-500/40 transition"
                  >
                    <h4 className="text-lg font-bold mb-3 text-purple-300">{skill.title}</h4>
                    <p className="text-sm text-gray-400">{skill.desc}</p>
                  </motion.div>
                ))}
              </div>

              <div className="text-center">
                <Link href="/prospecting?tier=3" 
                      className="inline-block group relative px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-xl overflow-hidden transition-all hover:scale-105 shadow-2xl shadow-purple-500/50">
                  <span className="relative z-10">
                    Join the AI Content Training Program
                    <div className="text-sm font-normal mt-1 opacity-90">Start with Tier 3 Membership</div>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Join Us Section */}
        <section className="relative py-32 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                Join Us in this New Chapter
              </h2>
              <p className="text-xl text-gray-300 mb-12">
                As we transition to <strong className="text-white">iShareHow Studios and Ventures</strong>, we invite you to embark on this journey with us.
              </p>

              <div className="p-10 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/20 rounded-3xl mb-12">
                <h3 className="text-3xl font-bold mb-4">Our Commitment to You</h3>
                <p className="text-lg text-gray-300">
                  We're committed to helping you <strong className="text-purple-400">unlock your business's full potential</strong>. Let's harness technology for your success.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/prospecting" className="px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-purple-500/50">
                  Become a Client
                </Link>
                <a href="mailto:contact@isharehowlabs.com" className="px-10 py-5 bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-full font-bold text-lg hover:bg-white/10 transition">
                  Contact Us Directly
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative py-12 px-6 lg:px-8 border-t border-white/10">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-gray-400 mb-2">© 2024 iShareHow Studios & Ventures. All rights reserved.</p>
            <p className="text-gray-500 text-sm">
              Core operations: <a href="http://isharehowlabs.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition">isharehowlabs.com</a>
            </p>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </>
  );
};

export default CreativeServicesPage;

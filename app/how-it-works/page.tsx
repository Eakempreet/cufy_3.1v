'use client'

import { motion } from 'framer-motion'
import { Heart, Users, MessageCircle, Crown, Shield, Sparkles, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const steps = [
  {
    step: 1,
    title: 'Create Your Profile',
    description: 'Sign up with your college email and create an authentic profile that showcases your personality, interests, and what you\'re looking for.',
    icon: Users,
    features: ['College verification', 'Photo uploads', 'Interest matching', 'Bio creation']
  },
  {
    step: 2,
    title: 'Get Matched',
    description: 'Our smart algorithm matches you with compatible students from your college and nearby institutions based on shared interests and preferences.',
    icon: Heart,
    features: ['Smart matching', 'Local connections', 'Interest compatibility', 'Study partner matching']
  },
  {
    step: 3,
    title: 'Start Conversations',
    description: 'Connect with your matches through our secure messaging platform and build meaningful relationships at your own pace.',
    icon: MessageCircle,
    features: ['Secure messaging', 'Photo sharing', 'Video calls', 'Study groups']
  },
  {
    step: 4,
    title: 'Meet & Connect',
    description: 'Take your connections offline with campus meetups, study sessions, or casual coffee dates. Build lasting relationships.',
    icon: Sparkles,
    features: ['Campus events', 'Study sessions', 'Group activities', 'Long-term relationships']
  }
]

const features = [
  {
    title: 'College-Verified Profiles',
    description: 'Every user is verified with their college email to ensure authentic connections within the student community.',
    icon: Shield
  },
  {
    title: 'Smart Compatibility Matching',
    description: 'Our advanced algorithm considers your interests, study habits, and relationship goals for better matches.',
    icon: Sparkles
  },
  {
    title: 'Safe & Secure Platform',
    description: 'Your privacy and safety are our top priority with encrypted messaging and verified user base.',
    icon: Crown
  }
]

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10"></div>
        
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold font-poppins mb-6">
              How <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text">Cufy Works</span>
            </h1>
            <p className="text-xl text-white/70 mb-8">
              Your journey to finding meaningful college connections starts here. 
              Follow these simple steps to discover your perfect study partner, best friend, or soulmate.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="space-y-20">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}
              >
                {/* Content */}
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-xl font-bold">
                      {step.step}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold">{step.title}</h2>
                  </div>
                  
                  <p className="text-lg text-white/70 leading-relaxed">
                    {step.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {step.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <span className="text-sm text-white/80">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Icon */}
                <div className="flex-1 flex justify-center">
                  <div className="w-64 h-64 rounded-3xl bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center backdrop-blur-xl">
                    <step.icon className="h-24 w-24 text-white/80" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white/5">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Why Choose <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text">Cufy</span>?
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Built specifically for college students with features that matter for campus life and relationships.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 text-center hover:bg-white/10 transition-all duration-300"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 border border-white/10 rounded-3xl p-12 backdrop-blur-xl"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Start Your <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text">Love Story</span>?
            </h2>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Join thousands of college students who have found meaningful connections on Cufy.
            </p>
            <Link href="/gender-selection">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-2xl shadow-pink-500/25 flex items-center gap-2 mx-auto"
              >
                Get Started Now
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

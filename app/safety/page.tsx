'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, Eye, UserCheck, AlertTriangle, Heart, CheckCircle, MessageSquare } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const safetyFeatures = [
  {
    title: 'College Email Verification',
    description: 'Every user must verify their identity with a valid college email address to ensure authentic student connections.',
    icon: UserCheck,
    color: 'from-green-500 to-green-600'
  },
  {
    title: 'Secure Messaging',
    description: 'All conversations are encrypted end-to-end to protect your privacy and personal information.',
    icon: Lock,
    color: 'from-blue-500 to-blue-600'
  },
  {
    title: 'Photo Verification',
    description: 'Profile photos are manually reviewed to prevent fake accounts and ensure genuine user profiles.',
    icon: Eye,
    color: 'from-purple-500 to-purple-600'
  },
  {
    title: 'Report & Block System',
    description: 'Easily report inappropriate behavior or block users who make you uncomfortable.',
    icon: AlertTriangle,
    color: 'from-red-500 to-red-600'
  },
  {
    title: 'Privacy Controls',
    description: 'Complete control over who can see your profile and personal information.',
    icon: Shield,
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    title: '24/7 Support',
    description: 'Our dedicated safety team is available around the clock to address any concerns.',
    icon: MessageSquare,
    color: 'from-pink-500 to-pink-600'
  }
]

const safetyTips = [
  {
    title: 'Meet in Public Places',
    description: 'Always choose public locations like campus cafeterias, libraries, or coffee shops for your first meetings.',
    icon: '🏫'
  },
  {
    title: 'Tell a Friend',
    description: 'Let a friend or roommate know where you&apos;re going and who you&apos;re meeting before any date.',
    icon: '👥'
  },
  {
    title: 'Trust Your Instincts',
    description: 'If something feels off, trust your gut feeling and don&apos;t hesitate to leave or end the conversation.',
    icon: '🧠'
  },
  {
    title: 'Video Chat First',
    description: 'Consider having a video call before meeting in person to verify identity and build comfort.',
    icon: '📹'
  },
  {
    title: 'Keep Personal Info Private',
    description: 'Don&apos;t share your home address, phone number, or financial information until you build trust.',
    icon: '🔒'
  },
  {
    title: 'Report Suspicious Behavior',
    description: 'If someone asks for money, seems fake, or makes you uncomfortable, report them immediately.',
    icon: '🚨'
  }
]

const guidelines = [
  'Be respectful and kind to all members of the community',
  'Use recent, authentic photos that clearly show your face',
  'Be honest about your age, college, and intentions',
  'Respect others&apos; boundaries and consent',
  'No harassment, bullying, or inappropriate content',
  'No solicitation, spam, or commercial activities',
  'Report any violations of community guidelines',
  'Maintain appropriate conversation topics'
]

export default function Safety() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-blue-500/10 to-purple-500/10"></div>
        
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-xl bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-poppins mb-6">
              Your <span className="bg-gradient-to-r from-green-500 to-blue-600 text-transparent bg-clip-text">Safety</span> is Our Priority
            </h1>
            <p className="text-xl text-white/70 mb-8">
              We&apos;ve built Cufy with comprehensive safety features to ensure you can focus on making genuine connections 
              in a secure and trusted environment.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Safety Features */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Built-in <span className="bg-gradient-to-r from-green-500 to-blue-600 text-transparent bg-clip-text">Safety Features</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Multiple layers of protection to keep you safe while you connect with fellow students.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {safetyFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
              >
                <div className={`w-12 h-12 mb-4 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Tips */}
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
              Dating <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text">Safety Tips</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Essential guidelines to help you stay safe while meeting new people and building relationships.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {safetyTips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{tip.icon}</div>
                <h3 className="text-xl font-bold mb-3">{tip.title}</h3>
                <p className="text-white/70">{tip.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Guidelines */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Community <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-transparent bg-clip-text">Guidelines</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Our community standards help create a respectful and safe environment for everyone.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8">
              <div className="grid md:grid-cols-2 gap-4">
                {guidelines.map((guideline, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-white/80">{guideline}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-pink-500/10 border border-white/10 rounded-3xl p-12 backdrop-blur-xl"
          >
            <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Need Help? We&apos;re Here for You
            </h2>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              If you experience any safety concerns, harassment, or inappropriate behavior, 
              please contact our safety team immediately.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="mailto:safety@cufy.in"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-2xl shadow-red-500/25 flex items-center gap-2 justify-center"
              >
                <MessageSquare className="h-5 w-5" />
                Report an Issue
              </motion.a>
              <motion.a
                href="mailto:support@cufy.in"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border border-white/20 hover:bg-white/10 text-white px-8 py-4 rounded-xl text-lg font-semibold flex items-center gap-2 justify-center transition-all duration-300"
              >
                <Heart className="h-5 w-5" />
                General Support
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

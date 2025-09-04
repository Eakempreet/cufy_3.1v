'use client'

import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, User, Heart, Headphones } from 'lucide-react'
import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const contactMethods = [
  {
    title: 'Email Support',
    description: 'Send us a detailed message and we&apos;ll get back to you',
    icon: Mail,
    contact: 'support@cufy.in',
    response: 'Response within 4 hours',
    color: 'from-blue-500 to-blue-600',
    action: 'Send Email'
  },
  {
    title: 'Live Chat',
    description: 'Get instant help from our support team',
    icon: MessageSquare,
    contact: 'Available 24/7',
    response: 'Instant response',
    color: 'from-green-500 to-green-600',
    action: 'Start Chat'
  },
  {
    title: 'Phone Support',
    description: 'Speak directly with our team for urgent matters',
    icon: Phone,
    contact: '+91-800-CUFY-HELP',
    response: 'Mon-Fri, 9 AM - 6 PM IST',
    color: 'from-purple-500 to-purple-600',
    action: 'Call Now'
  }
]

const officeLocations = [
  {
    city: 'New Delhi',
    address: 'Connaught Place, New Delhi, Delhi 110001',
    type: 'Headquarters',
    icon: '🏢'
  },
  {
    city: 'Mumbai',
    address: 'Bandra West, Mumbai, Maharashtra 400050',
    type: 'Regional Office',
    icon: '🌆'
  },
  {
    city: 'Bangalore',
    address: 'Koramangala, Bangalore, Karnataka 560034',
    type: 'Tech Hub',
    icon: '💻'
  }
]

const supportTeam = [
  {
    name: 'Customer Support',
    description: 'General questions, account help, and platform guidance',
    email: 'support@cufy.in',
    icon: Headphones
  },
  {
    name: 'Safety Team',
    description: 'Report safety concerns, inappropriate behavior, or harassment',
    email: 'safety@cufy.in',
    icon: MessageSquare
  },
  {
    name: 'Partnership',
    description: 'College partnerships, events, and collaboration opportunities',
    email: 'partnerships@cufy.in',
    icon: User
  }
]

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
        
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <MessageSquare className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-poppins mb-6">
              Get in <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">Touch</span>
            </h1>
            <p className="text-xl text-white/70 mb-8">
              Have a question, need support, or want to share feedback? We&apos;re here to help! 
              Our team is dedicated to making your Cufy experience amazing.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {contactMethods.map((method, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 transition-all duration-300 group"
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r ${method.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <method.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{method.title}</h3>
                <p className="text-white/70 mb-4 text-sm">{method.description}</p>
                <div className="space-y-2 mb-6">
                  <div className="text-white font-semibold">{method.contact}</div>
                  <div className="flex items-center justify-center gap-1 text-sm text-white/60">
                    <Clock className="h-4 w-4" />
                    {method.response}
                  </div>
                </div>
                <button className={`w-full bg-gradient-to-r ${method.color} hover:opacity-90 text-white py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2`}>
                  {method.action}
                  <Send className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 px-6 bg-white/5">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6">
                Send us a <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">Message</span>
              </h2>
              <p className="text-white/70 mb-8">
                Fill out the form below and we&apos;ll get back to you as soon as possible.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                      placeholder="your.email@college.edu"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                      placeholder="Brief subject line"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-400"
                    >
                      <option value="">Select a category</option>
                      <option value="account">Account Issues</option>
                      <option value="technical">Technical Support</option>
                      <option value="safety">Safety Concerns</option>
                      <option value="feedback">Feedback</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400 resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 rounded-xl text-lg font-semibold shadow-2xl shadow-blue-500/25 flex items-center justify-center gap-2"
                >
                  <Send className="h-5 w-5" />
                  Send Message
                </motion.button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* Support Teams */}
              <div>
                <h3 className="text-2xl font-bold mb-6">Our Support Teams</h3>
                <div className="space-y-4">
                  {supportTeam.map((team, index) => (
                    <div
                      key={index}
                      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <team.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white mb-1">{team.name}</h4>
                          <p className="text-white/70 text-sm mb-2">{team.description}</p>
                          <a
                            href={`mailto:${team.email}`}
                            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-300"
                          >
                            {team.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Office Locations */}
              <div>
                <h3 className="text-2xl font-bold mb-6">Our Offices</h3>
                <div className="space-y-4">
                  {officeLocations.map((office, index) => (
                    <div
                      key={index}
                      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-2xl">{office.icon}</div>
                        <div>
                          <h4 className="font-semibold text-white mb-1">{office.city}</h4>
                          <div className="text-sm text-blue-400 mb-1">{office.type}</div>
                          <div className="flex items-start gap-2 text-white/70 text-sm">
                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            {office.address}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Link */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-white/10 rounded-3xl p-12 backdrop-blur-xl"
          >
            <Heart className="h-16 w-16 text-pink-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Looking for Quick <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">Answers</span>?
            </h2>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Check out our comprehensive FAQ section for instant answers to common questions about Cufy.
            </p>
            <motion.a
              href="/help-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-2xl shadow-blue-500/25"
            >
              Visit Help Center
              <Send className="h-5 w-5" />
            </motion.a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

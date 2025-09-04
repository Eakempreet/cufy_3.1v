'use client'

import { motion } from 'framer-motion'
import { Search, MessageSquare, Book, Phone, Mail, Clock, ChevronRight, HelpCircle, Users, Shield, Heart } from 'lucide-react'
import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const faqCategories = [
  {
    title: 'Getting Started',
    icon: Users,
    questions: [
      {
        question: 'How do I create my Cufy profile?',
        answer: 'Sign up with your college email, verify your account, upload photos, and complete your profile with your interests, bio, and preferences. Make sure to use recent, clear photos for the best experience.'
      },
      {
        question: 'Is Cufy only for college students?',
        answer: 'Yes! Cufy is exclusively designed for college students. You need a valid college email address to verify your account and join our community.'
      },
      {
        question: 'How does the matching system work?',
        answer: 'Our smart algorithm considers your interests, preferences, location, and compatibility factors to suggest potential matches from your college and nearby institutions.'
      },
      {
        question: 'Can I change my profile information later?',
        answer: 'Absolutely! You can edit your profile, update photos, and modify your preferences anytime from your profile settings.'
      }
    ]
  },
  {
    title: 'Safety & Security',
    icon: Shield,
    questions: [
      {
        question: 'How does Cufy verify college students?',
        answer: 'We require verification through your official college email address. This ensures that all users are genuine college students and creates a trusted community.'
      },
      {
        question: 'How do I report inappropriate behavior?',
        answer: 'You can report any user by tapping the three dots on their profile and selecting "Report". Our safety team reviews all reports within 24 hours.'
      },
      {
        question: 'Is my personal information safe?',
        answer: 'Yes! We use end-to-end encryption for messages and never share your personal information with third parties. Your privacy is our top priority.'
      },
      {
        question: 'How do I block someone?',
        answer: 'Go to the user&apos;s profile, tap the three dots, and select "Block". Blocked users cannot see your profile or contact you.'
      }
    ]
  },
  {
    title: 'Matches & Messaging',
    icon: Heart,
    questions: [
      {
        question: 'How do I know if someone likes me?',
        answer: 'When someone likes your profile, you&apos;ll receive a notification. If you like them back, it becomes a match and you can start messaging!'
      },
      {
        question: 'Can I undo a like or pass?',
        answer: 'Currently, you cannot undo likes or passes. This encourages thoughtful decision-making when reviewing profiles.'
      },
      {
        question: 'Why can&apos;t I see my messages?',
        answer: 'Messages are only visible after both users have liked each other (creating a match). This ensures mutual interest before conversations begin.'
      },
      {
        question: 'How do I start a good conversation?',
        answer: 'Reference something from their profile - a shared interest, hobby, or photo. Ask open-ended questions and be genuine in your approach.'
      }
    ]
  },
  {
    title: 'Account & Subscription',
    icon: MessageSquare,
    questions: [
      {
        question: 'What are the different subscription plans?',
        answer: 'We offer Starter (₹99), Premium (₹249), and Ultimate (₹499) plans with varying numbers of matches and features. Check our pricing page for details.'
      },
      {
        question: 'How do I cancel my subscription?',
        answer: 'Contact our support team at support@cufy.in to cancel your subscription. We&apos;ll process your request within 24 hours.'
      },
      {
        question: 'Can I get a refund?',
        answer: 'Refunds are considered on a case-by-case basis. Please contact our support team with your request and reason for the refund.'
      },
      {
        question: 'How do I delete my account?',
        answer: 'Go to Settings > Account > Delete Account. This action is permanent and cannot be undone. All your data will be permanently removed.'
      }
    ]
  }
]

const contactOptions = [
  {
    title: 'Live Chat',
    description: 'Get instant help from our support team',
    icon: MessageSquare,
    action: 'Start Chat',
    available: 'Available 24/7',
    color: 'from-blue-500 to-blue-600'
  },
  {
    title: 'Email Support',
    description: 'Send us a detailed message',
    icon: Mail,
    action: 'Send Email',
    available: 'Response within 4 hours',
    color: 'from-green-500 to-green-600'
  },
  {
    title: 'Phone Support',
    description: 'Speak directly with our team',
    icon: Phone,
    action: 'Call Now',
    available: 'Mon-Fri, 9 AM - 6 PM',
    color: 'from-purple-500 to-purple-600'
  }
]

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(0)
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null)

  const filteredQuestions = faqCategories[selectedCategory].questions.filter(
    q => q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
         q.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
              <HelpCircle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-poppins mb-6">
              How Can We <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">Help You</span>?
            </h1>
            <p className="text-xl text-white/70 mb-8">
              Find answers to common questions, get support, and learn how to make the most of your Cufy experience.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
              <input
                type="text"
                placeholder="Search for help articles, features, or questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400 backdrop-blur-xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Contact Options */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {contactOptions.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 transition-all duration-300"
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r ${option.color} flex items-center justify-center`}>
                  <option.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{option.title}</h3>
                <p className="text-white/70 mb-4">{option.description}</p>
                <div className="flex items-center justify-center gap-1 text-sm text-white/60 mb-4">
                  <Clock className="h-4 w-4" />
                  {option.available}
                </div>
                <button className={`w-full bg-gradient-to-r ${option.color} hover:opacity-90 text-white py-3 rounded-lg font-semibold transition-all duration-300`}>
                  {option.action}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6 bg-white/5">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Frequently Asked <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">Questions</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Quick answers to the most common questions about using Cufy.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Category Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4">Categories</h3>
                <div className="space-y-2">
                  {faqCategories.map((category, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedCategory(index)}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-300 flex items-center gap-3 ${
                        selectedCategory === index
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <category.icon className="h-5 w-5" />
                      <span>{category.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="lg:col-span-3">
              <div className="space-y-4">
                {filteredQuestions.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-all duration-300"
                    >
                      <span className="font-semibold text-white">{faq.question}</span>
                      <ChevronRight className={`h-5 w-5 text-white/60 transition-transform duration-300 ${
                        expandedQuestion === index ? 'rotate-90' : ''
                      }`} />
                    </button>
                    {expandedQuestion === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-white/10 p-6 pt-4"
                      >
                        <p className="text-white/70 leading-relaxed">{faq.answer}</p>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>

              {filteredQuestions.length === 0 && (
                <div className="text-center py-12">
                  <Book className="h-16 w-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60">No questions found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-white/10 rounded-3xl p-12 backdrop-blur-xl"
          >
            <MessageSquare className="h-16 w-16 text-blue-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Still Need <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">Help</span>?
            </h2>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Can&apos;t find what you&apos;re looking for? Our friendly support team is here to help you with any questions or issues.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-2xl shadow-blue-500/25 flex items-center gap-2 justify-center">
                <MessageSquare className="h-5 w-5" />
                Contact Support
              </button>
              <button className="border border-white/20 hover:bg-white/10 text-white px-8 py-4 rounded-xl text-lg font-semibold flex items-center gap-2 justify-center transition-all duration-300">
                <Book className="h-5 w-5" />
                Browse Articles
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

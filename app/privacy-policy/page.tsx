'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Database, Users, MessageSquare, Calendar } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const lastUpdated = 'November 20, 2024'

const sections = [
  {
    title: 'Information We Collect',
    icon: Database,
    content: [
      {
        subtitle: 'Account Information',
        items: [
          'College email address for verification',
          'Name, age, and basic profile information',
          'Photos you choose to upload',
          'Bio and interests you provide',
          'Location and college information'
        ]
      },
      {
        subtitle: 'Usage Information',
        items: [
          'App usage patterns and features used',
          'Messages sent and received (encrypted)',
          'Matches and likes you give/receive',
          'Device information and IP address',
          'Log data and crash reports'
        ]
      },
      {
        subtitle: 'Optional Information',
        items: [
          'Social media profiles you choose to link',
          'Additional photos and verification images',
          'Preferences and dating criteria',
          'Feedback and survey responses'
        ]
      }
    ]
  },
  {
    title: 'How We Use Your Information',
    icon: Users,
    content: [
      {
        subtitle: 'Core Services',
        items: [
          'Create and maintain your profile',
          'Match you with compatible users',
          'Enable messaging and communication',
          'Verify college student status',
          'Provide customer support'
        ]
      },
      {
        subtitle: 'Safety & Security',
        items: [
          'Detect and prevent fraud or abuse',
          'Enforce our community guidelines',
          'Investigate safety reports',
          'Maintain platform security',
          'Age and identity verification'
        ]
      },
      {
        subtitle: 'Improvements',
        items: [
          'Analyze usage to improve features',
          'Personalize your experience',
          'Develop new services and features',
          'Conduct research and analytics',
          'Test new functionalities'
        ]
      }
    ]
  },
  {
    title: 'Information Sharing',
    icon: Eye,
    content: [
      {
        subtitle: 'What We Share',
        items: [
          'Profile information with potential matches',
          'Public information you choose to display',
          'Messages with intended recipients only',
          'Anonymous usage data for research',
          'Legal compliance when required'
        ]
      },
      {
        subtitle: 'What We Never Share',
        items: [
          'Your personal contact information',
          'Private messages with third parties',
          'Financial or payment information',
          'Unencrypted personal data',
          'Information for marketing by others'
        ]
      },
      {
        subtitle: 'Service Providers',
        items: [
          'Cloud storage and hosting services',
          'Analytics and crash reporting tools',
          'Payment processing (if applicable)',
          'Customer support platforms',
          'Security and fraud prevention services'
        ]
      }
    ]
  },
  {
    title: 'Data Security',
    icon: Lock,
    content: [
      {
        subtitle: 'Protection Measures',
        items: [
          'End-to-end encryption for messages',
          'Secure HTTPS connections',
          'Regular security audits and updates',
          'Access controls and authentication',
          'Data backup and recovery systems'
        ]
      },
      {
        subtitle: 'Account Security',
        items: [
          'College email verification required',
          'Photo verification for authenticity',
          'Suspicious activity monitoring',
          'Account recovery procedures',
          'Regular password security checks'
        ]
      },
      {
        subtitle: 'Data Storage',
        items: [
          'Secure cloud infrastructure',
          'Geographic data localization',
          'Regular data backups',
          'Retention period limits',
          'Secure deletion procedures'
        ]
      }
    ]
  },
  {
    title: 'Your Rights and Choices',
    icon: Shield,
    content: [
      {
        subtitle: 'Privacy Controls',
        items: [
          'Control who can see your profile',
          'Manage photo visibility settings',
          'Block or report other users',
          'Control location sharing',
          'Manage notification preferences'
        ]
      },
      {
        subtitle: 'Data Rights',
        items: [
          'Access your personal data',
          'Correct inaccurate information',
          'Delete your account and data',
          'Download your data',
          'Restrict data processing'
        ]
      },
      {
        subtitle: 'Communication Preferences',
        items: [
          'Opt out of marketing emails',
          'Control push notifications',
          'Manage match notifications',
          'Set message preferences',
          'Choose communication channels'
        ]
      }
    ]
  }
]

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-green-500/10"></div>
        
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-xl bg-gradient-to-r from-blue-500 to-green-600 flex items-center justify-center">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-poppins mb-6">
              Privacy <span className="bg-gradient-to-r from-blue-500 to-green-600 text-transparent bg-clip-text">Policy</span>
            </h1>
            <p className="text-xl text-white/70 mb-8">
              Your privacy is fundamental to everything we do. Learn how we collect, use, 
              and protect your personal information on Cufy.
            </p>
            <div className="flex items-center justify-center gap-2 text-white/60">
              <Calendar className="h-4 w-4" />
              <span>Last updated: {lastUpdated}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 mb-12"
          >
            <h2 className="text-2xl font-bold mb-4">Our Commitment to Your Privacy</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              At Cufy, we understand that privacy is personal. As a platform designed exclusively for college students, 
              we take extra care to protect your information and maintain the trust you place in us.
            </p>
            <p className="text-white/70 leading-relaxed mb-4">
              This Privacy Policy explains how we collect, use, share, and protect your personal information when you use 
              our dating platform. By using Cufy, you agree to the practices described in this policy.
            </p>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-400 font-semibold mb-2">
                <MessageSquare className="h-5 w-5" />
                Quick Summary
              </div>
              <ul className="text-white/80 text-sm space-y-1">
                <li>• We only collect information necessary to provide our services</li>
                <li>• Your messages are encrypted and private</li>
                <li>• We never sell your personal information</li>
                <li>• You have full control over your data and privacy settings</li>
                <li>• College verification ensures a safe, student-only community</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Sections */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-12">
            {sections.map((section, sectionIndex) => (
              <motion.div
                key={sectionIndex}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: sectionIndex * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-green-600 flex items-center justify-center">
                    <section.icon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold">{section.title}</h2>
                </div>

                <div className="space-y-6">
                  {section.content.map((subsection, subIndex) => (
                    <div key={subIndex}>
                      <h3 className="text-lg font-semibold mb-3 text-blue-400">
                        {subsection.subtitle}
                      </h3>
                      <ul className="space-y-2">
                        {subsection.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-white/80">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6 bg-white/5">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-6">
              Questions About Your <span className="bg-gradient-to-r from-blue-500 to-green-600 text-transparent bg-clip-text">Privacy</span>?
            </h2>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              If you have any questions about this Privacy Policy or how we handle your data, 
              we&apos;re here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/contact-us"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-500 to-green-600 hover:from-blue-600 hover:to-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-2xl shadow-blue-500/25 flex items-center gap-2 justify-center"
              >
                <MessageSquare className="h-5 w-5" />
                Contact Privacy Team
              </motion.a>
              <motion.a
                href="mailto:privacy@cufy.in"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border border-white/20 hover:bg-white/10 text-white px-8 py-4 rounded-xl text-lg font-semibold flex items-center gap-2 justify-center transition-all duration-300"
              >
                <Shield className="h-5 w-5" />
                privacy@cufy.in
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-white/10 rounded-xl p-8"
          >
            <h3 className="text-xl font-bold mb-4">Important Information</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-white/80">
              <div>
                <h4 className="font-semibold text-white mb-2">Policy Updates</h4>
                <p>
                  We may update this Privacy Policy from time to time. We&apos;ll notify you of any 
                  significant changes through the app or email.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Age Requirement</h4>
                <p>
                  Cufy is only available to users who are 18 years or older and currently 
                  enrolled in college.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">International Users</h4>
                <p>
                  If you use Cufy from outside India, your information may be transferred 
                  to and processed in India.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Third-Party Links</h4>
                <p>
                  Our app may contain links to third-party websites. This Privacy Policy 
                  does not apply to those sites.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

'use client'

import { motion } from 'framer-motion'
import { FileText, Scale, Shield, Users, AlertTriangle, Heart, Calendar, CheckCircle } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const lastUpdated = 'November 20, 2024'

const termsData = [
  {
    title: 'Eligibility and Account Requirements',
    icon: Users,
    content: [
      'Must be 18 years of age or older',
      'Must be currently enrolled in a recognized college or university',
      'Must verify account with valid college email address',
      'Must provide accurate and truthful information',
      'One account per person - multiple accounts are prohibited',
      'Must comply with all applicable laws and regulations'
    ]
  },
  {
    title: 'Acceptable Use',
    icon: CheckCircle,
    content: [
      'Use the platform for legitimate dating and social connections',
      'Treat all users with respect and kindness',
      'Upload only authentic, recent photos of yourself',
      'Keep conversations appropriate and respectful',
      'Respect others\' boundaries and consent',
      'Report any violations of community guidelines'
    ]
  },
  {
    title: 'Prohibited Activities',
    icon: AlertTriangle,
    content: [
      'Harassment, bullying, or threatening behavior',
      'Uploading fake, misleading, or inappropriate photos',
      'Soliciting money or financial information',
      'Promoting commercial activities or spam',
      'Sharing explicit or adult content',
      'Impersonating another person or creating fake profiles',
      'Using the platform for illegal activities',
      'Attempting to bypass safety or security measures'
    ]
  },
  {
    title: 'Content and Privacy',
    icon: Shield,
    content: [
      'You own the content you upload to Cufy',
      'Grant Cufy license to display your content to other users',
      'Messages are private and encrypted between users',
      'Do not share personal contact information publicly',
      'Report inappropriate content or behavior immediately',
      'Cufy reserves right to remove content violating guidelines'
    ]
  },
  {
    title: 'Safety and Security',
    icon: Heart,
    content: [
      'Meet in public places for first dates',
      'Inform friends or family about your plans',
      'Trust your instincts if something feels wrong',
      'Never send money or share financial information',
      'Report suspicious behavior immediately',
      'Use platform messaging until you feel comfortable'
    ]
  },
  {
    title: 'Account Termination',
    icon: Scale,
    content: [
      'Cufy may suspend or terminate accounts for violations',
      'Users may delete their accounts at any time',
      'Terminated users cannot create new accounts',
      'No refunds for paid subscriptions upon termination',
      'Content may be retained for safety and legal purposes',
      'Appeal process available for wrongful terminations'
    ]
  }
]

const subscriptionTerms = [
  'Subscriptions automatically renew unless cancelled',
  'Cancellations take effect at the end of current period',
  'No refunds for partial subscription periods',
  'Prices may change with 30 days notice',
  'Premium features only available during active subscription',
  'Subscription benefits are non-transferable'
]

const legalDisclaimer = [
  'Cufy provides platform services "as is" without warranties',
  'Users are responsible for their own safety and decisions',
  'Cufy is not liable for user interactions or meetings',
  'Platform availability may vary due to maintenance',
  'Governing law is jurisdiction of India',
  'Disputes resolved through arbitration when possible'
]

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-indigo-500/10"></div>
        
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
              <FileText className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-poppins mb-6">
              Terms of <span className="bg-gradient-to-r from-purple-500 to-indigo-600 text-transparent bg-clip-text">Service</span>
            </h1>
            <p className="text-xl text-white/70 mb-8">
              These terms govern your use of Cufy. By using our platform, you agree to follow these guidelines 
              and help us maintain a safe, respectful community for all college students.
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
            <h2 className="text-2xl font-bold mb-4">Welcome to Cufy</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              Cufy is a dating platform exclusively designed for college students across India. 
              Our mission is to help you build meaningful connections, find study partners, and potentially 
              discover lasting relationships within the college community.
            </p>
            <p className="text-white/70 leading-relaxed mb-4">
              By using Cufy, you enter into a contract with us and agree to these Terms of Service. 
              Please read them carefully, as they outline your rights and responsibilities as a member of our community.
            </p>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-purple-400 font-semibold mb-2">
                <Heart className="h-5 w-5" />
                Our Community Promise
              </div>
              <p className="text-white/80 text-sm">
                We&apos;re committed to creating a safe, inclusive, and respectful environment where college students 
                can connect authentically. These terms help us maintain the quality and safety standards that 
                make Cufy a trusted platform for student relationships.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Terms Sections */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-8">
            {termsData.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                    <section.icon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold">{section.title}</h2>
                </div>
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-white/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Terms */}
      <section className="py-16 px-6 bg-white/5">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
                <Scale className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Subscription and Payment Terms</h2>
            </div>
            <ul className="space-y-3">
              {subscriptionTerms.map((term, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-white/80">{term}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Legal Disclaimer */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Legal Disclaimers and Limitations</h2>
            </div>
            <ul className="space-y-3">
              {legalDisclaimer.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-white/80">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Contact and Changes */}
      <section className="py-20 px-6 bg-white/5">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold mb-4">Changes to Terms</h3>
              <p className="text-white/70 mb-4">
                We may update these Terms of Service from time to time to reflect changes in our services 
                or legal requirements.
              </p>
              <ul className="space-y-2 text-sm text-white/80">
                <li>• Users will be notified of significant changes</li>
                <li>• Continued use constitutes acceptance</li>
                <li>• Previous versions available upon request</li>
                <li>• Major changes require explicit consent</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold mb-4">Contact Information</h3>
              <p className="text-white/70 mb-4">
                If you have questions about these Terms of Service or need to report a violation, 
                please contact us.
              </p>
              <div className="space-y-2 text-sm">
                <div className="text-white/80">📧 legal@cufy.in</div>
                <div className="text-white/80">📧 support@cufy.in</div>
                <div className="text-white/80">📱 +91-800-CUFY-HELP</div>
                <div className="text-white/80">🏢 New Delhi, India</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Agreement Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-indigo-500/10 border border-white/10 rounded-3xl p-12 backdrop-blur-xl max-w-3xl mx-auto"
          >
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Join Our <span className="bg-gradient-to-r from-purple-500 to-indigo-600 text-transparent bg-clip-text">Community</span>?
            </h2>
            <p className="text-xl text-white/70 mb-8">
              By using Cufy, you agree to these terms and become part of a respectful, 
              safe community of college students building meaningful connections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/gender-selection"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-2xl shadow-purple-500/25 flex items-center gap-2 justify-center"
              >
                <Heart className="h-5 w-5" />
                Accept & Get Started
              </motion.a>
              <motion.a
                href="/contact-us"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border border-white/20 hover:bg-white/10 text-white px-8 py-4 rounded-xl text-lg font-semibold flex items-center gap-2 justify-center transition-all duration-300"
              >
                <FileText className="h-5 w-5" />
                Have Questions?
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

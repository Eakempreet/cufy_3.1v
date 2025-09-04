'use client'

import { motion } from 'framer-motion'
import { GraduationCap, Users, MapPin, Calendar, Star, Trophy, BookOpen, Heart } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const partnerColleges = [
  {
    name: 'Indian Institute of Technology Delhi',
    location: 'New Delhi',
    students: '8,500+',
    established: '1961',
    type: 'Engineering & Technology',
    logo: '🏛️',
    stats: { users: '1,200+', matches: '850+', events: 15 }
  },
  {
    name: 'Delhi University',
    location: 'New Delhi',
    students: '132,000+',
    established: '1922',
    type: 'Comprehensive University',
    logo: '📚',
    stats: { users: '3,500+', matches: '2,100+', events: 25 }
  },
  {
    name: 'Jawaharlal Nehru University',
    location: 'New Delhi',
    students: '8,400+',
    established: '1969',
    type: 'Research University',
    logo: '🔬',
    stats: { users: '950+', matches: '720+', events: 12 }
  },
  {
    name: 'Indian Institute of Science',
    location: 'Bangalore',
    students: '4,000+',
    established: '1909',
    type: 'Science & Research',
    logo: '⚗️',
    stats: { users: '680+', matches: '420+', events: 8 }
  },
  {
    name: 'University of Mumbai',
    location: 'Mumbai',
    students: '549,000+',
    established: '1857',
    type: 'State University',
    logo: '🌊',
    stats: { users: '4,200+', matches: '3,100+', events: 30 }
  },
  {
    name: 'Indian Institute of Technology Bombay',
    location: 'Mumbai',
    students: '10,000+',
    established: '1958',
    type: 'Engineering & Technology',
    logo: '⚙️',
    stats: { users: '1,500+', matches: '980+', events: 18 }
  },
  {
    name: 'Jamia Millia Islamia',
    location: 'New Delhi',
    students: '22,000+',
    established: '1920',
    type: 'Central University',
    logo: '🕌',
    stats: { users: '1,100+', matches: '650+', events: 14 }
  },
  {
    name: 'Indian Institute of Technology Madras',
    location: 'Chennai',
    students: '9,500+',
    established: '1959',
    type: 'Engineering & Technology',
    logo: '🏗️',
    stats: { users: '1,300+', matches: '890+', events: 16 }
  },
  {
    name: 'Banaras Hindu University',
    location: 'Varanasi',
    students: '30,000+',
    established: '1916',
    type: 'Central University',
    logo: '🕉️',
    stats: { users: '1,800+', matches: '1,200+', events: 20 }
  }
]

const partnershipBenefits = [
  {
    title: 'Verified Student Community',
    description: 'Students from partner colleges get verified badges and priority matching within their institution.',
    icon: Star,
    color: 'from-yellow-500 to-orange-600'
  },
  {
    title: 'Campus Events Integration',
    description: 'Promote college events, festivals, and activities directly to students interested in attending.',
    icon: Calendar,
    color: 'from-blue-500 to-purple-600'
  },
  {
    title: 'Student Engagement Analytics',
    description: 'Anonymous insights into student social patterns and campus community engagement levels.',
    icon: BookOpen,
    color: 'from-green-500 to-blue-600'
  },
  {
    title: 'Safety & Support Resources',
    description: 'Dedicated support channels and safety resources specifically for your college community.',
    icon: Users,
    color: 'from-pink-500 to-red-600'
  }
]

const partnershipLevels = [
  {
    level: 'Community Partner',
    price: 'Free',
    features: [
      'College verification for students',
      'Basic analytics dashboard',
      'Community support resources',
      'Event promotion (limited)'
    ],
    popular: false
  },
  {
    level: 'Campus Partner',
    price: 'Custom',
    features: [
      'Priority verification process',
      'Enhanced analytics and insights',
      'Unlimited event promotion',
      'Dedicated support manager',
      'Custom college branding',
      'Student safety resources'
    ],
    popular: true
  },
  {
    level: 'Strategic Partner',
    price: 'Enterprise',
    features: [
      'Complete platform integration',
      'Advanced engagement analytics',
      'Co-branded experiences',
      'Research collaboration opportunities',
      'Priority feature development',
      'Executive relationship management'
    ],
    popular: false
  }
]

export default function CollegePartners() {
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
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-poppins mb-6">
              College <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">Partners</span>
            </h1>
            <p className="text-xl text-white/70 mb-8">
              We partner with leading colleges and universities across India to create safe, 
              verified communities where students can build meaningful connections.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '120+', label: 'Partner Colleges', icon: GraduationCap },
              { number: '50,000+', label: 'Verified Students', icon: Users },
              { number: '25,000+', label: 'Successful Matches', icon: Heart },
              { number: '500+', label: 'Campus Events', icon: Calendar }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text mb-2">
                  {stat.number}
                </div>
                <div className="text-white/70 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Colleges Grid */}
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
              Our <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">Partner Colleges</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Prestigious institutions across India trust Cufy to provide their students 
              with a safe and authentic dating platform.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {partnerColleges.map((college, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
              >
                {/* College Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-3xl">{college.logo}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1 leading-tight">{college.name}</h3>
                    <div className="flex items-center gap-1 text-white/60 text-sm mb-1">
                      <MapPin className="h-3 w-3" />
                      {college.location}
                    </div>
                    <div className="text-xs text-blue-400">{college.type}</div>
                  </div>
                </div>

                {/* College Info */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <div className="text-white/60">Students</div>
                    <div className="font-semibold text-white">{college.students}</div>
                  </div>
                  <div>
                    <div className="text-white/60">Established</div>
                    <div className="font-semibold text-white">{college.established}</div>
                  </div>
                </div>

                {/* Cufy Stats */}
                <div className="border-t border-white/10 pt-4">
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className="font-semibold text-blue-400">{college.stats.users}</div>
                      <div className="text-white/60 text-xs">Users</div>
                    </div>
                    <div>
                      <div className="font-semibold text-pink-400">{college.stats.matches}</div>
                      <div className="text-white/60 text-xs">Matches</div>
                    </div>
                    <div>
                      <div className="font-semibold text-green-400">{college.stats.events}</div>
                      <div className="text-white/60 text-xs">Events</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Benefits */}
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
              Partnership <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">Benefits</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Discover how partnering with Cufy can enhance your campus community and student engagement.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {partnershipBenefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-all duration-300"
              >
                <div className={`w-16 h-16 mb-6 rounded-xl bg-gradient-to-r ${benefit.color} flex items-center justify-center`}>
                  <benefit.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">{benefit.title}</h3>
                <p className="text-white/70">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Levels */}
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
              Partnership <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">Levels</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Choose the partnership level that best fits your institution&apos;s needs and goals.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {partnershipLevels.map((level, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`bg-white/5 backdrop-blur-xl border rounded-xl p-8 relative ${
                  level.popular 
                    ? 'border-blue-500 bg-blue-500/5' 
                    : 'border-white/10 hover:bg-white/10'
                } transition-all duration-300`}
              >
                {level.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{level.level}</h3>
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text mb-4">
                    {level.price}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {level.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-white/80 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                  level.popular
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                    : 'border border-white/20 hover:bg-white/10 text-white'
                }`}>
                  Get Started
                </button>
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
            className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-white/10 rounded-3xl p-12 backdrop-blur-xl"
          >
            <GraduationCap className="h-16 w-16 text-blue-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">Partner</span> with Us?
            </h2>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Join leading colleges across India in providing students with a safe, 
              authentic platform for building meaningful connections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/contact-us"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-2xl shadow-blue-500/25 flex items-center gap-2 justify-center"
              >
                <Users className="h-5 w-5" />
                Start Partnership
              </motion.a>
              <motion.a
                href="mailto:partnerships@cufy.in"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border border-white/20 hover:bg-white/10 text-white px-8 py-4 rounded-xl text-lg font-semibold flex items-center gap-2 justify-center transition-all duration-300"
              >
                <BookOpen className="h-5 w-5" />
                Learn More
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

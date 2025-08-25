'use client'

import { motion } from 'framer-motion'
import { Button } from './ui/Button'
import { Card, CardContent } from './ui/Card'
import { Heart, Star, Sparkles, Crown } from 'lucide-react'
import Link from 'next/link'
import FloatingShapes from './FloatingShapes'
import Navbar from './Navbar'
import Footer from './Footer'

const pricingCards = [
  {
    price: '₹99',
    title: 'Starter',
    description: '1 match card × 2 rounds',
    features: ['2 total matches', 'Basic profile', 'Chat support'],
    gradient: 'from-primary to-primary-hover',
    icon: Heart,
  },
  {
    price: '₹249',
    title: 'Premium',
    description: '1st round = 2 options, 2nd round = 3 options',
    features: ['5 total matches', 'Premium profile', 'Priority support', 'Advanced filters'],
    gradient: 'from-secondary to-secondary-hover',
    icon: Crown,
    popular: true,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark relative">
      <FloatingShapes />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto text-center"
        >
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold font-poppins mb-6 leading-tight"
          >
            <span className="text-gradient">matches</span>{' '}
            <span className="text-white">are meant to</span>{' '}
            <span className="text-gradient">meet.</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            find genuine people, meaningful connections, and a chance to meet your perfect match.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link href="/girls-onboarding">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 glow-pink"
              >
                <Heart className="mr-2 h-5 w-5" />
                Join as Girl
              </Button>
            </Link>

            <Link href="/boys-onboarding">
              <Button 
                size="lg" 
                variant="glass"
                className="w-full sm:w-auto hover:glow"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Join as Boy
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="container mx-auto"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-poppins mb-4">
              <span className="text-gradient">Premium</span> for Boys
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Choose your perfect plan to start meaningful connections
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingCards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ 
                  scale: 1.05,
                  rotateY: 5,
                }}
                transition={{ 
                  duration: 0.6,
                  delay: index * 0.2,
                }}
                viewport={{ once: true }}
                className="relative group"
              >
                <Card className={`relative overflow-hidden ${card.popular ? 'ring-2 ring-primary glow' : ''}`}>
                  {card.popular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-secondary px-4 py-1 text-xs font-semibold rounded-bl-lg">
                      POPULAR
                    </div>
                  )}

                  <CardContent className="p-8">
                    <div className="flex items-center justify-center mb-6">
                      <card.icon className={`h-12 w-12 bg-gradient-to-r ${card.gradient} text-white p-2 rounded-full`} />
                    </div>

                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {card.title}
                      </h3>
                      <div className={`text-4xl font-bold mb-2 bg-gradient-to-r ${card.gradient} text-transparent bg-clip-text`}>
                        {card.price}
                      </div>
                      <p className="text-white/70">
                        {card.description}
                      </p>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {card.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-white/80">
                          <Star className="h-4 w-4 text-primary mr-3 fill-current" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button 
                      className={`w-full bg-gradient-to-r ${card.gradient} hover:scale-105 transition-transform`}
                      size="lg"
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}
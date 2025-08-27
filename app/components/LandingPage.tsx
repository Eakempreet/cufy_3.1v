'use client'

import { motion } from 'framer-motion'
import { Button } from './ui/Button'
import { Card, CardContent } from './ui/Card'
import { Heart, Star, Sparkles, Crown } from 'lucide-react'
import Link from 'next/link'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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
  const { data: session, status } = useSession()
  const router = useRouter()

  const [isCheckingProfile, setIsCheckingProfile] = useState(false)
  const [userState, setUserState] = useState<'loading' | 'no-auth' | 'signed-in-no-profile' | 'has-profile'>('loading')

  // Handle automatic routing after login
  useEffect(() => {
    const handlePostLoginRouting = async () => {
      if (status === 'loading') return
      
      if (!session?.user?.email) {
        setUserState('no-auth')
        return
      }

      setIsCheckingProfile(true)
      try {
        // Check user status using new API with timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

        const response = await fetch('/api/auth/user', {
          signal: controller.signal
        })
        clearTimeout(timeoutId)

        if (!response.ok) {
          console.error('API response not ok:', response.status)
          setUserState('no-auth')
          return
        }

        const data = await response.json()

        if (data.exists) {
          // User exists, redirect based on type
          setUserState('has-profile')
          if (data.user.is_admin) {
            router.push('/admin')
          } else {
            router.push('/dashboard')
          }
        } else {
          // User signed in but no profile
          setUserState('signed-in-no-profile')
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.error('API request timed out')
        } else {
          console.error('Error in post-login routing:', error)
        }
        setUserState('no-auth')
      } finally {
        setIsCheckingProfile(false)
      }
    }

    handlePostLoginRouting()
  }, [session, status, router])

  const handleCompleteProfile = () => {
    // Redirect to gender selection page
    router.push('/gender-selection')
  }

  const handleJoinClick = async (gender: 'male' | 'female') => {
    if (status === 'authenticated' && session?.user?.email) {
      // User is already signed in, check if they exist in our database
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

        const response = await fetch('/api/auth/user', {
          signal: controller.signal
        })
        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()

        if (data.exists) {
          // User exists, redirect based on type
          if (data.user.is_admin) {
            router.push('/admin')
          } else {
            router.push('/dashboard')
          }
        } else {
          // User doesn't exist, redirect to onboarding
          router.push(`/${gender === 'male' ? 'boys' : 'girls'}-onboarding`)
        }
      } catch (error) {
        console.error('Error checking user status:', error)
        // Fallback to onboarding on any error
        router.push(`/${gender === 'male' ? 'boys' : 'girls'}-onboarding`)
      }
    } else {
      // User not signed in, trigger Google sign-in with gender preference
      localStorage.setItem('pendingGender', gender)
      await signIn('google')
    }
  }

  const handleLoginClick = async () => {
    if (status === 'authenticated' && session?.user?.email) {
      // User is already signed in, check their status
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

        const response = await fetch('/api/auth/user', {
          signal: controller.signal
        })
        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()

        if (data.exists) {
          // User exists, redirect based on type
          if (data.user.is_admin) {
            router.push('/admin')
          } else {
            router.push('/dashboard')
          }
        } else {
          // User doesn't have a profile, show warning
          alert('Profile not found! Please create a profile by clicking "Join as Boy" or "Join as Girl"')
        }
      } catch (error) {
        console.error('Error checking user status:', error)
        if (error instanceof Error && error.name === 'AbortError') {
          alert('Request timed out. Please try again.')
        } else {
          alert('Error checking profile. Please try again.')
        }
      }
    } else {
      // User not signed in, trigger Google sign-in
      await signIn('google')
    }
  }

  // Handle post-login routing based on stored gender preference
  useEffect(() => {
    async function handlePostLogin() {
      if (status === 'authenticated' && session?.user?.email) {
        const pendingGender = localStorage.getItem('pendingGender')
        
        if (pendingGender) {
          localStorage.removeItem('pendingGender')
          
          try {
            const response = await fetch('/api/auth/user')
            const data = await response.json()

            if (data.exists) {
              // User exists, redirect based on type
              if (data.user.is_admin) {
                router.push('/admin')
              } else {
                router.push('/dashboard')
              }
            } else {
              // User doesn't exist, redirect to onboarding
              router.push(`/${pendingGender === 'male' ? 'boys' : 'girls'}-onboarding`)
            }
          } catch (error) {
            console.error('Error checking user status:', error)
            router.push(`/${pendingGender === 'male' ? 'boys' : 'girls'}-onboarding`)
          }
        }
      }
    }

    handlePostLogin()
  }, [status, session, router])

  // Don't show landing page to authenticated users with profiles
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === 'authenticated' && session?.user?.email && isCheckingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking your profile...</p>
        </div>
      </div>
    )
  }

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
            {/* Show different UI based on user state */}
            {userState === 'no-auth' && (
              <>
                {/* Login Button */}
                <Button 
                  size="lg" 
                  variant="glass"
                  className="w-full sm:w-auto mb-4 sm:mb-0 hover:glow"
                  onClick={handleLoginClick}
                >
                  Login with Google
                </Button>

                <div className="text-white/50 text-sm">or</div>

                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 glow-pink"
                  onClick={() => handleJoinClick('female')}
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Join as Girl
                </Button>

                <Button 
                  size="lg" 
                  variant="glass"
                  className="w-full sm:w-auto hover:glow"
                  onClick={() => handleJoinClick('male')}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Join as Boy
                </Button>
              </>
            )}

            {userState === 'signed-in-no-profile' && (
              <div className="flex flex-col items-center gap-6">
                <div className="text-center mb-4">
                  <p className="text-lg text-white/80 mb-2">Welcome back, {session?.user?.name}!</p>
                  <p className="text-white/60">Complete your profile to start meeting amazing people</p>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 glow-pink text-lg px-8 py-4"
                  onClick={handleCompleteProfile}
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Complete Your Profile
                </Button>

                <Button 
                  size="lg" 
                  variant="glass"
                  className="w-full sm:w-auto opacity-50 cursor-not-allowed"
                  disabled
                  onClick={() => alert('Please complete your profile first to access your dashboard')}
                >
                  <Crown className="mr-2 h-5 w-5" />
                  Dashboard (Locked)
                </Button>
              </div>
            )}

            {userState === 'loading' && (
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
                <span className="text-white/70">Loading...</span>
              </div>
            )}
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
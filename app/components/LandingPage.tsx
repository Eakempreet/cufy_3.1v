'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { Button } from './ui/Button'
import { Card, CardContent } from './ui/Card'
import { Heart, Star, Sparkles, Crown, AlertTriangle, Users, MessageCircle, Shield, MessageSquare, Coffee, BookOpen, Camera, Music } from 'lucide-react'
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

const features = [
  {
    icon: Users,
    title: 'Smart Matching',
    description: 'Our AI algorithm finds your perfect college match based on interests, goals, and compatibility.',
    gradient: 'from-blue-500 to-purple-600',
  },
  {
    icon: Shield,
    title: 'Safe & Secure',
    description: 'Verified college profiles with secure messaging. Your privacy and safety are our top priority.',
    gradient: 'from-green-500 to-teal-600',
  },
  {
    icon: MessageCircle,
    title: 'Meaningful Connections',
    description: 'Skip the superficial. Connect with people who share your academic interests and life goals.',
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    icon: MessageSquare,
    title: 'Real-time Chat',
    description: 'Instant messaging with your matches. Share your thoughts, plans, and build genuine relationships.',
    gradient: 'from-yellow-500 to-orange-600',
  },
]

const testimonials = [
  {
    name: 'Priya Sharma',
    university: 'Sharda University',
    image: '/testimonials/girl1.jpg',
    text: "Yaar cufy mst website hai! 💕 Finally mil gaya koi jo mere jaise hi studies me serious hai. Love it yr! 😍",
    rating: 4,
  },
  {
    name: 'Arjun Singh',
    university: 'Delhi University',
    image: '/testimonials/boy1.jpg',
    text: "Bro this app is actually legit! 🔥 Met so many cool people from my college. Campus dating scene sorted hai completely! 💯",
    rating: 4,
  },
  {
    name: 'Ananya Gupta',
    university: 'Mumbai University',
    image: '/testimonials/girl2.jpg',
    text: "Omg guys use kro isko! 😭💕 Itne ache matches aate hai yahan pe. Sab verified students hai so tension nhi lena pdta safety ka! ✨",
    rating: 4,
  },
  {
    name: 'Rohit Kumar',
    university: 'IIT Delhi',
    image: '/testimonials/boy2.jpg',
    text: "Finally ek platform jo sirf college students ke liye hai! No fake profiles, sab genuine hai. Highly recommended! 🙌",
    rating: 4,
  },
]

const stats = [
  { number: '1,600+', label: 'Happy Students' },
  { number: '32+', label: 'Colleges Connected' },
  { number: '643+', label: 'Successful Matches' },
  { number: '4.1/5', label: 'Average Rating' },
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
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, 100])
  const y2 = useTransform(scrollY, [0, 300], [0, -100])

  const [isCheckingProfile, setIsCheckingProfile] = useState(false)
  const [userState, setUserState] = useState<'loading' | 'no-auth' | 'signed-in-no-profile' | 'has-profile'>('loading')
  
  // System settings state
  const [boysRegistrationEnabled, setBoysRegistrationEnabled] = useState(true)
  const [boysRegistrationMessage, setBoysRegistrationMessage] = useState('Boys registration will open soon! Girls can join now.')
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  // Fetch system settings on component mount
  useEffect(() => {
    const fetchSystemSettings = async () => {
      try {
        const response = await fetch('/api/registration-status')
        const data = await response.json()
        
        if (data.success) {
          setBoysRegistrationEnabled(data.boys_registration_enabled === true)
          setBoysRegistrationMessage(data.boys_registration_message || 'Boys registration will open soon! Girls can join now.')
        }
      } catch (error) {
        console.error('Error fetching system settings:', error)
        // Keep defaults on error
      } finally {
        setSettingsLoaded(true)
      }
    }

    fetchSystemSettings()
  }, [])

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
    // Check if boys registration is disabled for male users
    if (gender === 'male' && !boysRegistrationEnabled) {
      alert(boysRegistrationMessage)
      return
    }

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
      if (status === 'authenticated' && session?.user?.email && settingsLoaded) {
        const pendingGender = localStorage.getItem('pendingGender')
        
        if (pendingGender) {
          localStorage.removeItem('pendingGender')
          
          // Check if boys registration is disabled for male users
          if (pendingGender === 'male' && !boysRegistrationEnabled) {
            alert(boysRegistrationMessage)
            return
          }
          
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
  }, [status, session, router, settingsLoaded, boysRegistrationEnabled, boysRegistrationMessage])

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
    <div className="min-h-screen bg-dark relative overflow-hidden">
      <FloatingShapes />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-20 px-3 sm:px-6 min-h-screen flex items-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto text-center relative z-10"
        >
          {/* Floating Elements */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ 
              y: [-10, 10, -10],
              transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            className="absolute -top-10 -left-10 text-6xl opacity-20"
          >
            💕
          </motion.div>
          <motion.div
            initial={{ y: 0 }}
            animate={{ 
              y: [-10, 10, -10],
              transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }
            }}
            className="absolute -top-5 -right-10 text-4xl opacity-20"
          >
            ✨
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mb-6"
          >
            <span className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-pink-300 font-medium text-sm mb-6">
              🎓 The #1 College Dating Platform in India
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold font-poppins mb-4 sm:mb-6 leading-tight px-4 sm:px-0"
          >
            <span className="text-gradient">Where Matches</span>{' '}
            <span className="text-white">Are Meant</span>{' '}
            <br className="hidden sm:block" />
            <span className="text-gradient">to Meet</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/70 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-4 sm:px-6 lg:px-0"
          >
            Connect with genuine college students, build meaningful relationships, and discover your perfect study partner or soulmate. 
            <br className="hidden md:block" />
            <span className="text-gradient font-semibold">Where campus romance meets real connections.</span>
          </motion.p>

          {/* Stats Section */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-0"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 sm:p-4 text-center"
              >
                <div className="text-lg sm:text-2xl md:text-3xl font-bold text-gradient mb-1">
                  {stat.number}
                </div>
                <div className="text-white/60 text-xs sm:text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center gap-4 sm:gap-6"
          >
            {/* Show different UI based on user state */}
            {userState === 'no-auth' && (
              <>
                {/* Warning above buttons */}
                {!boysRegistrationEnabled && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 sm:p-4 max-w-sm sm:max-w-md mx-auto backdrop-blur-xl mb-2"
                  >
                    <div className="flex items-center space-x-2 text-orange-400 text-xs sm:text-sm">
                      <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="font-medium">Registration Update</span>
                    </div>
                    <p className="text-orange-200 text-xs sm:text-sm mt-1">
                      {boysRegistrationMessage}
                    </p>
                  </motion.div>
                )}

                {/* Login Button */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full max-w-xs px-4 sm:px-0">
                  <Button 
                    size="lg" 
                    variant="glass"
                    className="w-full hover:glow text-sm sm:text-base lg:text-lg px-6 sm:px-8 py-3 sm:py-4"
                    onClick={handleLoginClick}
                  >
                    <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Login with Google
                  </Button>
                </motion.div>

                <div className="text-white/50 text-xs sm:text-sm font-medium px-4">or join as</div>

                {/* Action Buttons Container */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-md justify-center items-stretch px-4 sm:px-0">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                    <Button 
                      size="lg" 
                      className="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:via-rose-600 hover:to-pink-700 glow-pink text-sm sm:text-base lg:text-lg px-4 sm:px-8 py-4 sm:py-4 shadow-2xl shadow-pink-500/25 min-h-[48px]"
                      onClick={() => handleJoinClick('female')}
                    >
                      <Heart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      College Girl
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                    <Button 
                      size="lg" 
                      variant="glass"
                      className={`w-full text-sm sm:text-base lg:text-lg px-4 sm:px-8 py-4 sm:py-4 min-h-[48px] ${
                        !boysRegistrationEnabled 
                          ? 'opacity-50 cursor-not-allowed bg-gray-600' 
                          : 'hover:glow shadow-2xl shadow-blue-500/25'
                      }`}
                      disabled={!boysRegistrationEnabled}
                      onClick={() => handleJoinClick('male')}
                    >
                      <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      {!boysRegistrationEnabled ? (
                        <span className="text-xs sm:text-sm lg:text-base">
                          Boys Entry<br className="sm:hidden" /> Closed
                        </span>
                      ) : (
                        'College Boy'
                      )}
                    </Button>
                  </motion.div>
                </div>
              </>
            )}

            {userState === 'signed-in-no-profile' && (
              <div className="flex flex-col items-center gap-6">
                <div className="text-center mb-4">
                  <p className="text-lg text-white/80 mb-2">Welcome back, {session?.user?.name}! 👋</p>
                  <p className="text-white/60">Complete your profile to start meeting amazing people</p>
                </div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 glow-pink text-lg px-8 py-4"
                    onClick={handleCompleteProfile}
                  >
                    <Heart className="mr-2 h-5 w-5" />
                    Complete Your Profile
                  </Button>
                </motion.div>

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

          {/* Trust Indicators */}
          <motion.div
            variants={itemVariants}
            className="mt-12 flex flex-wrap justify-center items-center gap-8 text-white/40 text-sm"
          >
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>100% Verified Profiles</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span>643+ Matches Made</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span>4.9/5 Rating</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 relative">
        <motion.div
          style={{ y: y1 }}
          className="absolute top-0 left-0 w-full h-full opacity-10"
        >
          <div className="absolute top-10 left-10 text-8xl">💖</div>
          <div className="absolute bottom-10 right-10 text-8xl">✨</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="container mx-auto relative z-10"
        >
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-bold font-poppins mb-4">
                Why <span className="text-gradient">College Students</span> Love Cufy
              </h2>
              <p className="text-xl text-white/70 max-w-3xl mx-auto">
                Designed specifically for college life, relationships, and meaningful connections that last beyond graduation.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
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
                  delay: index * 0.1,
                }}
                viewport={{ once: true }}
                className="relative group"
              >
                <Card className="h-full border-white/10 bg-white/5 backdrop-blur-xl hover:border-white/20 transition-all duration-300">
                  <CardContent className="p-6 text-center h-full flex flex-col">
                    <div className="flex items-center justify-center mb-4">
                      <div className={`p-3 rounded-full bg-gradient-to-r ${feature.gradient} shadow-lg`}>
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-3">
                      {feature.title}
                    </h3>
                    
                    <p className="text-white/70 flex-grow">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-3 sm:px-6 relative">
        <motion.div
          style={{ y: y2 }}
          className="absolute inset-0 opacity-5"
        >
          <div className="absolute top-10 sm:top-20 left-4 sm:left-20 text-4xl sm:text-6xl">🎓</div>
          <div className="absolute bottom-10 sm:bottom-20 right-4 sm:right-20 text-4xl sm:text-6xl">💕</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="container mx-auto relative z-10"
        >
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold font-poppins mb-4">
              <span className="text-gradient">Real Stories</span> from Real Students
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              See how Cufy has transformed college relationships across India's top universities.
            </p>
          </div>

          {/* Mobile: Horizontal Scrolling, Desktop: Grid */}
          <div className="block md:hidden">
            {/* Mobile Horizontal Scroll */}
            <div className="flex gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-transparent pb-4 px-2">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ 
                    duration: 0.5,
                    delay: index * 0.1,
                  }}
                  viewport={{ once: true }}
                  className="relative group flex-shrink-0 w-72"
                >
                  <Card className="border-white/10 bg-white/5 backdrop-blur-xl hover:border-white/20 transition-all duration-300">
                    <CardContent className="p-4">
                      {/* Avatar */}
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                          {testimonial.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <h4 className="text-white font-semibold text-sm">{testimonial.name}</h4>
                          <p className="text-white/60 text-xs">{testimonial.university}</p>
                        </div>
                      </div>
                      
                      {/* Rating */}
                      <div className="flex mb-2">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      
                      {/* Testimonial */}
                      <p className="text-white/80 text-xs leading-relaxed italic">
                        "{testimonial.text}"
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Desktop: Grid Layout */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ 
                  scale: 1.02,
                  y: -5,
                }}
                transition={{ 
                  duration: 0.6,
                  delay: index * 0.1,
                }}
                viewport={{ once: true }}
                className="relative group"
              >
                <Card className="h-full border-white/10 bg-white/5 backdrop-blur-xl hover:border-white/20 transition-all duration-300 hover:glow">
                  <CardContent className="p-4 sm:p-6">
                    {/* Avatar */}
                    <div className="flex items-center mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold text-base sm:text-lg">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <h4 className="text-white font-semibold text-sm sm:text-base">{testimonial.name}</h4>
                        <p className="text-white/60 text-xs sm:text-sm">{testimonial.university}</p>
                      </div>
                    </div>
                    
                    {/* Rating */}
                    <div className="flex mb-2 sm:mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    
                    {/* Testimonial */}
                    <p className="text-white/80 text-xs sm:text-sm leading-relaxed italic">
                      "{testimonial.text}"
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="container mx-auto"
        >
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-bold font-poppins mb-4">
                <span className="text-gradient">Premium Plans</span> for College Boys
              </h2>
              <p className="text-xl text-white/70 max-w-3xl mx-auto">
                Choose the perfect plan to unlock meaningful connections and find your college soulmate.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingCards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ 
                  scale: 1.03,
                  rotateY: 2,
                }}
                transition={{ 
                  duration: 0.6,
                  delay: index * 0.2,
                }}
                viewport={{ once: true }}
                className="relative group"
              >
                <Card className={`relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-xl ${
                  card.popular ? 'ring-2 ring-primary glow shadow-2xl shadow-primary/25' : ''
                }`}>
                  {card.popular && (
                    <motion.div
                      initial={{ opacity: 0, x: 100 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="absolute top-0 right-0 bg-gradient-to-r from-primary to-secondary px-6 py-2 text-sm font-bold rounded-bl-xl"
                    >
                      ⭐ MOST POPULAR
                    </motion.div>
                  )}

                  <CardContent className="p-8">
                    <div className="flex items-center justify-center mb-6">
                      <div className={`p-4 rounded-2xl bg-gradient-to-r ${card.gradient} shadow-lg`}>
                        <card.icon className="h-8 w-8 text-white" />
                      </div>
                    </div>

                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {card.title}
                      </h3>
                      <div className={`text-5xl font-bold mb-3 bg-gradient-to-r ${card.gradient} text-transparent bg-clip-text`}>
                        {card.price}
                      </div>
                      <p className="text-white/70 text-lg">
                        {card.description}
                      </p>
                    </div>

                    <ul className="space-y-4 mb-8">
                      {card.features.map((feature, featureIndex) => (
                        <motion.li 
                          key={featureIndex} 
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: featureIndex * 0.1 }}
                          className="flex items-center text-white/80"
                        >
                          <div className={`p-1 rounded-full bg-gradient-to-r ${card.gradient} mr-3`}>
                            <Star className="h-3 w-3 text-white fill-current" />
                          </div>
                          {feature}
                        </motion.li>
                      ))}
                    </ul>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        className={`w-full bg-gradient-to-r ${card.gradient} hover:shadow-lg transition-all duration-300 text-lg py-3 ${
                          card.popular ? 'shadow-lg shadow-primary/30' : ''
                        }`}
                        size="lg"
                      >
                        {card.popular ? '🚀 Get Premium' : 'Get Started'}
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Additional Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-white/60 mb-4">✨ All plans include</p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-400" />
                <span>Verified College Profiles</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-blue-400" />
                <span>Secure Messaging</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink-400" />
                <span>Smart Compatibility Matching</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-20 px-6 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="container mx-auto text-center"
        >
          <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 border border-white/10 rounded-3xl p-12 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold font-poppins mb-6">
                Ready to find your <span className="text-gradient">college soulmate</span>?
              </h2>
              <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
                Join hundreds of college students who've found love, friendship, and meaningful relationships on Cufy.
              </p>
              
              {userState === 'no-auth' && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-xl px-10 py-4 shadow-2xl shadow-pink-500/25"
                      onClick={() => handleJoinClick('female')}
                    >
                      <Heart className="mr-2 h-6 w-6" />
                      Start as College Girl
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      size="lg" 
                      variant="glass"
                      className={`text-xl px-10 py-4 ${
                        !boysRegistrationEnabled 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'shadow-2xl shadow-blue-500/25'
                      }`}
                      disabled={!boysRegistrationEnabled}
                      onClick={() => handleJoinClick('male')}
                    >
                      <Sparkles className="mr-2 h-6 w-6" />
                      {!boysRegistrationEnabled ? (
                        <span className="text-lg sm:text-xl">
                          Boys Entry Closed
                        </span>
                      ) : (
                        'Start as College Boy'
                      )}
                    </Button>
                  </motion.div>
                </div>
              )}

              <div className="mt-8 flex justify-center items-center gap-8 text-white/50 text-sm">
                <div className="flex items-center gap-2">
                  <Coffee className="h-4 w-4" />
                  <span>Coffee dates</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Study partners</span>
                </div>
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4" />
                  <span>Concert buddies</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}
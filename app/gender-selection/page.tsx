'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Heart, Sparkles } from 'lucide-react'
import FloatingShapes from '../components/FloatingShapes'

export default function GenderSelection() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [boysRegistrationEnabled, setBoysRegistrationEnabled] = useState(true)
  const [boysRegistrationMessage, setBoysRegistrationMessage] = useState('')

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  // Check boys registration status
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        // Add cache busting to force fresh data
        const timestamp = new Date().getTime()
        const response = await fetch(`/api/registration-status?t=${timestamp}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
        const data = await response.json()
        
        console.log('Gender selection registration status response:', data)
        
        setBoysRegistrationEnabled(data.boys_registration_enabled === true)
        setBoysRegistrationMessage(data.boys_registration_message || 'Boys registration will open soon! Girls can join now.')
      } catch (error) {
        console.error('Error checking registration status:', error)
      }
    }

    checkRegistrationStatus()
    
    // Set up interval to refetch every 30 seconds to stay in sync
    const interval = setInterval(checkRegistrationStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleGenderSelection = async (gender: 'male' | 'female') => {
    if (!session?.user?.email) return
    
    // Check if boys registration is disabled and user selected male
    if (gender === 'male' && !boysRegistrationEnabled) {
      return // Do nothing if boys registration is disabled
    }
    
    setLoading(true)
    
    // Check if user already exists using new API
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
        // Redirect to appropriate onboarding
        router.push(gender === 'male' ? '/boys-onboarding' : '/girls-onboarding')
      }
    } catch (error) {
      console.error('Error checking user:', error)
      // Fallback to onboarding
      router.push(gender === 'male' ? '/boys-onboarding' : '/girls-onboarding')
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark relative flex items-center justify-center">
      <FloatingShapes />
      
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-6 text-center"
      >
        <h1 className="text-4xl md:text-6xl font-bold font-poppins mb-8">
          <span className="text-gradient">Welcome to Cufy!</span>
        </h1>
        
        <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto">
          Hi {session.user?.name}! To get started, please select your gender:
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <Card 
              className="p-8 cursor-pointer hover:border-pink-500/50 transition-all"
              onClick={() => handleGenderSelection('female')}
            >
              <Heart className="h-16 w-16 text-pink-500 mx-auto mb-4 fill-current" />
              <h3 className="text-2xl font-bold text-white mb-4">Female</h3>
              <Button 
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                disabled={loading}
              >
                Continue as Female
              </Button>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: boysRegistrationEnabled ? 1.05 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card 
              className={`p-8 transition-all ${
                boysRegistrationEnabled 
                  ? 'cursor-pointer hover:border-purple-500/50' 
                  : 'cursor-not-allowed opacity-50 border-gray-600'
              }`}
              onClick={() => boysRegistrationEnabled && handleGenderSelection('male')}
            >
              <Sparkles className={`h-16 w-16 mx-auto mb-4 fill-current ${
                boysRegistrationEnabled ? 'text-purple-500' : 'text-gray-500'
              }`} />
              <h3 className={`text-2xl font-bold mb-4 ${
                boysRegistrationEnabled ? 'text-white' : 'text-gray-400'
              }`}>Male</h3>
              
              {boysRegistrationEnabled ? (
                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                  disabled={loading}
                >
                  Continue as Male
                </Button>
              ) : (
                <div className="text-center">
                  <Button 
                    className="w-full bg-gray-600 text-gray-300 cursor-not-allowed"
                    disabled={true}
                  >
                    Not Available
                  </Button>
                  <p className="text-sm text-amber-400 mt-3 font-medium">
                    {boysRegistrationMessage}
                  </p>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

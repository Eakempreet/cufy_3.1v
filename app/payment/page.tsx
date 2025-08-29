'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import PaymentPage from '../components/PaymentPage'

export default function Payment() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [planType, setPlanType] = useState<'basic' | 'premium' | null>(null)

  console.log('Payment page mounted, session:', session?.user?.email)

  useEffect(() => {
    console.log('Payment page useEffect running')
    console.log('Session:', session?.user?.email)
    
    // Get plan from URL parameters using window.location
    const urlParams = new URLSearchParams(window.location.search)
    const planFromUrl = urlParams.get('plan') as 'basic' | 'premium'
    console.log('Plan from URL (window.location):', planFromUrl)
    console.log('Full URL:', window.location.href)
    
    // Set plan type immediately if found, regardless of session
    if (planFromUrl && ['basic', 'premium'].includes(planFromUrl)) {
      console.log('Valid plan found, setting planType:', planFromUrl)
      setPlanType(planFromUrl)
    }
    
    if (!session) {
      console.log('No session, but keeping payment page open for now')
      // Don't redirect immediately, let user see the payment page
      setIsLoading(false)
      return
    }
    
    if (!planFromUrl || !['basic', 'premium'].includes(planFromUrl)) {
      console.log('No valid plan found after 2 seconds, redirecting to subscription selection')
      // Only redirect if no plan is found after a delay
      const redirectTimer = setTimeout(() => {
        router.push('/subscription-selection')
      }, 2000) // Give more time for URL params to load
      
      return () => clearTimeout(redirectTimer)
    }

    // Check if user profile exists (only if we have both session and plan)
    const checkUser = async () => {
      try {
        console.log('Checking user profile...')
        const response = await fetch('/api/user/check')
        const data = await response.json()
        console.log('User check response:', data)
        
        if (!data.exists) {
          console.log('User profile does not exist, redirecting to onboarding')
          router.push('/boys-onboarding')
          return
        }
        
        console.log('User profile exists, proceeding with payment page')
      } catch (error) {
        console.error('Error checking user:', error)
        // Don't redirect on error, just continue with payment page
      } finally {
        setIsLoading(false)
      }
    }

    // Only run user check if we have both session and valid plan
    if (session && planFromUrl && ['basic', 'premium'].includes(planFromUrl)) {
      checkUser()
    } else {
      setIsLoading(false)
    }
  }, [session, router])

  const handlePaymentProofUploaded = () => {
    // Redirect to dashboard after payment
    router.push('/dashboard')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading payment details...</div>
      </div>
    )
  }

  if (!planType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-lg">Redirecting...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <PaymentPage 
        subscriptionType={planType}
        onPaymentProofUploaded={handlePaymentProofUploaded}
      />
    </div>
  )
}

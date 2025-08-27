'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import PaymentPage from '../components/PaymentPage'

export default function Payment() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [userSubscription, setUserSubscription] = useState<any>(null)

  useEffect(() => {
    if (!session) {
      router.push('/')
      return
    }

    // Check if user has a subscription selected
    const checkUser = async () => {
      try {
        const response = await fetch('/api/user/check')
        const data = await response.json()
        
        if (!data.exists) {
          // If no profile, redirect to onboarding
          router.push('/boys-onboarding')
          return
        }

        if (!data.user.subscription_type) {
          // If no subscription selected, redirect to subscription selection
          router.push('/subscription-selection')
          return
        }

        setUserSubscription(data.user)
      } catch (error) {
        console.error('Error checking user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()
  }, [session, router])

  const handlePaymentProofUploaded = () => {
    // Redirect to dashboard or waiting page
    router.push('/dashboard')
  }

  if (isLoading) {
    return (
      <div className="bg-dark min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!userSubscription) {
    return (
      <div className="bg-dark min-h-screen flex items-center justify-center">
        <div className="text-white">Redirecting...</div>
      </div>
    )
  }

  return (
    <div className="bg-dark min-h-screen">
      <PaymentPage 
        subscriptionType={userSubscription.subscription_type}
        onPaymentProofUploaded={handlePaymentProofUploaded}
      />
    </div>
  )
}

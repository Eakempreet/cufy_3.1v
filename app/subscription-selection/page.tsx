'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import SubscriptionSelection from '../components/SubscriptionSelection'

export default function SubscriptionSelectionPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      router.push('/')
      return
    }

    // Check if user has already selected a subscription
    const checkSubscription = async () => {
      try {
        const response = await fetch('/api/user/check')
        const data = await response.json()
        
        if (data.exists && data.user.subscription_type) {
          // If subscription already selected, redirect to payment
          router.push('/payment')
        } else if (!data.exists) {
          // If no profile, redirect to onboarding
          router.push('/boys-onboarding')
        }
      } catch (error) {
        console.error('Error checking subscription:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSubscription()
  }, [session, router])

  const handleSubscriptionSelect = async (type: 'basic' | 'premium') => {
    try {
      const response = await fetch('/api/user/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription_type: type }),
      })

      if (response.ok) {
        router.push('/payment')
      } else {
        console.error('Failed to update subscription')
      }
    } catch (error) {
      console.error('Error updating subscription:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-dark min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="bg-dark min-h-screen">
      <SubscriptionSelection onSelect={handleSubscriptionSelect} />
    </div>
  )
}

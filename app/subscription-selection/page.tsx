'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import SubscriptionSelection from '../components/SubscriptionSelection'

export default function SubscriptionSelectionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Wait for session to load
    if (status === 'loading') return
    
    if (status === 'unauthenticated' || !session) {
      router.push('/')
      return
    }

    // Check if user has already selected a subscription
    const checkSubscription = async () => {
      try {
        const response = await fetch('/api/user/check')
        const data = await response.json()
        
        // Only redirect if user has both profile AND payment confirmed
        if (data.exists && data.user.subscription_type && data.user.payment_confirmed) {
          console.log('User already has confirmed subscription, redirecting to dashboard')
          router.push('/dashboard')
        } else if (!data.exists) {
          console.log('No user profile, redirecting to onboarding')
          router.push('/boys-onboarding')
        } else {
          console.log('User profile exists, showing subscription selection')
        }
      } catch (error) {
        console.error('Error checking subscription:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSubscription()
  }, [session, router, status])

  // Show loading while session is loading
  if (status === 'loading') {
    return (
      <div className="bg-dark min-h-screen flex items-center justify-center">
        <div className="text-white">Checking authentication...</div>
      </div>
    )
  }

  const handleSubscriptionSelect = async (type: 'basic' | 'premium') => {
    try {
      setIsLoading(true)
      console.log('Selecting subscription:', type)
      
      const response = await fetch('/api/user/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription_type: type }),
      })

      const data = await response.json()
      console.log('Subscription response:', data)

      if (response.ok) {
        // Use the same URL format as the component
        const paymentUrl = `/payment?plan=${type}`
        console.log('Redirecting to:', paymentUrl)
        router.push(paymentUrl)
      } else {
        console.error('Failed to update subscription:', data)
        
        // Show user-friendly error
        if (data.requiresMigration) {
          alert('Database needs to be updated. Please contact support.')
        } else {
          alert('Failed to select subscription. Please try again.')
        }
      }
    } catch (error) {
      console.error('Error updating subscription:', error)
      alert('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
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

'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import BoysOnboarding from '../components/BoysOnboarding'

export default function BoysOnboardingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [canAccess, setCanAccess] = useState(false)

  useEffect(() => {
    if (!session) {
      router.push('/')
      return
    }

    const checkProfile = async () => {
      try {
        const response = await fetch('/api/user/check')
        const data = await response.json()
        
        if (data.exists && data.user.name) {
          // User has completed profile, redirect to dashboard
          router.push('/dashboard')
          return
        }
        
        // User doesn't have profile or it's incomplete, allow access
        setCanAccess(true)
      } catch (error) {
        console.error('Error checking profile:', error)
        setCanAccess(true) // Allow access on error
      } finally {
        setIsLoading(false)
      }
    }

    checkProfile()
  }, [session, router])

  if (isLoading) {
    return (
      <div className="bg-dark min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!canAccess) {
    return (
      <div className="bg-dark min-h-screen flex items-center justify-center">
        <div className="text-white">Redirecting...</div>
      </div>
    )
  }

  return <BoysOnboarding />
}
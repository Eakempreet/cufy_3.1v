'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import GirlsOnboarding from '../components/GirlsOnboarding'

export default function GirlsOnboardingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [canAccess, setCanAccess] = useState(false)

  // Auto fullscreen on first user interaction
  useEffect(() => {
    let hasRequestedFullscreen = false
    
    const requestFullscreenOnInteraction = async () => {
      if (hasRequestedFullscreen) return
      hasRequestedFullscreen = true
      
      try {
        if (!document.fullscreenElement) {
          const element = document.documentElement
          
          if (element.requestFullscreen) {
            await element.requestFullscreen()
          } else if ((element as any).webkitRequestFullscreen) {
            await (element as any).webkitRequestFullscreen()
          } else if ((element as any).mozRequestFullScreen) {
            await (element as any).mozRequestFullScreen()
          } else if ((element as any).msRequestFullscreen) {
            await (element as any).msRequestFullscreen()
          }
        }
      } catch (error) {
        console.log('Fullscreen request failed:', error)
      }
      
      document.removeEventListener('click', requestFullscreenOnInteraction)
      document.removeEventListener('touchstart', requestFullscreenOnInteraction)
      document.removeEventListener('keydown', requestFullscreenOnInteraction)
    }

    document.addEventListener('click', requestFullscreenOnInteraction, { once: true })
    document.addEventListener('touchstart', requestFullscreenOnInteraction, { once: true })
    document.addEventListener('keydown', requestFullscreenOnInteraction, { once: true })
    
    return () => {
      document.removeEventListener('click', requestFullscreenOnInteraction)
      document.removeEventListener('touchstart', requestFullscreenOnInteraction)
      document.removeEventListener('keydown', requestFullscreenOnInteraction)
    }
  }, [])

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

  return <GirlsOnboarding />
}
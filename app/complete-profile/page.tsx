'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function CompleteProfile() {
  const { data: session, status } = useSession()
  const router = useRouter()

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
    if (status === 'loading') return

    if (!session?.user?.email) {
      router.push('/')
      return
    }

    // Redirect to gender selection for profile completion
    router.push('/gender-selection')
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}

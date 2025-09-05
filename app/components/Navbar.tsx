'use client'

import { motion } from 'framer-motion'
import { Button } from './ui/Button'
import { Heart, Shield } from 'lucide-react'
import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [userExists, setUserExists] = useState(false)

  useEffect(() => {
    const checkUserStatus = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/auth/user')
          const data = await response.json()
          
          if (data.exists) {
            setIsAdmin(data.user.is_admin)
            setUserExists(true)
          } else {
            setIsAdmin(false)
            setUserExists(false)
          }
        } catch (error) {
          console.error('Error checking user status:', error)
        }
      }
    }

    checkUserStatus()
  }, [session])

  const handleAuthClick = async () => {
    if (status === 'authenticated' && session?.user?.email) {
      // User is signed in, check their status
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
          // User doesn't have a profile, redirect to gender selection to complete profile
          router.push('/gender-selection')
        }
      } catch (error) {
        console.error('Error checking user status:', error)
        alert('Error checking profile. Please try again.')
      }
    } else {
      // User not signed in, trigger Google sign-in
      await signIn('google')
    }
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 glass backdrop-blur-md border-b border-white/10"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-gradient fill-current" />
            <span className="text-2xl font-bold font-poppins text-gradient">
              Cufy
            </span>
          </Link>

          {status === 'loading' ? (
            <Button variant="glass" disabled>
              Loading...
            </Button>
          ) : session ? (
            <div className="flex items-center gap-4">
              {userExists && isAdmin && (
                <Link href="/admin">
                  <Button variant="glass" className="border-orange-500 text-orange-400 hover:bg-orange-500/10">
                    <Shield className="h-4 w-4 mr-2" />
                    Admin Panel
                  </Button>
                </Link>
              )}
              {userExists ? (
                <Link href="/dashboard">
                  <Button variant="glass">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Button variant="glass" onClick={handleAuthClick}>
                  Complete Profile
                </Button>
              )}
              <span className="text-white/70">Hi, {session.user?.name}</span>
              <Button variant="glass" onClick={() => signOut()}>
                Sign Out
              </Button>
            </div>
          ) : (
            <Button 
              variant="glass" 
              className="hover:glow"
              onClick={handleAuthClick}
            >
              Login with Google
            </Button>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
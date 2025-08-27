import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: string
  email: string
  full_name: string
  phone_number: string
  age: number
  university: string
  year_of_study: string
  profile_photo: string | null
  bio: string
  energy_style: string
  group_setting: string
  ideal_weekend: string[]
  communication_style: string
  best_trait: string
  relationship_values: string[]
  love_language: string
  connection_statement: string
  gender: 'male' | 'female'
  created_at: string
  updated_at: string
}

export function useAuth() {
  const { data: session, status } = useSession()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUserProfile = async () => {
      if (status === 'loading') return

      if (!session?.user?.email) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: session.user.email }),
        })

        if (response.ok) {
          const { user } = await response.json()
          setUserProfile(user)
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUserProfile()
  }, [session, status])

  const redirectToOnboarding = (gender?: 'male' | 'female') => {
    if (gender) {
      router.push(gender === 'male' ? '/boys-onboarding' : '/girls-onboarding')
    } else {
      router.push('/gender-selection')
    }
  }

  const redirectToDashboard = () => {
    router.push('/dashboard')
  }

  return {
    session,
    userProfile,
    loading: loading || status === 'loading',
    isAuthenticated: !!session,
    hasProfile: !!userProfile,
    redirectToOnboarding,
    redirectToDashboard,
  }
}

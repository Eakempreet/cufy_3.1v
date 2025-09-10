'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { 
  User, 
  Heart, 
  MessageCircle, 
  Settings, 
  Crown,
  Camera,
  Sparkles,
  Send,
  Star,
  Clock,
  Eye,
  EyeOff,
  CheckCircle,
  X,
  Timer,
  Users,
  Calendar,
  RefreshCw,
  LogOut,
  CreditCard,
  Upload,
  AlertTriangle,
  Instagram,
  UserMinus,
  QrCode,
  Copy,
  Smartphone
} from 'lucide-react'
import FloatingShapes from './FloatingShapes'
import ImageUpload from './ImageUpload'

interface UserProfile {
  id: string
  full_name: string
  age: number
  university: string
  profile_photo?: string
  bio: string
  gender: 'male' | 'female'
  current_round?: number
  subscription_type?: string
  subscription_status?: string
  payment_confirmed?: boolean
  payment_proof_url?: string
  instagram?: string
  year_of_study?: string
  energy_style?: string
  group_setting?: string
  ideal_weekend?: string | string[]
  communication_style?: string
  best_trait?: string
  relationship_values?: string | string[]
  love_language?: string
  connection_statement?: string
}

interface Assignment {
  id: string
  female_user: UserProfile
  status: 'assigned' | 'revealed' | 'disengaged' | 'selected'
  assigned_at: string
  revealed_at?: string
  disengaged_at?: string
  male_revealed?: boolean
  female_revealed?: boolean
  is_selected?: boolean
  timer_expires_at?: string
}

interface TemporaryMatch {
  id: string
  male_user: UserProfile
  female_user: UserProfile
  revealed_at: string
  expires_at: string
  status: 'active' | 'disengaged'
  male_disengaged: boolean
  female_disengaged: boolean
}

interface PermanentMatch {
  id: string
  male_user: UserProfile
  female_user: UserProfile
  matched_at: string
  status: 'active'
}

export default function Dashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [temporaryMatches, setTemporaryMatches] = useState<TemporaryMatch[]>([])
  const [permanentMatches, setPermanentMatches] = useState<PermanentMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<{ [key: string]: number }>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showDisengageWarning, setShowDisengageWarning] = useState<string | null>(null)
  const [isRevealing, setIsRevealing] = useState<{ [key: string]: boolean }>({})
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [profileData, setProfileData] = useState({
    full_name: '',
    age: '',
    university: '',
    bio: '',
    instagram: ''
  })
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false)
  const [profileUpdateError, setProfileUpdateError] = useState<string | null>(null)
  const [instagramInput, setInstagramInput] = useState('')
  const [isSubmittingInstagram, setIsSubmittingInstagram] = useState(false)
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserData()
    }
  }, [session])

  useEffect(() => {
    // Update countdown timers every second
    const interval = setInterval(() => {
      const newTimeRemaining: { [key: string]: number } = {}
      
      temporaryMatches.forEach(match => {
        const expiresAt = new Date(match.expires_at).getTime()
        const now = new Date().getTime()
        const remaining = Math.max(0, expiresAt - now)
        newTimeRemaining[match.id] = remaining
      })
      
      setTimeRemaining(newTimeRemaining)
    }, 1000)

    return () => clearInterval(interval)
  }, [temporaryMatches])

  const fetchUserData = async (showLoader = false) => {
    if (showLoader) setIsRefreshing(true)
    setLoading(showLoader ? false : true)
    try {
      // First check if user has a profile
      const userCheckRes = await fetch('/api/auth/user')
      const userCheckData = await userCheckRes.json()

      if (!userCheckData.exists) {
        // User doesn't have a profile, redirect to landing page
        router.push('/')
        return
      }

      const [profileRes, assignmentsRes, temporaryRes, permanentRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/user/assignments'),
        fetch('/api/user/temporary-matches'),
        fetch('/api/user/permanent-matches')
      ])

      const [profileData, assignmentsData, temporaryData, permanentData] = await Promise.all([
        profileRes.json(),
        assignmentsRes.json(),
        temporaryRes.json(),
        permanentRes.json()
      ])

      if (profileData.user) {
        console.log('Dashboard data loaded:', {
          user: profileData.user,
          temporaryMatches: temporaryData.matches?.length || 0,
          permanentMatches: permanentData.matches?.length || 0,
          temporaryData: temporaryData,
          permanentData: permanentData
        })
        
        setUser(profileData.user)
        setProfileData({
          full_name: profileData.user.full_name || '',
          age: profileData.user.age?.toString() || '',
          university: profileData.user.university || '',
          bio: profileData.user.bio || '',
          instagram: profileData.user.instagram || ''
        })
        setAssignments(assignmentsData.assignments || [])
        setTemporaryMatches(temporaryData.matches || [])
        setPermanentMatches(permanentData.matches || [])
      } else {
        // Profile not found, redirect to landing page
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      // On error, redirect to landing page
      router.push('/')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRevealProfile = async (assignmentId: string) => {
    try {
      setIsRevealing(prev => ({ ...prev, [assignmentId]: true }))
      setErrorMessage(null)
      
      const response = await fetch('/api/user/reveal-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log('Reveal successful, updating state...')
        
        // Immediately update local state to reflect the change
        setAssignments(prev => prev.map(assignment => 
          assignment.id === assignmentId 
            ? { ...assignment, status: 'revealed', male_revealed: true, revealed_at: new Date().toISOString() }
            : assignment
        ))
        
        // Also fetch fresh data to ensure consistency
        setTimeout(async () => {
          await fetchUserData()
          setIsRevealing(prev => ({ ...prev, [assignmentId]: false }))
        }, 500)
      } else {
        console.error('Error revealing profile:', data.error)
        setErrorMessage(data.error || 'Failed to reveal profile')
        setIsRevealing(prev => ({ ...prev, [assignmentId]: false }))
        
        // Clear error message after 5 seconds
        setTimeout(() => setErrorMessage(null), 5000)
      }
    } catch (error) {
      console.error('Error revealing profile:', error)
      setErrorMessage('Network error. Please check your connection.')
      setIsRevealing(prev => ({ ...prev, [assignmentId]: false }))
      
      // Clear error message after 5 seconds
      setTimeout(() => setErrorMessage(null), 5000)
    }
  }

  const handleDisengage = async (matchId: string) => {
    try {
      setLoading(true)
      console.log('🔄 Disengaging from assignment:', matchId)
      
      const response = await fetch('/api/user/disengage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId: matchId }), // Changed from matchId to assignmentId
      })

      const data = await response.json()

      if (response.ok && data.success) {
        console.log('✅ Disengage successful:', data.message)
        setShowDisengageWarning(null)
        
        // Clear current assignments and matches since user moved to Round 2
        setAssignments([])
        setTemporaryMatches([])
        
        // Refresh all user data to get Round 2 assignments
        await fetchUserData()
        
        // Show success message
        if (data.changes?.movedToNextRound || data.changes?.completeClear) {
          alert(`Success! ${data.message}\n\nMoved to Round ${data.nextRound}`)
        }
      } else {
        console.error('Disengage error:', data.error)
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error disengaging:', error)
      alert('An error occurred while disengaging. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectProfile = async (assignmentId: string) => {
    try {
      setLoading(true)
      console.log('🔄 Selecting profile:', assignmentId)
      
      const response = await fetch('/api/user/select-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        console.log('✅ Profile selected successfully:', data.message)
        
        // Refresh dashboard data to show updated assignments
        await fetchUserData()
        
        // Show success message
        setErrorMessage(`✅ Profile selected! You can continue to view and select other available profiles.`)
        setTimeout(() => setErrorMessage(null), 5000)
      } else {
        console.error('❌ Failed to select profile:', data.error || 'Unknown error')
        setErrorMessage(data.error || 'Failed to select profile. Please try again.')
        setTimeout(() => setErrorMessage(null), 5000)
      }
    } catch (error) {
      console.error('❌ Error selecting profile:', error)
      setErrorMessage('An error occurred while selecting profile. Please try again.')
      setTimeout(() => setErrorMessage(null), 5000)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  const handleCompleteProfile = async () => {
    try {
      // Check if user exists in database first
      const response = await fetch('/api/auth/user')
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.exists) {
        // User has a profile, check if they need to complete additional steps
        if (data.user.is_admin) {
          router.push('/admin')
        } else {
          // Check if profile is incomplete and redirect to appropriate page
          if (!data.user.instagram || !data.user.profile_photo || !data.user.bio) {
            // Redirect to gender selection to restart onboarding
            router.push('/gender-selection')
          } else if (data.user.gender === 'male' && !data.user.subscription_type) {
            // Male user needs to select subscription
            router.push('/subscription-selection')
          } else {
            // Profile seems complete, stay on dashboard but refresh data
            await fetchUserData()
          }
        }
      } else {
        // User doesn't have a profile, redirect to gender selection to start onboarding
        router.push('/gender-selection')
      }
    } catch (error) {
      console.error('Error checking user profile:', error)
      // On error, redirect to gender selection as fallback
      router.push('/gender-selection')
    }
  }

  const handleRefresh = () => {
    fetchUserData(true)
  }

  const handleProfileUpdate = async () => {
    setIsUpdatingProfile(true)
    setProfileUpdateError(null)
    setProfileUpdateSuccess(false)
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: profileData.full_name,
          age: parseInt(profileData.age),
          university: profileData.university,
          bio: profileData.bio,
          instagram: profileData.instagram
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setProfileUpdateSuccess(true)
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setProfileUpdateSuccess(false)
        }, 3000)
        
        console.log('Profile updated successfully')
      } else {
        const errorData = await response.json()
        setProfileUpdateError(errorData.message || 'Failed to update profile')
        console.error('Failed to update profile')
      }
    } catch (error) {
      setProfileUpdateError('Network error. Please check your connection and try again.')
      console.error('Error updating profile:', error)
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear any existing error when user starts typing
    if (profileUpdateError) {
      setProfileUpdateError(null)
    }
  }

  const handleInstagramSubmission = async () => {
    if (!instagramInput.trim()) return
    
    setIsSubmittingInstagram(true)
    try {
      const response = await fetch('/api/user/update-instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instagram: instagramInput.replace('@', '')
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setInstagramInput('')
        console.log('Instagram profile updated successfully')
      } else {
        console.error('Failed to update Instagram profile')
      }
    } catch (error) {
      console.error('Error updating Instagram profile:', error)
    } finally {
      setIsSubmittingInstagram(false)
    }
  }

  const handlePhotoUpload = async (photoUrl: string) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_photo: photoUrl
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setShowPhotoUpload(false)
        console.log('Profile photo updated successfully')
      } else {
        console.error('Failed to update profile photo')
      }
    } catch (error) {
      console.error('Error updating profile photo:', error)
    }
  }

  const formatTimeRemaining = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-white text-xl">Loading your dashboard...</div>
      </div>
    )
  }

  if (!user) {
    router.push('/')
    return null
  }

  const assignedProfiles = assignments

  return (
    <div className="min-h-screen bg-dark relative">
      <FloatingShapes />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header with Logout */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <div className="flex space-x-3">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-red-400 border-red-400 hover:bg-red-400/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Error Message */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <X className="h-5 w-5 text-red-400" />
                <span className="text-red-400 font-medium">Error</span>
              </div>
              <p className="text-red-300 mt-1">{errorMessage}</p>
            </motion.div>
          )}

          <Card className="gradient-primary p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                  <AvatarImage src={user.profile_photo} />
                  <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white font-poppins">
                    Welcome back, {user.full_name.split(' ')[0]}!
                  </h1>
                  <p className="text-white/80 text-sm sm:text-base">{user.university}</p>
                </div>
              </div>
              
              <div className="flex flex-row sm:flex-col sm:items-end space-x-2 sm:space-x-0 sm:space-y-2">
                {/* Subscription Plan for Male Users */}
                {user.gender === 'male' && user.subscription_type && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs sm:text-sm flex items-center bg-purple-500/20 text-purple-400 border-purple-500/50"
                  >
                    <Crown className="h-3 w-3 mr-1" />
                    {user.subscription_type === 'basic' ? '₹99 Basic Plan' : '₹249 Premium Plan'}
                  </Badge>
                )}

                {/* Payment Status for Male Users */}
                {user.gender === 'male' && user.subscription_type && (
                  <Badge 
                    variant="secondary" 
                    className={`text-xs sm:text-sm flex items-center ${
                      user.payment_confirmed 
                        ? 'bg-green-500/20 text-green-400 border-green-500/50' 
                        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      user.payment_confirmed ? 'bg-green-400' : 'bg-yellow-400'
                    }`} />
                    {user.payment_confirmed ? 'Payment Confirmed' : 'Payment Pending'}
                  </Badge>
                )}
                
                <Badge variant="secondary" className="bg-white/20 text-white text-xs sm:text-sm">
                  <Heart className="h-3 w-3 mr-1" />
                  {permanentMatches.length} matches
                </Badge>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Instagram Resubmission Section - Only show if user has no Instagram */}
        {!user.instagram && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="border-pink-500/30 bg-gradient-to-r from-pink-500/10 to-purple-500/10">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-pink-500/20 rounded-full">
                      <Instagram className="h-6 w-6 text-pink-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Complete Your Profile
                      </h3>
                      <p className="text-white/70 text-sm">
                        Please resubmit your Instagram profile for verification
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                    <Input
                      placeholder="@yourhandle (without @)"
                      value={instagramInput}
                      onChange={(e) => setInstagramInput(e.target.value.replace('@', ''))}
                      className="bg-white/10 border-white/20 text-white placeholder-white/50"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && instagramInput.trim()) {
                          handleInstagramSubmission()
                        }
                      }}
                    />
                    <Button
                      onClick={handleInstagramSubmission}
                      disabled={!instagramInput.trim() || isSubmittingInstagram}
                      className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 whitespace-nowrap"
                    >
                      {isSubmittingInstagram ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}



        {/* Main Content */}
        <Tabs defaultValue={user.gender === 'male' ? 'matches' : 'matches'} className="w-full">
          <TabsList className="grid w-full grid-cols-3 glass backdrop-blur-md mb-8">
            <TabsTrigger value="matches" className="data-[state=active]:bg-primary text-sm sm:text-base">
              <Heart className="h-4 w-4 mr-1 sm:mr-2" />
              Your Matches
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary text-sm sm:text-base">
              <Settings className="h-4 w-4 mr-1 sm:mr-2" />
              Profile
            </TabsTrigger>
            {user.gender === 'male' && (
              <TabsTrigger value="payments" className="data-[state=active]:bg-primary text-sm sm:text-base">
                <CreditCard className="h-4 w-4 mr-1 sm:mr-2" />
                Payments
              </TabsTrigger>
            )}
          </TabsList>

          {/* Matches Tab */}
          <TabsContent value="matches">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Refresh Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  variant="outline"
                  className="text-sm"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>

              {/* For Male Users: Show Assigned Profiles */}
              {user.gender === 'male' && (
                <>
                  {/* New Logic: Show ALL profiles - both selected and available */}
                  {(() => {
                    // Get all profiles that are not hidden or disengaged
                    const allVisibleProfiles = assignedProfiles.filter(a => !['hidden', 'disengaged'].includes(a.status))
                    const selectedProfiles = allVisibleProfiles.filter(a => a.is_selected === true || a.status === 'selected')
                    const availableProfiles = allVisibleProfiles.filter(a => a.is_selected !== true && a.status !== 'selected')
                    
                    console.log('New Dashboard logic - Total visible:', allVisibleProfiles.length, 'Selected:', selectedProfiles.length, 'Available:', availableProfiles.length)
                    
                    if (allVisibleProfiles.length === 0) {
                      return (
                        <Card>
                          <CardContent className="text-center py-16">
                            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-white mb-2">No Profiles Available</h2>
                            <p className="text-gray-400">
                              {assignments.length === 0 
                                ? "You'll receive matches to review. Check back soon!" 
                                : "You've processed all your current assignments."
                              }
                            </p>
                          </CardContent>
                        </Card>
                      )
                    }
                    
                    // Show all profiles with different sections for selected vs available
                    return (
                      <div className="space-y-6">
                        {/* Selected Profiles Section */}
                        {selectedProfiles.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                                <Heart className="h-5 w-5 text-pink-500" />
                                <span>Your Selected Profiles ({selectedProfiles.length})</span>
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                                  <Timer className="h-3 w-3 mr-1" />
                                  Selected
                                </Badge>
                              </CardTitle>
                              <p className="text-gray-400 text-sm">
                                You have selected these profiles. You can still view and select additional profiles below.
                              </p>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                                {selectedProfiles.map((assignment) => (
                                  <MatchCard 
                                    key={assignment.id} 
                                    assignment={assignment} 
                                    user={user}
                                    isRevealing={isRevealing[assignment.id] || false}
                                    onReveal={() => handleRevealProfile(assignment.id)}
                                    onSelectProfile={() => handleSelectProfile(assignment.id)}
                                    onDisengage={(matchId) => setShowDisengageWarning(matchId)}
                                  />
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                        
                        {/* Available Profiles Section */}
                        {availableProfiles.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                                <User className="h-5 w-5" />
                                <span>Available Profiles ({availableProfiles.length})</span>
                              </CardTitle>
                              <p className="text-gray-400 text-sm">
                                These profiles are available for you to select. You can select multiple profiles.
                              </p>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                                {availableProfiles.map((assignment) => (
                                  <MatchCard 
                                    key={assignment.id} 
                                    assignment={assignment} 
                                    user={user}
                                    isRevealing={isRevealing[assignment.id] || false}
                                    onReveal={() => handleRevealProfile(assignment.id)}
                                    onSelectProfile={() => handleSelectProfile(assignment.id)}
                                    onDisengage={(matchId) => setShowDisengageWarning(matchId)}
                                  />
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )
                  })()}
                </>
              )}

              {/* Empty state for female users or users with no matches */}
              {(user.gender === 'female') && (
                <>
                  {/* For Female Users: Show Temporary Matches (boys who revealed them) */}
                  {temporaryMatches.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                          <Heart className="h-5 w-5" />
                          <span>Boys Who Revealed You</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                          {temporaryMatches.map((match) => (
                            <FemaleMatchCard 
                              key={match.id} 
                              match={match} 
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Permanent Matches for Female Users */}
                  {permanentMatches.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                          <Star className="h-5 w-5" />
                          <span>Your Permanent Matches</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                          {permanentMatches.map((match) => (
                            <PermanentMatchCard 
                              key={match.id} 
                              match={match} 
                              currentUserId={user.id}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {temporaryMatches.length === 0 && permanentMatches.length === 0 && !loading && (
                    <Card>
                      <CardContent className="p-8 sm:p-12 text-center">
                        <Heart className="h-12 w-12 sm:h-16 sm:w-16 text-white/30 mx-auto mb-4" />
                        <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                          No Matches Yet
                        </h3>
                        <p className="text-white/60 text-sm sm:text-base">
                          When someone reveals your profile and you both like each other, you'll see matches here!
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {loading && (
                    <Card>
                      <CardContent className="p-8 sm:p-12 text-center">
                        <RefreshCw className="h-12 w-12 sm:h-16 sm:w-16 text-white/30 mx-auto mb-4 animate-spin" />
                        <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                          Loading your matches...
                        </h3>
                        <p className="text-white/60 text-sm sm:text-base">
                          Please wait while we fetch your data.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {(user.gender === 'male' && assignments.length === 0 && temporaryMatches.length === 0 && permanentMatches.length === 0) && (
                <Card>
                  <CardContent className="p-8 sm:p-12 text-center">
                    <Users className="h-12 w-12 sm:h-16 sm:w-16 text-white/30 mx-auto mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                      No Matches Yet
                    </h3>
                    <p className="text-white/60 text-sm sm:text-base">
                      You'll receive up to 3 matches to review. Check back soon!
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                    <User className="h-5 w-5" />
                    <span>Edit Profile</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    {!showPhotoUpload ? (
                      <div>
                        <Avatar className="h-24 w-24 sm:h-32 sm:w-32 mx-auto mb-4">
                          <AvatarImage src={user.profile_photo} />
                          <AvatarFallback className="text-lg sm:text-2xl">
                            {user.full_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <Button 
                          variant="outline" 
                          className="text-sm sm:text-base"
                          onClick={() => setShowPhotoUpload(true)}
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Change Photo
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <ImageUpload
                          onImageUploaded={handlePhotoUpload}
                          currentImage={user.profile_photo}
                          className="w-full"
                        />
                        <Button 
                          variant="outline" 
                          onClick={() => setShowPhotoUpload(false)}
                          className="text-sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Full Name
                      </label>
                      <Input 
                        value={profileData.full_name}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Age
                      </label>
                      <Input 
                        type="number"
                        value={profileData.age}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      University
                    </label>
                    <Input 
                      value={profileData.university}
                      onChange={(e) => handleInputChange('university', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Bio
                    </label>
                    <Textarea 
                      value={profileData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      className="min-h-[80px] sm:min-h-[100px]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Instagram Username
                    </label>
                    <Input 
                      placeholder="@yourhandle (without @)"
                      value={profileData.instagram}
                      onChange={(e) => handleInputChange('instagram', e.target.value.replace('@', ''))}
                    />
                  </div>

                  {/* Success Message */}
                  {profileUpdateSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-green-500/20 border border-green-500 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <span className="text-green-400 font-medium">Profile Saved Successfully!</span>
                      </div>
                      <p className="text-green-300 text-sm mt-1">Your changes have been saved.</p>
                    </motion.div>
                  )}

                  {/* Error Message */}
                  {profileUpdateError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-red-500/20 border border-red-500 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <X className="h-5 w-5 text-red-400" />
                        <span className="text-red-400 font-medium">Error</span>
                      </div>
                      <p className="text-red-300 text-sm mt-1">{profileUpdateError}</p>
                    </motion.div>
                  )}

                  <Button 
                    className={`w-full text-sm sm:text-base transition-all duration-300 ${
                      profileUpdateSuccess 
                        ? 'bg-green-500 hover:bg-green-600 border-green-500' 
                        : 'gradient-primary'
                    }`}
                    onClick={handleProfileUpdate}
                    disabled={isUpdatingProfile}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {isUpdatingProfile ? 'Saving...' : profileUpdateSuccess ? 'Saved!' : 'Save Changes'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Payments Tab (Male Users Only) */}
          {user.gender === 'male' && (
            <TabsContent value="payments">
              <PaymentsSection user={user} setUser={setUser} fetchUserData={fetchUserData} />
            </TabsContent>
          )}
        </Tabs>

        {/* Disengage Warning Modal */}
        <AnimatePresence>
          {showDisengageWarning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowDisengageWarning(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-800 rounded-lg p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                  <h3 className="text-lg font-semibold text-white">Confirm Disengage</h3>
                </div>
                <p className="text-white/70 mb-6">
                  Are you sure you want to disengage? This action cannot be undone and the profile will be blurred permanently.
                </p>
                <div className="flex space-x-3">
                  <Button
                    onClick={() => setShowDisengageWarning(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleDisengage(showDisengageWarning)}
                    className="flex-1 bg-red-500 hover:bg-red-600"
                  >
                    <UserMinus className="h-4 w-4 mr-2" />
                    Disengage
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Enhanced Match Card Component with modern UI for boys
const MatchCard = ({ assignment, isRevealing, onReveal, onSelectProfile, onDisengage, user }: {
  assignment: Assignment
  isRevealing: boolean
  onReveal: () => void
  onSelectProfile: () => void
  onDisengage: (id: string) => void
  user: UserProfile | null
}) => {
  const [isBlurred, setIsBlurred] = useState(assignment.status === 'disengaged')
  const [showDisengageWarning, setShowDisengageWarning] = useState(false)
  
  // Check if profile is selected
  const isSelected = assignment.is_selected === true || assignment.status === 'selected'
  
  // Check if the assignment is revealed
  const isRevealed = assignment.status === 'revealed' || assignment.male_revealed === true || isSelected

  const handleDisengage = () => {
    setShowDisengageWarning(true)
  }

  const confirmDisengage = () => {
    setIsBlurred(true)
    onDisengage(assignment.id)
    setShowDisengageWarning(false)
  }

  const renderProfileCard = () => {
    if (!isRevealed) {
      // Before reveal - show picture, name, age, and bio
      return (
        <Card className="overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm">
          <div className="relative">
            {/* Profile Picture - Clear and Visible */}
            <div className="w-full h-56 sm:h-72 relative overflow-hidden">
              {assignment.female_user.profile_photo && (
                <img 
                  src={assignment.female_user.profile_photo}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Subtle gradient overlay for text readability */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Name and Age Tag */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
                <span className="text-gray-800 font-bold text-lg">
                  {assignment.female_user.full_name}, {assignment.female_user.age}
                </span>
              </div>
            </div>
          </div>
          
          <CardContent className="p-4 sm:p-6 bg-gradient-to-b from-slate-800/90 to-slate-900/90">
            {/* Bio Section */}
            <div className="mb-4">
              <h4 className="text-white font-semibold mb-2 flex items-center">
                <Heart className="h-4 w-4 mr-2 text-pink-400" />
                About {assignment.female_user.full_name.split(' ')[0]}
              </h4>
              <p className="text-white/90 text-sm leading-relaxed">
                {assignment.female_user.bio}
              </p>
            </div>

            {/* University */}
            <p className="text-white/70 text-sm mb-4 flex items-center">
              <User className="h-4 w-4 mr-2" />
              {assignment.female_user.university}
            </p>

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">
                Want to know more?
              </h3>
              <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/50">
                <Sparkles className="h-3 w-3 mr-1" />
                Fresh
              </Badge>
            </div>
            
            <p className="text-white/60 text-sm mb-4 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Assigned {new Date(assignment.assigned_at).toLocaleDateString()}
            </p>
            
            <Button
              onClick={onReveal}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              disabled={isRevealing}
            >
              {isRevealing ? (
                <motion.div 
                  className="flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Revealing...
                </motion.div>
              ) : (
                <>
                  <Eye className="h-5 w-5 mr-2" />
                  Reveal Full Profile
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )
    }

    // After reveal or when selected - show full profile
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: isBlurred ? 0.3 : 1, scale: 1, filter: isBlurred ? 'blur(8px)' : 'blur(0px)' }}
        transition={{ duration: 0.5 }}
        className={isSelected ? 'ring-2 ring-green-500/50 rounded-lg' : ''}
      >
        <Card className={`overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50 backdrop-blur-sm shadow-2xl ${
          isSelected ? 'border-green-500/50 bg-gradient-to-br from-green-800/20 to-slate-900/90' : ''
        }`}>
          <div className="relative">
            <motion.img 
              src={assignment.female_user.profile_photo} 
              alt={assignment.female_user.full_name}
              className="w-full h-48 sm:h-64 md:h-72 object-cover"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            />
            
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <Badge className={`absolute top-3 right-3 shadow-lg text-xs ${
                isSelected 
                  ? 'bg-green-500/90 text-white' 
                  : 'bg-blue-500/90 text-white'
              }`}>
                {isSelected ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Selected
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Revealed
                  </>
                )}
              </Badge>
            </motion.div>

            {/* Gradient overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent" />
            
            {/* Name overlay */}
            <div className="absolute bottom-3 left-3">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                {assignment.female_user.full_name}, {assignment.female_user.age}
              </h3>
              <p className="text-white/80 text-xs sm:text-sm flex items-center">
                <User className="h-3 w-3 mr-1" />
                {assignment.female_user.university}
              </p>
            </div>
          </div>
          
          <CardContent className="p-3 sm:p-4 md:p-6 bg-gradient-to-b from-slate-800/95 to-slate-900/95 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              {/* Selected Profile Timer - Mobile Optimized */}
              {isSelected && assignment.timer_expires_at && (
                <motion.div 
                  className="bg-gradient-to-r from-green-500/30 to-emerald-500/30 border-2 border-green-500/50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 backdrop-blur-sm"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Timer className="h-5 w-5 text-green-400" />
                    <span className="text-green-100 font-bold text-base sm:text-lg">Profile Selected!</span>
                  </div>
                  <div className="text-center">
                    <p className="text-green-200 text-xs sm:text-sm mb-2">
                      You have 48 hours to make your final decision
                    </p>
                    <div className="text-xs text-green-300">
                      Expires: {new Date(assignment.timer_expires_at).toLocaleDateString()} at {new Date(assignment.timer_expires_at).toLocaleTimeString()}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Instagram Section - Mobile Optimized */}
              {assignment.female_user.instagram && (
                <motion.div 
                  className="relative bg-gradient-to-r from-pink-500/30 to-purple-500/30 border-2 border-pink-500/50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 backdrop-blur-sm overflow-hidden"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Animated background sparkles */}
                  <div className="absolute inset-0 opacity-20">
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                          left: `${20 + i * 20}%`,
                          top: `${20 + (i % 2) * 60}%`,
                        }}
                        animate={{
                          opacity: [0.3, 1, 0.3],
                          scale: [1, 1.5, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.3,
                        }}
                      />
                    ))}
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-center space-x-3 mb-3">
                      <motion.div
                        className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Instagram className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </motion.div>
                      <span className="text-pink-100 font-bold text-lg sm:text-xl">@{assignment.female_user.instagram}</span>
                    </div>
                    <div className="text-center">
                      <p className="text-pink-200 text-xs sm:text-sm font-medium mb-2">💕 Connect on Instagram! 💕</p>
                      <motion.div
                        className="inline-block px-3 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-white text-xs font-semibold shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        ✨ Your Connection Awaits ✨
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Bio Section - Mobile Optimized */}
              <div className="bg-slate-700/50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                <h4 className="text-white font-semibold mb-2 flex items-center text-sm sm:text-base">
                  <Heart className="h-4 w-4 mr-2 text-pink-400" />
                  About {assignment.female_user.full_name.split(' ')[0]}
                </h4>
                <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
                  {assignment.female_user.bio}
                </p>
              </div>

              {/* Profile Details Grid - Mobile Optimized */}
              <div className="grid grid-cols-1 gap-2 sm:gap-3 mb-3 sm:mb-4">
                {assignment.female_user.energy_style && (
                  <div className="bg-slate-700/30 rounded-lg p-2 sm:p-3">
                    <span className="text-pink-400 font-medium text-xs uppercase tracking-wide">Energy Style</span>
                    <p className="text-white mt-1 text-xs sm:text-sm">{assignment.female_user.energy_style}</p>
                  </div>
                )}
                {assignment.female_user.group_setting && (
                  <div className="bg-slate-700/30 rounded-lg p-2 sm:p-3">
                    <span className="text-blue-400 font-medium text-xs uppercase tracking-wide">Group Setting</span>
                    <p className="text-white mt-1 text-xs sm:text-sm">{assignment.female_user.group_setting}</p>
                  </div>
                )}
                {assignment.female_user.communication_style && (
                  <div className="bg-slate-700/30 rounded-lg p-2 sm:p-3">
                    <span className="text-purple-400 font-medium text-xs uppercase tracking-wide">Communication</span>
                    <p className="text-white mt-1 text-xs sm:text-sm">{assignment.female_user.communication_style}</p>
                  </div>
                )}
                {assignment.female_user.best_trait && (
                  <div className="bg-slate-700/30 rounded-lg p-2 sm:p-3">
                    <span className="text-green-400 font-medium text-xs uppercase tracking-wide">Best Trait</span>
                    <p className="text-white mt-1 text-xs sm:text-sm">{assignment.female_user.best_trait}</p>
                  </div>
                )}
                {assignment.female_user.love_language && (
                  <div className="bg-slate-700/30 rounded-lg p-2 sm:p-3">
                    <span className="text-yellow-400 font-medium text-xs uppercase tracking-wide">Love Language</span>
                    <p className="text-white mt-1 text-xs sm:text-sm">{assignment.female_user.love_language}</p>
                  </div>
                )}
                {assignment.female_user.ideal_weekend && (
                  <div className="bg-slate-700/30 rounded-lg p-2 sm:p-3">
                    <span className="text-cyan-400 font-medium text-xs uppercase tracking-wide">Ideal Weekend</span>
                    <p className="text-white mt-1 text-xs sm:text-sm">
                      {Array.isArray(assignment.female_user.ideal_weekend) 
                        ? assignment.female_user.ideal_weekend.join(', ')
                        : assignment.female_user.ideal_weekend
                      }
                    </p>
                  </div>
                )}
                {assignment.female_user.relationship_values && (
                  <div className="bg-slate-700/30 rounded-lg p-2 sm:p-3">
                    <span className="text-rose-400 font-medium text-xs uppercase tracking-wide">Values</span>
                    <p className="text-white mt-1 text-xs sm:text-sm">
                      {Array.isArray(assignment.female_user.relationship_values) 
                        ? assignment.female_user.relationship_values.join(', ')
                        : assignment.female_user.relationship_values
                      }
                    </p>
                  </div>
                )}
                {assignment.female_user.connection_statement && (
                  <div className="bg-slate-700/30 rounded-lg p-2 sm:p-3">
                    <span className="text-indigo-400 font-medium text-xs uppercase tracking-wide">Connection Statement</span>
                    <p className="text-white mt-1 text-xs sm:text-sm">{assignment.female_user.connection_statement}</p>
                  </div>
                )}
              </div>
              
              <div className="text-xs text-white/50 mb-3 sm:mb-4 flex items-center justify-center">
                <Clock className="h-3 w-3 mr-1" />
                Revealed {assignment.revealed_at && new Date(assignment.revealed_at).toLocaleDateString()}
              </div>
              
              {/* Action Buttons - Mobile Optimized */}
              <div className="space-y-2 sm:space-y-3">
                {/* Select Profile Button - Only show if not selected */}
                {!isSelected && (
                  <Button 
                    onClick={onSelectProfile}
                    className="w-full h-12 sm:h-auto bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Select This Profile
                  </Button>
                )}
                
                {/* Disengage Button - Hide in Round 2 (final round) */}
                {user && user.current_round !== 2 && (
                  <Button 
                    onClick={handleDisengage}
                    variant="outline" 
                    className={`w-full h-10 sm:h-auto border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 transition-all duration-300 text-sm ${
                      isSelected ? 'border-red-600/60 text-red-500 hover:bg-red-600/20' : ''
                    }`}
                    disabled={isBlurred}
                  >
                    <UserMinus className="h-4 w-4 mr-2" />
                    {isSelected ? 'Cancel Selection' : 'Disengage'}
                  </Button>
                )}
                
                {/* Round 2 Final Selection Message */}
                {user?.current_round === 2 && isSelected && (
                  <div className="w-full p-3 sm:p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <div className="flex items-center justify-center text-green-400">
                      <Heart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      <span className="font-semibold text-sm sm:text-base">Final Match Selected!</span>
                    </div>
                    <p className="text-center text-green-300 text-xs sm:text-sm mt-1">
                      This is your final round selection
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </CardContent>
        </Card>

        {/* Disengage Warning Modal */}
        {showDisengageWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDisengageWarning(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-800 rounded-lg p-6 max-w-md w-full border border-red-500/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                <h3 className="text-lg font-semibold text-white">
                  ⚠️ {isSelected ? 'Cancel Selection?' : 'Confirm Disengagement'}
                </h3>
              </div>
              <p className="text-white/80 mb-6">
                {isSelected ? (
                  <>
                    Are you sure you want to cancel your selection of {assignment.female_user.full_name}? 
                    <br /><br />
                    <strong className="text-red-400">⚠️ WARNING: This will completely remove ALL your assigned profiles</strong> (including this selected one) and move you to the next round. You will lose access to all current matches.
                  </>
                ) : (
                  <>
                    Are you sure you want to disengage from {assignment.female_user.full_name}? 
                    <br /><br />
                    <strong className="text-red-400">⚠️ WARNING: This will completely remove ALL your assigned profiles</strong> and move you to the next round. You will lose access to all current matches.
                  </>
                )}
              </p>
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowDisengageWarning(false)}
                  variant="outline"
                  className="flex-1 border-white/30 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDisengage}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  {isSelected ? 'Yes, Remove All Profiles' : 'Yes, Remove All Profiles'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      {renderProfileCard()}
    </motion.div>
  )
}

// Enhanced Female Match Card Component - shows detailed profiles of boys who revealed them
const FemaleMatchCard = ({ match }: {
  match: TemporaryMatch
}) => {
  const [showFullProfile, setShowFullProfile] = useState(false)
  const timeRemaining = new Date(match.expires_at).getTime() - new Date().getTime()
  const hours = Math.floor(timeRemaining / (1000 * 60 * 60))
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden bg-gradient-to-br from-blue-800/90 to-purple-900/90 border-blue-700/50 backdrop-blur-sm shadow-2xl">
        <div className="relative">
          <motion.img 
            src={match.male_user.profile_photo} 
            alt={match.male_user.full_name}
            className="w-full h-56 sm:h-72 object-cover"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          />
          
          {/* Status Badge */}
          <Badge className="absolute top-4 right-4 bg-blue-500/90 text-white shadow-lg">
            <Heart className="h-4 w-4 mr-1" />
            Revealed You
          </Badge>

          {/* Timer Badge */}
          {timeRemaining > 0 && (
            <Badge className="absolute top-4 left-4 bg-yellow-500/90 text-white shadow-lg">
              <Timer className="h-4 w-4 mr-1" />
              {hours}h {minutes}m left
            </Badge>
          )}

          {/* Gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Name overlay */}
          <div className="absolute bottom-4 left-4">
            <h3 className="text-xl font-bold text-white mb-1">
              {match.male_user.full_name}, {match.male_user.age}
            </h3>
            <p className="text-white/80 text-sm flex items-center">
              <User className="h-3 w-3 mr-1" />
              {match.male_user.university}
            </p>
          </div>
        </div>
        
        <CardContent className="p-4 sm:p-6 bg-gradient-to-b from-blue-800/95 to-purple-900/95 backdrop-blur-sm">
          {/* Instagram Section - Featured & Enhanced */}
          {match.male_user.instagram && (
            <motion.div 
              className="relative bg-gradient-to-r from-pink-500/30 to-purple-500/30 border-2 border-pink-500/50 rounded-2xl p-6 mb-6 backdrop-blur-sm overflow-hidden cursor-pointer"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              whileHover={{ scale: 1.02, boxShadow: "0 10px 40px rgba(236, 72, 153, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.open(`https://instagram.com/${match.male_user.instagram}`, '_blank')}
            >
              {/* Enhanced animated background effects */}
              <div className="absolute inset-0 opacity-20">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full"
                    style={{
                      left: `${15 + i * 12}%`,
                      top: `${10 + (i % 3) * 30}%`,
                    }}
                    animate={{
                      opacity: [0.3, 1, 0.3],
                      scale: [1, 2, 1],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  />
                ))}
              </div>
              
              {/* Floating hearts animation */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={`heart-${i}`}
                    className="absolute text-pink-300 text-lg"
                    style={{
                      left: `${20 + i * 30}%`,
                      top: `${20 + i * 20}%`,
                    }}
                    animate={{
                      y: [-5, -15, -5],
                      opacity: [0.3, 0.8, 0.3],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: i * 0.8,
                    }}
                  >
                    💙
                  </motion.div>
                ))}
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <motion.div
                    className="p-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full shadow-lg"
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Instagram className="h-7 w-7 text-white" />
                  </motion.div>
                  <div className="text-center">
                    <span className="text-pink-100 font-bold text-2xl block">@{match.male_user.instagram}</span>
                    <span className="text-pink-200 text-sm">Click to visit profile</span>
                  </div>
                </div>
                
                <div className="text-center space-y-3">
                  <p className="text-pink-200 text-base font-medium">� Connect on Instagram! �</p>
                  
                  <motion.div
                    className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-white text-sm font-bold shadow-lg border border-pink-400/50"
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 5px 20px rgba(236, 72, 153, 0.5)"
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ✨ {match.male_user.full_name.split(' ')[0]} is interested in you! ✨
                  </motion.div>
                  
                  <div className="flex items-center justify-center space-x-2 text-pink-300 text-xs">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      👆
                    </motion.div>
                    <span>Tap to open Instagram</span>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.7 }}
                    >
                      👆
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Bio Section - Enhanced */}
          <div className="bg-slate-700/50 rounded-xl p-4 mb-6 border border-slate-600/30">
            <h4 className="text-white font-semibold mb-3 flex items-center text-lg">
              <Heart className="h-5 w-5 mr-2 text-blue-400" />
              About {match.male_user.full_name.split(' ')[0]}
            </h4>
            <p className="text-white/90 text-sm leading-relaxed mb-4">
              {match.male_user.bio}
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-500/20 rounded-lg p-3 text-center">
                <User className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                <p className="text-blue-300 text-xs font-medium">University</p>
                <p className="text-white text-sm">{match.male_user.university}</p>
              </div>
              <div className="bg-purple-500/20 rounded-lg p-3 text-center">
                <Calendar className="h-4 w-4 text-purple-400 mx-auto mb-1" />
                <p className="text-purple-300 text-xs font-medium">Age</p>
                <p className="text-white text-sm">{match.male_user.age} years</p>
              </div>
            </div>
          </div>

          {/* Personality Details - Expanded */}
          <div className="space-y-3 mb-6">
            <h5 className="text-white font-semibold flex items-center text-base">
              <Sparkles className="h-4 w-4 mr-2 text-pink-400" />
              Personality & Interests
            </h5>
            
            <div className="grid grid-cols-1 gap-3">
              {match.male_user.energy_style && (
                <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg p-3">
                  <span className="text-blue-400 font-medium text-xs uppercase tracking-wide block mb-1">⚡ Energy Style</span>
                  <p className="text-white font-medium">{match.male_user.energy_style}</p>
                </div>
              )}
              
              {match.male_user.group_setting && (
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-3">
                  <span className="text-purple-400 font-medium text-xs uppercase tracking-wide block mb-1">👥 Group Setting</span>
                  <p className="text-white font-medium">{match.male_user.group_setting}</p>
                </div>
              )}
              
              {match.male_user.communication_style && (
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-3">
                  <span className="text-green-400 font-medium text-xs uppercase tracking-wide block mb-1">💬 Communication</span>
                  <p className="text-white font-medium">{match.male_user.communication_style}</p>
                </div>
              )}
              
              {match.male_user.best_trait && (
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-3">
                  <span className="text-yellow-400 font-medium text-xs uppercase tracking-wide block mb-1">✨ Best Trait</span>
                  <p className="text-white font-medium">{match.male_user.best_trait}</p>
                </div>
              )}
              
              {match.male_user.love_language && (
                <div className="bg-gradient-to-r from-rose-500/20 to-pink-500/20 border border-rose-500/30 rounded-lg p-3">
                  <span className="text-rose-400 font-medium text-xs uppercase tracking-wide block mb-1">💝 Love Language</span>
                  <p className="text-white font-medium">{match.male_user.love_language}</p>
                </div>
              )}
              
              {match.male_user.ideal_weekend && (
                <div className="bg-gradient-to-r from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 rounded-lg p-3">
                  <span className="text-indigo-400 font-medium text-xs uppercase tracking-wide block mb-1">🌟 Ideal Weekend</span>
                  <p className="text-white font-medium">
                    {Array.isArray(match.male_user.ideal_weekend) 
                      ? match.male_user.ideal_weekend.join(', ')
                      : match.male_user.ideal_weekend
                    }
                  </p>
                </div>
              )}
              
              {match.male_user.relationship_values && (
                <div className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-teal-500/30 rounded-lg p-3">
                  <span className="text-teal-400 font-medium text-xs uppercase tracking-wide block mb-1">💎 Values</span>
                  <p className="text-white font-medium">
                    {Array.isArray(match.male_user.relationship_values) 
                      ? match.male_user.relationship_values.join(', ')
                      : match.male_user.relationship_values
                    }
                  </p>
                </div>
              )}
              
              {match.male_user.connection_statement && (
                <div className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 rounded-lg p-3">
                  <span className="text-violet-400 font-medium text-xs uppercase tracking-wide block mb-1">💫 Connection Statement</span>
                  <p className="text-white font-medium">{match.male_user.connection_statement}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Timer and Status Information */}
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-center mb-3">
              <Timer className="h-5 w-5 text-yellow-400 mr-2" />
              <span className="text-yellow-200 font-semibold">Decision Timer</span>
            </div>
            <div className="text-center">
              {timeRemaining > 0 ? (
                <>
                  <p className="text-white font-bold text-lg">
                    {hours}h {minutes}m remaining
                  </p>
                  <p className="text-yellow-300 text-sm mt-1">
                    He has until then to make his final choice
                  </p>
                </>
              ) : (
                <>
                  <p className="text-red-300 font-bold text-lg">
                    Time Expired
                  </p>
                  <p className="text-red-400 text-sm mt-1">
                    The decision window has closed
                  </p>
                </>
              )}
            </div>
          </div>
          
          {/* Revealed Date */}
          <div className="text-xs text-white/50 mb-4 flex items-center justify-center">
            <Clock className="h-3 w-3 mr-1" />
            Revealed your profile on {new Date(match.revealed_at).toLocaleDateString()} at {new Date(match.revealed_at).toLocaleTimeString()}
          </div>
          
          {/* Status Message */}
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
            <div className="text-center">
              <Heart className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <p className="text-blue-300 font-medium text-sm mb-1">
                {match.male_user.full_name.split(' ')[0]} has revealed your profile!
              </p>
              <p className="text-white/70 text-sm">
                {timeRemaining > 0 
                  ? "He's considering you for a potential match. You'll know his decision soon!"
                  : "The decision period has ended. Check your permanent matches to see the result."
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Permanent Match Card Component
const PermanentMatchCard = ({ match, currentUserId }: {
  match: PermanentMatch
  currentUserId: string
}) => {
  const otherUser = match.male_user.id === currentUserId ? match.female_user : match.male_user
  const isUser = match.male_user.id === currentUserId ? 'male' : 'female'
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden bg-gradient-to-br from-green-800/90 to-emerald-900/90 border-green-700/50 backdrop-blur-sm shadow-2xl">
        <div className="relative">
          <motion.img 
            src={otherUser.profile_photo} 
            alt={otherUser.full_name}
            className="w-full h-56 sm:h-72 object-cover"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          />
          
          <Badge className="absolute top-4 right-4 bg-green-500/90 text-white shadow-lg">
            <Crown className="h-4 w-4 mr-1" />
            Permanent Match
          </Badge>

          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
          
          <div className="absolute bottom-4 left-4">
            <h3 className="text-xl font-bold text-white mb-1">
              {otherUser.full_name}, {otherUser.age}
            </h3>
            <p className="text-white/80 text-sm flex items-center">
              <User className="h-3 w-3 mr-1" />
              {otherUser.university}
            </p>
          </div>
        </div>
        
        <CardContent className="p-4 sm:p-6 bg-gradient-to-b from-green-800/95 to-emerald-900/95 backdrop-blur-sm">
          {/* Enhanced Instagram Section for Permanent Matches */}
          {otherUser.instagram && (
            <motion.div 
              className="relative bg-gradient-to-r from-green-500/30 to-emerald-500/30 border-2 border-green-500/50 rounded-2xl p-6 mb-6 backdrop-blur-sm overflow-hidden cursor-pointer"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              whileHover={{ 
                scale: 1.02, 
                boxShadow: "0 10px 40px rgba(34, 197, 94, 0.3)" 
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.open(`https://instagram.com/${otherUser.instagram}`, '_blank')}
            >
              {/* Animated celebration effects for permanent matches */}
              <div className="absolute inset-0 opacity-20">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-gradient-to-r from-green-300 to-emerald-300 rounded-full"
                    style={{
                      left: `${10 + i * 15}%`,
                      top: `${15 + (i % 2) * 50}%`,
                    }}
                    animate={{
                      opacity: [0.3, 1, 0.3],
                      scale: [1, 2.5, 1],
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                  />
                ))}
              </div>
              
              {/* Crown and heart animations for permanent matches */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={`celebration-${i}`}
                    className="absolute text-green-300 text-xl"
                    style={{
                      left: `${25 + i * 25}%`,
                      top: `${10 + i * 30}%`,
                    }}
                    animate={{
                      y: [-3, -12, -3],
                      opacity: [0.4, 1, 0.4],
                      scale: [0.9, 1.3, 0.9],
                      rotate: [0, 15, -15, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 1,
                    }}
                  >
                    {i === 1 ? '👑' : '💚'}
                  </motion.div>
                ))}
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <motion.div
                    className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg border border-green-400/50"
                    animate={{ 
                      rotate: [0, 8, -8, 0],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    <Instagram className="h-7 w-7 text-white" />
                  </motion.div>
                  <div className="text-center">
                    <span className="text-green-100 font-bold text-2xl block">@{otherUser.instagram}</span>
                    <span className="text-green-200 text-sm">Your permanent match!</span>
                  </div>
                </div>
                
                <div className="text-center space-y-3">
                  <p className="text-green-200 text-base font-medium">💚 Connected Forever! 💚</p>
                  
                  <motion.div
                    className="inline-block px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-white text-sm font-bold shadow-lg border border-green-400/50"
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 5px 20px rgba(34, 197, 94, 0.5)"
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    👑 Perfect Match Found! 👑
                  </motion.div>
                  
                  <div className="flex items-center justify-center space-x-2 text-green-300 text-xs">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      👆
                    </motion.div>
                    <span>Tap to connect on Instagram</span>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.7 }}
                    >
                      👆
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
            <p className="text-white/90 text-sm leading-relaxed">
              {otherUser.bio}
            </p>
          </div>
          
          <div className="text-xs text-white/50 text-center">
            <Crown className="h-3 w-3 mx-auto mb-1" />
            Matched {new Date(match.matched_at).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Payments Section Component
const PaymentsSection = ({ 
  user, 
  setUser, 
  fetchUserData 
}: { 
  user: UserProfile
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>
  fetchUserData: () => void
}) => {
  const [paymentProof, setPaymentProof] = useState<string | null>(null)
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)

  // Initialize payment proof state with existing proof
  useEffect(() => {
    if (user.payment_proof_url) {
      setPaymentProof(user.payment_proof_url)
    }
  }, [user.payment_proof_url])

  // Generate QR code for UPI payment
  useEffect(() => {
    if (user?.subscription_type && !user.payment_confirmed) {
      const amount = user.subscription_type === 'basic' ? '99' : '249'
      const upiId = '9773978753@fam'
      const name = 'Aman Singh'
      
      // Updated UPI payment URL with your new details
      const upiUrl = "upi://pay?pa=9773978753@fam&pn=Aman%20Singh"
      
      QRCode.toDataURL(upiUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).then(setQrCodeDataUrl).catch(console.error)
    }
  }, [user])

  // Copy to clipboard function
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(label)
      setTimeout(() => setCopiedText(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        setCopiedText(label)
        setTimeout(() => setCopiedText(null), 2000)
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr)
      }
      document.body.removeChild(textArea)
    }
  }

  const handleProofUpload = async (fileName: string) => {
    // ImageUpload component now handles the file upload directly via API
    // We just need to update local state and refresh user data
    console.log('Payment proof uploaded successfully:', fileName)
    
    // Update local state
    setUser((prev: UserProfile | null) => prev ? {
      ...prev,
      payment_proof_url: fileName,
      payment_confirmed: false,
      subscription_status: 'pending'
    } : null)
    
    setPaymentProof(fileName)
    
    // Refresh user data to get latest payment status
    setTimeout(() => {
      fetchUserData()
    }, 1000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Payment Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Payment Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg">
            <div>
              <h3 className="font-semibold text-white">
                {user.subscription_type === 'basic' ? 'Basic Plan (₹99)' : 
                 user.subscription_type === 'premium' ? 'Premium Plan (₹249)' : 'No Plan Selected'}
              </h3>
              <p className="text-white/60 text-sm">
                {user.payment_confirmed ? 'Payment confirmed by admin' : 'Payment pending verification'}
              </p>
            </div>
            <Badge 
              className={user.payment_confirmed 
                ? 'bg-green-500/20 text-green-400 border-green-500/50'
                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
              }
            >
              {user.payment_confirmed ? 'Confirmed' : 'Pending'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Payment QR Code & UPI Section */}
      {!user.payment_confirmed && user.subscription_type && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <QrCode className="h-5 w-5" />
              <span>Quick Payment</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* QR Code Section */}
            <div className="bg-white p-4 sm:p-6 rounded-lg flex flex-col items-center space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Scan QR Code to Pay
                </h3>
                <p className="text-gray-600 text-sm">
                  {user.subscription_type === 'basic' ? '₹99' : '₹249'} - {user.subscription_type === 'basic' ? 'Basic Plan' : 'Premium Plan'}
                </p>
              </div>
              
              {/* QR Code Placeholder - You can replace this with actual QR code generation */}
              <div className="w-40 h-40 sm:w-48 sm:h-48 bg-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center">
                {qrCodeDataUrl ? (
                  <img 
                    src={qrCodeDataUrl} 
                    alt="UPI Payment QR Code" 
                    className="w-full h-full rounded-lg object-contain"
                  />
                ) : (
                  <QrCode className="h-16 w-16 sm:h-20 sm:w-20 text-gray-400" />
                )}
              </div>
              
              <p className="text-xs text-gray-500 text-center max-w-xs">
                Scan with any UPI app (Paytm, PhonePe, Google Pay, etc.)
              </p>
              
              {/* Direct UPI Payment Button for Mobile */}
              <Button
                onClick={() => {
                  const amount = user.subscription_type === 'basic' ? '99' : '249'
                  const upiId = '9773978753@fam'
                  const name = 'Aman Singh'
                  const upiUrl = "upi://pay?pa=9773978753@fam&pn=Aman%20Singh"
                  
                  // Try to open UPI app directly
                  window.location.href = upiUrl
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
              >
                <Smartphone className="h-4 w-4" />
                <span>Pay Now via UPI</span>
              </Button>
            </div>

            {/* UPI Details Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Smartphone className="h-5 w-5 text-blue-400" />
                <h4 className="text-white font-semibold">UPI Payment Details</h4>
              </div>
              
              {/* UPI ID */}
              <div className="bg-white/10 border border-white/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-white/70 text-sm">UPI ID</p>
                    <p className="text-white font-mono text-lg">9773978753@fam</p>
                  </div>
                  <Button
                    onClick={() => copyToClipboard('9773978753@fam', 'UPI ID')}
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    {copiedText === 'UPI ID' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Account Name */}
              <div className="bg-white/10 border border-white/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-white/70 text-sm">Account Name</p>
                    <p className="text-white font-semibold">Aman Singh</p>
                  </div>
                  <Button
                    onClick={() => copyToClipboard('Aman Singh', 'Account Name')}
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    {copiedText === 'Account Name' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Amount */}
              <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-white/70 text-sm">Amount to Pay</p>
                    <p className="text-white font-bold text-xl">
                      ₹{user.subscription_type === 'basic' ? '99' : '249'}
                    </p>
                  </div>
                  <Button
                    onClick={() => copyToClipboard(user.subscription_type === 'basic' ? '99' : '249', 'Amount')}
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    {copiedText === 'Amount' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Payment Instructions */}
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                <h5 className="text-blue-300 font-semibold mb-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Payment Instructions
                </h5>
                <ul className="text-white/70 text-sm space-y-1">
                  <li>• Use any UPI app to pay to: 9773978753@fam</li>
                  <li>• Amount: ₹{user.subscription_type === 'basic' ? '99' : '249'}</li>
                  <li>• After payment, upload screenshot below</li>
                  <li>• Your account will be activated after verification</li>
                </ul>
              </div>

              {/* Quick UPI App Links */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h5 className="text-white font-semibold mb-3 flex items-center">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Quick Payment Options
                </h5>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'PhonePe', url: 'phonepe://pay', color: 'bg-purple-600' },
                    { name: 'Google Pay', url: 'tez://upi/pay', color: 'bg-blue-600' },
                    { name: 'Paytm', url: 'paytmmp://pay', color: 'bg-indigo-600' },
                    { name: 'Amazon Pay', url: 'amazonpay://pay', color: 'bg-orange-600' }
                  ].map((app) => (
                    <Button
                      key={app.name}
                      onClick={() => {
                        const amount = user.subscription_type === 'basic' ? '99' : '249'
                        const upiId = '9773978753@fam'
                        const name = 'Aman Singh'
                        const upiUrl = "upi://pay?pa=9773978753@fam&pn=Aman%20Singh"
                        
                        // Fallback to generic UPI URL if app-specific doesn't work
                        const fallbackUrl = "upi://pay?pa=9773978753@fam&pn=Aman%20Singh"
                        
                        try {
                          window.location.href = upiUrl
                          // If app-specific URL fails, try generic UPI after a short delay
                          setTimeout(() => {
                            window.location.href = fallbackUrl
                          }, 1000)
                        } catch (error) {
                          window.location.href = fallbackUrl
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className={`${app.color} border-white/20 text-white hover:opacity-80 text-xs py-2`}
                    >
                      {app.name}
                    </Button>
                  ))}
                </div>
                <p className="text-white/50 text-xs mt-3 text-center">
                  Click to open payment in your preferred UPI app
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Payment Proof */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Payment Proof</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Payment Proof Display */}
          {user.payment_proof_url && (
            <div className="mb-4">
              <h4 className="text-white font-medium mb-2">Current Payment Proof:</h4>
              <div className="bg-white/10 border border-white/20 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-white font-medium">Proof Uploaded</p>
                    <p className="text-white/70 text-sm">
                      Status: {user.payment_confirmed ? 'Confirmed' : 'Under Review'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-4" />
            <p className="text-white/70 mb-4">
              {user.payment_proof_url ? 'Upload new payment proof to replace current one' : 'Upload your payment screenshot or receipt'}
            </p>
            
            <ImageUpload
              onImageUploaded={handleProofUpload}
              currentImage={user.payment_proof_url ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/payment-proofs/${user.payment_proof_url}` : undefined}
              className="w-full"
              uploadType="payment-proof"
              userId={user.id}
            />
          </div>
          
          {paymentProof && (
            <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-green-400 font-medium">Payment proof uploaded successfully!</span>
              </div>
              <p className="text-green-300 text-sm mt-1">
                Our team will review it and confirm your payment within 24 hours.
              </p>
            </div>
          )}

          {/* Upload Instructions */}
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
            <h5 className="text-blue-300 font-semibold mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Upload Instructions
            </h5>
            <ul className="text-white/70 text-sm space-y-1">
              <li>• Take a clear screenshot of your payment confirmation</li>
              <li>• Ensure the amount and transaction ID are visible</li>
              <li>• Supported formats: JPG, PNG, WebP (max 10MB)</li>
              <li>• You can replace your proof anytime before confirmation</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Plan Details */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          {user.subscription_type === 'basic' ? (
            <div className="space-y-3">
              <h4 className="font-semibold text-white">Basic Plan - ₹99</h4>
              <ul className="space-y-2 text-white/70">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>1 girl profile per round</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>2 rounds total</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>No choice - profile assigned by admin</span>
                </li>
              </ul>
            </div>
          ) : user.subscription_type === 'premium' ? (
            <div className="space-y-3">
              <h4 className="font-semibold text-white">Premium Plan - ₹249</h4>
              <ul className="space-y-2 text-white/70">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>3 girl profiles per round</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>2 rounds total</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>Choose 1 profile to reveal</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>Other profiles get reassigned</span>
                </li>
              </ul>
            </div>
          ) : (
            <div className="text-center py-6">
              <CreditCard className="h-12 w-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/60">No plan selected</p>
              <Button 
                className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500"
                onClick={() => window.location.href = '/subscription-selection'}
              >
                Choose Plan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
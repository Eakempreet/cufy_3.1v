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
  subscription_type?: string
  subscription_status?: string
  payment_confirmed?: boolean
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
  status: 'assigned' | 'revealed' | 'disengaged'
  assigned_at: string
  revealed_at?: string
  disengaged_at?: string
  male_revealed?: boolean
  female_revealed?: boolean
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
  const [instagramInput, setInstagramInput] = useState('')
  const [isSubmittingInstagram, setIsSubmittingInstagram] = useState(false)
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)

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
      const response = await fetch('/api/user/disengage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId }),
      })

      if (response.ok) {
        setShowDisengageWarning(null)
        await fetchUserData()
      }
    } catch (error) {
      console.error('Error disengaging:', error)
    }
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  const handleRefresh = () => {
    fetchUserData(true)
  }

  const handleProfileUpdate = async () => {
    setIsUpdatingProfile(true)
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
        // Show success message (you could add a toast notification here)
        console.log('Profile updated successfully')
      } else {
        console.error('Failed to update profile')
      }
    } catch (error) {
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
          <Button
            onClick={handleLogout}
            variant="outline"
            className="text-red-400 border-red-400 hover:bg-red-400/10"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
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
                  {/* Assigned Profiles */}
                  {assignedProfiles.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                          <Eye className="h-5 w-5" />
                          <span>Your Matches</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                          {assignedProfiles.map((assignment) => (
                            <MatchCard 
                              key={assignment.id} 
                              assignment={assignment} 
                              isRevealing={isRevealing[assignment.id] || false}
                              onReveal={() => handleRevealProfile(assignment.id)}
                              onDisengage={(matchId) => setShowDisengageWarning(matchId)}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {assignments.length === 0 && (
                    <Card>
                      <CardContent className="p-8 sm:p-12 text-center">
                        <Users className="h-12 w-12 sm:h-16 sm:w-16 text-white/30 mx-auto mb-4" />
                        <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                          No Matches Assigned Yet
                        </h3>
                        <p className="text-white/60 text-sm sm:text-base">
                          You'll receive matches to review. Check back soon!
                        </p>
                      </CardContent>
                    </Card>
                  )}
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
                              onDisengage={(matchId) => setShowDisengageWarning(matchId)}
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

                  <Button 
                    className="w-full gradient-primary text-sm sm:text-base"
                    onClick={handleProfileUpdate}
                    disabled={isUpdatingProfile}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Payments Tab (Male Users Only) */}
          {user.gender === 'male' && (
            <TabsContent value="payments">
              <PaymentsSection user={user} />
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
const MatchCard = ({ assignment, isRevealing, onReveal, onDisengage }: {
  assignment: Assignment
  isRevealing: boolean
  onReveal: () => void
  onDisengage: (id: string) => void
}) => {
  const [isBlurred, setIsBlurred] = useState(assignment.status === 'disengaged')
  const [showDisengageWarning, setShowDisengageWarning] = useState(false)

  const handleDisengage = () => {
    setShowDisengageWarning(true)
  }

  const confirmDisengage = () => {
    setIsBlurred(true)
    onDisengage(assignment.id)
    setShowDisengageWarning(false)
  }

  const renderProfileCard = () => {
    // Check if the assignment is revealed - check both status field and male_revealed for backward compatibility
    const isRevealed = assignment.status === 'revealed' || assignment.male_revealed === true
    
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

    // After reveal - show full profile with Instagram prominently
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: isBlurred ? 0.3 : 1, scale: 1, filter: isBlurred ? 'blur(8px)' : 'blur(0px)' }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50 backdrop-blur-sm shadow-2xl">
          <div className="relative">
            <motion.img 
              src={assignment.female_user.profile_photo} 
              alt={assignment.female_user.full_name}
              className="w-full h-56 sm:h-72 object-cover"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            />
            
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <Badge className="absolute top-4 right-4 bg-green-500/90 text-white shadow-lg">
                <CheckCircle className="h-4 w-4 mr-1" />
                Revealed
              </Badge>
            </motion.div>

            {/* Gradient overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Name overlay */}
            <div className="absolute bottom-4 left-4">
              <h3 className="text-xl font-bold text-white mb-1">
                {assignment.female_user.full_name}, {assignment.female_user.age}
              </h3>
              <p className="text-white/80 text-sm flex items-center">
                <User className="h-3 w-3 mr-1" />
                {assignment.female_user.university}
              </p>
            </div>
          </div>
          
          <CardContent className="p-4 sm:p-6 bg-gradient-to-b from-slate-800/95 to-slate-900/95 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              {/* Instagram Section - Main Feature Box */}
              {assignment.female_user.instagram && (
                <motion.div 
                  className="relative bg-gradient-to-r from-pink-500/30 to-purple-500/30 border-2 border-pink-500/50 rounded-2xl p-6 mb-6 backdrop-blur-sm overflow-hidden"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Animated background sparkles */}
                  <div className="absolute inset-0 opacity-20">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                          left: `${20 + i * 15}%`,
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
                    <div className="flex items-center justify-center space-x-4 mb-3">
                      <motion.div
                        className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Instagram className="h-6 w-6 text-white" />
                      </motion.div>
                      <span className="text-pink-100 font-bold text-xl">@{assignment.female_user.instagram}</span>
                    </div>
                    <div className="text-center">
                      <p className="text-pink-200 text-sm font-medium mb-2">💕 Connect on Instagram! 💕</p>
                      <motion.div
                        className="inline-block px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-white text-xs font-semibold shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        ✨ Your Connection Awaits ✨
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Bio Section */}
              <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                <h4 className="text-white font-semibold mb-2 flex items-center">
                  <Heart className="h-4 w-4 mr-2 text-pink-400" />
                  About {assignment.female_user.full_name.split(' ')[0]}
                </h4>
                <p className="text-white/90 text-sm leading-relaxed">
                  {assignment.female_user.bio}
                </p>
              </div>

              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 gap-3 mb-4">
                {assignment.female_user.energy_style && (
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <span className="text-pink-400 font-medium text-xs uppercase tracking-wide">Energy Style</span>
                    <p className="text-white mt-1">{assignment.female_user.energy_style}</p>
                  </div>
                )}
                {assignment.female_user.group_setting && (
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <span className="text-blue-400 font-medium text-xs uppercase tracking-wide">Group Setting</span>
                    <p className="text-white mt-1">{assignment.female_user.group_setting}</p>
                  </div>
                )}
                {assignment.female_user.communication_style && (
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <span className="text-purple-400 font-medium text-xs uppercase tracking-wide">Communication</span>
                    <p className="text-white mt-1">{assignment.female_user.communication_style}</p>
                  </div>
                )}
                {assignment.female_user.best_trait && (
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <span className="text-green-400 font-medium text-xs uppercase tracking-wide">Best Trait</span>
                    <p className="text-white mt-1">{assignment.female_user.best_trait}</p>
                  </div>
                )}
                {assignment.female_user.love_language && (
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <span className="text-yellow-400 font-medium text-xs uppercase tracking-wide">Love Language</span>
                    <p className="text-white mt-1">{assignment.female_user.love_language}</p>
                  </div>
                )}
                {assignment.female_user.ideal_weekend && (
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <span className="text-cyan-400 font-medium text-xs uppercase tracking-wide">Ideal Weekend</span>
                    <p className="text-white mt-1">
                      {Array.isArray(assignment.female_user.ideal_weekend) 
                        ? assignment.female_user.ideal_weekend.join(', ')
                        : assignment.female_user.ideal_weekend
                      }
                    </p>
                  </div>
                )}
                {assignment.female_user.relationship_values && (
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <span className="text-rose-400 font-medium text-xs uppercase tracking-wide">Values</span>
                    <p className="text-white mt-1">
                      {Array.isArray(assignment.female_user.relationship_values) 
                        ? assignment.female_user.relationship_values.join(', ')
                        : assignment.female_user.relationship_values
                      }
                    </p>
                  </div>
                )}
                {assignment.female_user.connection_statement && (
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <span className="text-indigo-400 font-medium text-xs uppercase tracking-wide">Connection Statement</span>
                    <p className="text-white mt-1">{assignment.female_user.connection_statement}</p>
                  </div>
                )}
              </div>
              
              <div className="text-xs text-white/50 mb-4 flex items-center justify-center">
                <Clock className="h-3 w-3 mr-1" />
                Revealed {assignment.revealed_at && new Date(assignment.revealed_at).toLocaleDateString()}
              </div>
              
              {/* Only Disengage Button */}
              <Button 
                onClick={handleDisengage}
                variant="outline" 
                className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 transition-all duration-300"
                disabled={isBlurred}
              >
                <UserMinus className="h-4 w-4 mr-2" />
                Disengage
              </Button>
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
                <h3 className="text-lg font-semibold text-white">⚠️ Confirm Disengagement</h3>
              </div>
              <p className="text-white/80 mb-6">
                Are you sure you want to disengage from {assignment.female_user.full_name}? 
                <br /><br />
                <strong className="text-red-400">This action cannot be undone!</strong> The profile will be blurred and you cannot reconnect.
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
                  Yes, Disengage
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

// Female Match Card Component - shows boys who revealed them
const FemaleMatchCard = ({ match, onDisengage }: {
  match: TemporaryMatch
  onDisengage: (id: string) => void
}) => {
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
          
          <Badge className="absolute top-4 right-4 bg-blue-500/90 text-white shadow-lg">
            <Heart className="h-4 w-4 mr-1" />
            Revealed You
          </Badge>

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
          {/* Instagram Section */}
          {match.male_user.instagram && (
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-center space-x-3">
                <Instagram className="h-5 w-5 text-blue-400" />
                <span className="text-blue-400 font-semibold text-lg">@{match.male_user.instagram}</span>
              </div>
              <p className="text-center text-blue-300 text-sm mt-1">Connect on Instagram!</p>
            </div>
          )}
          
          {/* Bio */}
          <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
            <h4 className="text-white font-semibold mb-2 flex items-center">
              <Heart className="h-4 w-4 mr-2 text-blue-400" />
              About {match.male_user.full_name.split(' ')[0]}
            </h4>
            <p className="text-white/90 text-sm leading-relaxed">
              {match.male_user.bio}
            </p>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 gap-3 mb-4">
            {match.male_user.energy_style && (
              <div className="bg-slate-700/30 rounded-lg p-3">
                <span className="text-blue-400 font-medium text-xs uppercase tracking-wide">Energy Style</span>
                <p className="text-white mt-1">{match.male_user.energy_style}</p>
              </div>
            )}
            {match.male_user.love_language && (
              <div className="bg-slate-700/30 rounded-lg p-3">
                <span className="text-purple-400 font-medium text-xs uppercase tracking-wide">Love Language</span>
                <p className="text-white mt-1">{match.male_user.love_language}</p>
              </div>
            )}
          </div>
          
          <div className="text-xs text-white/50 mb-4 flex items-center justify-center">
            <Clock className="h-3 w-3 mr-1" />
            Revealed {new Date(match.revealed_at).toLocaleDateString()}
          </div>
          
          <Button 
            onClick={() => onDisengage(match.id)}
            variant="outline" 
            className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500"
          >
            <UserMinus className="h-4 w-4 mr-2" />
            Disengage
          </Button>
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
          {otherUser.instagram && (
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-center space-x-3">
                <Instagram className="h-5 w-5 text-green-400" />
                <span className="text-green-400 font-semibold text-lg">@{otherUser.instagram}</span>
              </div>
            </div>
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
const PaymentsSection = ({ user }: { user: UserProfile }) => {
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)

  // Generate QR code for UPI payment
  useEffect(() => {
    if (user?.subscription_type && !user.payment_confirmed) {
      const amount = user.subscription_type === 'basic' ? '99' : '249'
      const upiId = '9773978753@fam'
      const name = 'Aman Singh'
      
      // UPI payment URL format with your details
      const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}.0`
      
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

  const handleProofUpload = async (file: File) => {
    setIsUploading(true)
    // Implementation for payment proof upload
    // This would typically upload to your storage service
    setTimeout(() => {
      setIsUploading(false)
      setPaymentProof(file)
    }, 2000)
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
                  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}.0`
                  
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
                        const upiUrl = `${app.url}?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}.0`
                        
                        // Fallback to generic UPI URL if app-specific doesn't work
                        const fallbackUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}.0`
                        
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
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-4" />
            <p className="text-white/70 mb-4">
              Upload your payment screenshot or receipt
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleProofUpload(file)
              }}
              className="hidden"
              id="payment-proof"
            />
            <label
              htmlFor="payment-proof"
              className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer transition-colors"
            >
              <Camera className="h-4 w-4 mr-2" />
              {paymentProof ? 'Change Photo' : 'Upload Photo'}
            </label>
          </div>
          
          {paymentProof && (
            <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-green-400 font-medium">Payment proof uploaded</span>
              </div>
              <p className="text-green-300 text-sm mt-1">
                File: {paymentProof.name}
              </p>
            </div>
          )}
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
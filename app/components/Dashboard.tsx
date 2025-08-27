'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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
  Send,
  Star,
  Clock,
  Eye,
  EyeOff,
  CheckCircle,
  X,
  Timer,
  Users
} from 'lucide-react'
import FloatingShapes from './FloatingShapes'

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
}

interface Assignment {
  id: string
  female_user: UserProfile
  status: 'assigned' | 'revealed'
  assigned_at: string
  revealed_at?: string
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
  const [profileData, setProfileData] = useState({
    full_name: '',
    age: '',
    university: '',
    bio: ''
  })
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)

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

  const fetchUserData = async () => {
    setLoading(true)
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
        setUser(profileData.user)
        setProfileData({
          full_name: profileData.user.full_name || '',
          age: profileData.user.age?.toString() || '',
          university: profileData.user.university || '',
          bio: profileData.user.bio || ''
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
    }
  }

  const handleRevealProfile = async (assignmentId: string) => {
    try {
      const response = await fetch('/api/user/reveal-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId }),
      })

      if (response.ok) {
        setSelectedProfile(assignmentId)
        await fetchUserData()
      }
    } catch (error) {
      console.error('Error revealing profile:', error)
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
        await fetchUserData()
      }
    } catch (error) {
      console.error('Error disengaging:', error)
    }
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
          bio: profileData.bio
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

  const assignedProfiles = assignments.filter(a => a.status === 'assigned')
  const revealedProfiles = assignments.filter(a => a.status === 'revealed')

  return (
    <div className="min-h-screen bg-dark relative">
      <FloatingShapes />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
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
                  <Users className="h-3 w-3 mr-1" />
                  {user.gender === 'male' ? `${assignedProfiles.length}/3 profiles` : `${temporaryMatches.length + permanentMatches.length} matches`}
                </Badge>
                <Badge variant="outline" className="border-white/30 text-white text-xs sm:text-sm">
                  <Heart className="h-3 w-3 mr-1" />
                  {permanentMatches.length} matches
                </Badge>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue={user.gender === 'male' ? 'matches' : 'matches'} className="w-full">
          <TabsList className="grid w-full grid-cols-2 glass backdrop-blur-md mb-8">
            <TabsTrigger value="matches" className="data-[state=active]:bg-primary text-sm sm:text-base">
              <Heart className="h-4 w-4 mr-1 sm:mr-2" />
              Matches
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary text-sm sm:text-base">
              <Settings className="h-4 w-4 mr-1 sm:mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Matches Tab - for both male and female users */}
          <TabsContent value="matches">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* For Male Users: Show Assigned Profiles */}
              {user.gender === 'male' && (
                <>
                  {/* Assigned Profiles */}
                  {assignedProfiles.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                          <Eye className="h-5 w-5" />
                          <span>Your Assigned Matches ({assignedProfiles.length}/3)</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                          {assignedProfiles.map((assignment) => (
                            <motion.div
                              key={assignment.id}
                              whileHover={{ scale: 1.02 }}
                              className="relative"
                            >
                              <Card className="overflow-hidden">
                                <div className="relative">
                                  <div className="w-full h-48 sm:h-64 bg-gradient-to-br from-pink-500 to-rose-500 rounded-t-lg" />
                                  <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
                                    <EyeOff className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
                                  </div>
                                </div>
                                <CardContent className="p-3 sm:p-4">
                                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                                    Match Available
                                  </h3>
                                  <p className="text-white/60 text-xs sm:text-sm mb-3 sm:mb-4">
                                    Assigned {new Date(assignment.assigned_at).toLocaleDateString()}
                                  </p>
                                  <Button
                                    onClick={() => handleRevealProfile(assignment.id)}
                                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-sm sm:text-base"
                                    disabled={selectedProfile === assignment.id}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    {selectedProfile === assignment.id ? 'Revealing...' : 'Reveal Match'}
                                  </Button>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Revealed Profiles */}
                  {revealedProfiles.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                          <CheckCircle className="h-5 w-5" />
                          <span>Revealed Matches</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                          {revealedProfiles.map((assignment) => (
                            <motion.div
                              key={assignment.id}
                              whileHover={{ scale: 1.02 }}
                            >
                              <Card className="overflow-hidden">
                                <div className="relative">
                                  <div className="w-full h-48 sm:h-64 bg-gradient-to-br from-pink-500 to-rose-500 rounded-t-lg" />
                                  <Badge className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-green-500 text-xs sm:text-sm">
                                    Revealed
                                  </Badge>
                                </div>
                                <CardContent className="p-3 sm:p-4">
                                  <h3 className="text-base sm:text-lg font-semibold text-white">
                                    {assignment.female_user.full_name}, {assignment.female_user.age}
                                  </h3>
                                  <p className="text-white/60 text-xs sm:text-sm mb-2">
                                    {assignment.female_user.university}
                                  </p>
                                  <p className="text-white/80 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                                    {assignment.female_user.bio}
                                  </p>
                                  <div className="text-xs text-white/50 mb-3 sm:mb-4">
                                    Revealed {assignment.revealed_at && new Date(assignment.revealed_at).toLocaleDateString()}
                                  </div>
                                  <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-sm sm:text-base">
                                    <Heart className="h-4 w-4 mr-2" />
                                    Like Match
                                  </Button>
                                </CardContent>
                              </Card>
                            </motion.div>
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
                          You'll receive up to 3 matches to review. Check back soon!
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {/* Temporary Matches - for both male and female users */}
              {temporaryMatches.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                      <Timer className="h-5 w-5" />
                      <span>Active Matches</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {temporaryMatches.map((match) => {
                        const otherUser = match.male_user.id === user.id ? match.female_user : match.male_user
                        return (
                          <motion.div
                            key={match.id}
                            whileHover={{ scale: 1.02 }}
                          >
                            <Card className="overflow-hidden">
                              <div className="relative">
                                {otherUser.profile_photo ? (
                                  <img 
                                    src={otherUser.profile_photo} 
                                    alt={otherUser.full_name}
                                    className="w-full h-48 sm:h-64 object-cover rounded-t-lg"
                                  />
                                ) : (
                                  <div className="w-full h-48 sm:h-64 bg-gradient-to-br from-pink-500 to-rose-500 rounded-t-lg" />
                                )}
                                <Badge className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-blue-500 text-xs sm:text-sm">
                                  {timeRemaining[match.id] ? formatTimeRemaining(timeRemaining[match.id]) : 'Expired'}
                                </Badge>
                              </div>
                              <CardContent className="p-3 sm:p-4">
                                <h3 className="text-base sm:text-lg font-semibold text-white">
                                  {otherUser.full_name}, {otherUser.age}
                                </h3>
                                <p className="text-white/60 text-xs sm:text-sm mb-2">
                                  {otherUser.university}
                                </p>
                                <p className="text-white/80 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                                  {otherUser.bio}
                                </p>
                                <div className="flex space-x-2">
                                  <Button className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-sm sm:text-base">
                                    <Heart className="h-4 w-4 mr-2" />
                                    Like
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    className="flex-1 text-sm sm:text-base"
                                    onClick={() => handleDisengage(match.id)}
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Pass
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Permanent Matches - for both male and female users */}
              {permanentMatches.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                      <Heart className="h-5 w-5" />
                      <span>Your Matches</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {permanentMatches.map((match) => {
                        const otherUser = match.male_user.id === user.id ? match.female_user : match.male_user
                        return (
                          <motion.div
                            key={match.id}
                            whileHover={{ scale: 1.02 }}
                          >
                            <Card className="overflow-hidden">
                              <div className="relative">
                                {otherUser.profile_photo ? (
                                  <img 
                                    src={otherUser.profile_photo} 
                                    alt={otherUser.full_name}
                                    className="w-full h-48 sm:h-64 object-cover rounded-t-lg"
                                  />
                                ) : (
                                  <div className="w-full h-48 sm:h-64 bg-gradient-to-br from-pink-500 to-rose-500 rounded-t-lg" />
                                )}
                                <Badge className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-green-500 text-xs sm:text-sm">
                                  Match!
                                </Badge>
                              </div>
                              <CardContent className="p-3 sm:p-4">
                                <h3 className="text-base sm:text-lg font-semibold text-white">
                                  {otherUser.full_name}, {otherUser.age}
                                </h3>
                                <p className="text-white/60 text-xs sm:text-sm mb-2">
                                  {otherUser.university}
                                </p>
                                <p className="text-white/80 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                                  {otherUser.bio}
                                </p>
                                <div className="text-xs text-white/50 mb-3 sm:mb-4">
                                  Matched {new Date(match.matched_at).toLocaleDateString()}
                                </div>
                                <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-sm sm:text-base">
                                  <MessageCircle className="h-4 w-4 mr-2" />
                                  Message
                                </Button>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Empty state for female users or users with no matches */}
              {(user.gender === 'female' || assignments.length === 0) && temporaryMatches.length === 0 && permanentMatches.length === 0 && (
                <Card>
                  <CardContent className="p-8 sm:p-12 text-center">
                    <Heart className="h-12 w-12 sm:h-16 sm:w-16 text-white/30 mx-auto mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                      {user.gender === 'male' ? 'No Matches Yet' : 'No Matches Yet'}
                    </h3>
                    <p className="text-white/60 text-sm sm:text-base">
                      {user.gender === 'male' 
                        ? "You'll receive up to 3 matches to review. Check back soon!"
                        : "When someone reveals your profile and you both like each other, you'll see matches here!"
                      }
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
                    <Avatar className="h-24 w-24 sm:h-32 sm:w-32 mx-auto mb-4">
                      <AvatarImage src={user.profile_photo} />
                      <AvatarFallback className="text-lg sm:text-2xl">
                        {user.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" className="text-sm sm:text-base">
                      <Camera className="h-4 w-4 mr-2" />
                      Change Photo
                    </Button>
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
        </Tabs>
      </div>
    </div>
  )
}
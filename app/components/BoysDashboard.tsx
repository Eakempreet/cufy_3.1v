'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { 
  Heart, 
  Clock, 
  Eye, 
  Timer, 
  SkipForward, 
  CheckCircle,
  Star,
  MapPin,
  Calendar,
  Instagram,
  BookOpen,
  Crown,
  Users,
  AlertTriangle,
  Hourglass,
  Lock,
  Unlock,
  Zap,
  Target,
  Award,
  TrendingUp,
  Activity,
  User,
  Gift,
  Sparkles,
  Coffee
} from 'lucide-react'

interface AssignedProfile {
  id: string
  female_user_id: string
  status: string
  assigned_at: string
  female_user: {
    id: string
    full_name: string
    age: number
    university: string
    profile_photo: string
    bio: string
    instagram: string
  }
}

interface TempMatch {
  id: string
  female_user_id: string
  expires_at: string
  female_user: {
    id: string
    full_name: string
    age: number
    university: string
    profile_photo: string
    bio: string
    instagram: string
  }
}

interface PermanentMatch {
  id: string
  female_user_id: string
  created_at: string
  female_user: {
    id: string
    full_name: string
    age: number
    university: string
    profile_photo: string
    bio: string
    instagram: string
  }
}

interface MaleDashboardData {
  user: any
  assignedProfiles: AssignedProfile[]
  currentTempMatch: TempMatch | null
  permanentMatch: PermanentMatch | null
  canReveal: boolean
  hasActiveDecision: boolean
  decisionExpiresAt: string | null
  canRequestRound2: boolean
  isLocked: boolean
  maxAssignments: number
}

export default function BoysDashboard() {
  const { data: session } = useSession()
  const [dashboardData, setDashboardData] = useState<MaleDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedProfile, setSelectedProfile] = useState<any>(null)
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [timeLeft, setTimeLeft] = useState<string>('')

  // Fetch dashboard data
  const fetchDashboard = useCallback(async () => {
    if (!session?.user?.email) return
    
    try {
      const response = await fetch(`/api/dashboard?userId=${session.user.email}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.type === 'male') {
          setDashboardData(data.dashboard)
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }, [session?.user?.email])

  // Calculate time remaining for decision
  useEffect(() => {
    if (dashboardData?.hasActiveDecision && dashboardData.decisionExpiresAt) {
      const timer = setInterval(() => {
        const now = new Date().getTime()
        const expiry = new Date(dashboardData.decisionExpiresAt!).getTime()
        const difference = expiry - now

        if (difference > 0) {
          const hours = Math.floor(difference / (1000 * 60 * 60))
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((difference % (1000 * 60)) / 1000)
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
        } else {
          setTimeLeft('Expired')
          fetchDashboard() // Refresh to get updated state
        }
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [dashboardData?.hasActiveDecision, dashboardData?.decisionExpiresAt, fetchDashboard])

  // Initial load
  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  // Handle reveal profile
  const handleRevealProfile = async (assignmentId: string) => {
    try {
      setActionLoading('select')
      
      const response = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reveal_profile',
          userId: session?.user?.email,
          data: { assignmentId }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        await fetchDashboard()
        alert(result.message)
      } else {
        alert(result.error || 'Failed to reveal profile')
      }
    } catch (error) {
      console.error('Error revealing profile:', error)
      alert('An error occurred')
    } finally {
      setActionLoading(null)
    }
  }

  // Handle request round 2
  const handleRequestRound2 = async () => {
    try {
      setActionLoading('round2')
      
      const response = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_round_2',
          userId: session?.user?.email
        })
      })

      const result = await response.json()
      
      if (result.success) {
        await fetchDashboard()
        alert(result.message)
      } else {
        alert(result.error || 'Failed to request round 2')
      }
    } catch (error) {
      console.error('Error requesting round 2:', error)
      alert('An error occurred')
    } finally {
      setActionLoading(null)
    }
  }

  // Handle confirm match
  const handleConfirmMatch = async () => {
    try {
      setActionLoading('confirm')
      
      const response = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm_match',
          userId: session?.user?.email
        })
      })

      const result = await response.json()
      
      if (result.success) {
        await fetchDashboard()
        alert(result.message)
      } else {
        alert(result.error || 'Failed to confirm match')
      }
    } catch (error) {
      console.error('Error confirming match:', error)
      alert('An error occurred')
    } finally {
      setActionLoading(null)
    }
  }

  // Open profile dialog
  const openProfileDialog = (profile: any) => {
    setSelectedProfile(profile)
    setProfileDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-gray-600 border-t-purple-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Loading your matches...</p>
        </motion.div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-yellow-400" />
          <h1 className="text-2xl font-bold mb-2">Dashboard Not Available</h1>
          <p className="text-gray-400">Please complete your payment to access the matching system.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-black/95 backdrop-blur-xl border-b border-purple-500/20 sticky top-0 z-40"
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Your Matches</h1>
                  <p className="text-gray-400 text-sm">
                    {dashboardData.user.subscription_type === 'premium' ? 'Premium Plan' : 'Basic Plan'} • 
                    {dashboardData.maxAssignments} max assignments
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge className={`${
                dashboardData.user.subscription_type === 'premium' 
                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' 
                  : 'bg-blue-500/20 text-blue-400 border-blue-500/50'
              }`}>
                {dashboardData.user.subscription_type === 'premium' ? (
                  <>
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </>
                ) : (
                  <>
                    <Users className="h-3 w-3 mr-1" />
                    Basic
                  </>
                )}
              </Badge>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="px-6 py-8">
        {/* Permanent Match - Show if locked */}
        {dashboardData.isLocked && dashboardData.permanentMatch && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/50 shadow-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-white text-2xl flex items-center justify-center">
                  <Heart className="h-6 w-6 mr-3 text-pink-400" />
                  Congratulations! You're Matched!
                  <Heart className="h-6 w-6 ml-3 text-pink-400" />
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex justify-center mb-6">
                  <Avatar className="h-32 w-32 ring-4 ring-pink-500/50">
                    <AvatarImage src={dashboardData.permanentMatch.female_user.profile_photo} />
                    <AvatarFallback className="text-4xl bg-gradient-to-br from-pink-500 to-purple-500 text-white">
                      {dashboardData.permanentMatch.female_user.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <h2 className="text-3xl font-bold text-white mb-2">
                  {dashboardData.permanentMatch.female_user.full_name}
                </h2>
                <p className="text-xl text-gray-300 mb-4">
                  {dashboardData.permanentMatch.female_user.age} years • {dashboardData.permanentMatch.female_user.university}
                </p>
                
                <div className="bg-black/40 rounded-lg p-6 mb-6">
                  <p className="text-gray-300 mb-4">{dashboardData.permanentMatch.female_user.bio}</p>
                  {dashboardData.permanentMatch.female_user.instagram && (
                    <div className="flex items-center justify-center">
                      <Instagram className="h-5 w-5 mr-2 text-pink-400" />
                      <span className="text-pink-400 font-medium">
                        @{dashboardData.permanentMatch.female_user.instagram}
                      </span>
                    </div>
                  )}
                </div>
                
                <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/50 text-lg px-4 py-2">
                  <Gift className="h-4 w-4 mr-2" />
                  Match confirmed on {new Date(dashboardData.permanentMatch.created_at).toLocaleDateString()}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Active Decision Timer */}
        {dashboardData.hasActiveDecision && dashboardData.currentTempMatch && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center justify-center">
                  <Timer className="h-6 w-6 mr-3 text-yellow-400" />
                  Decision Time: {timeLeft}
                  <Timer className="h-6 w-6 ml-3 text-yellow-400" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <Avatar className="h-24 w-24 mx-auto mb-4 ring-4 ring-yellow-500/50">
                    <AvatarImage src={dashboardData.currentTempMatch.female_user.profile_photo} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
                      {dashboardData.currentTempMatch.female_user.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {dashboardData.currentTempMatch.female_user.full_name}
                  </h3>
                  <p className="text-gray-300 mb-4">
                    {dashboardData.currentTempMatch.female_user.age} years • {dashboardData.currentTempMatch.female_user.university}
                  </p>
                  
                  <Button
                    onClick={() => openProfileDialog(dashboardData.currentTempMatch!.female_user)}
                    variant="outline"
                    className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 mb-6"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Full Profile
                  </Button>
                </div>
                
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={handleConfirmMatch}
                    disabled={actionLoading === 'confirm'}
                    className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 text-lg"
                  >
                    {actionLoading === 'confirm' ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Heart className="h-5 w-5 mr-2" />
                    )}
                    Confirm Match
                  </Button>
                  
                  {dashboardData.canRequestRound2 && (
                    <Button
                      onClick={handleRequestRound2}
                      disabled={actionLoading === 'round2'}
                      variant="outline"
                      className="border-blue-500 text-blue-400 hover:bg-blue-500/10 px-8 py-3 text-lg"
                    >
                      {actionLoading === 'round2' ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400 mr-2"></div>
                      ) : (
                        <SkipForward className="h-5 w-5 mr-2" />
                      )}
                      Join Round 2
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Assigned Profiles */}
        {!dashboardData.isLocked && dashboardData.canReveal && dashboardData.assignedProfiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-black/40 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center">
                  <Sparkles className="h-6 w-6 mr-3 text-blue-400" />
                  Your Assigned Profiles ({dashboardData.assignedProfiles.length})
                </CardTitle>
                <p className="text-gray-400">Choose one profile as your final match. Other profiles will be hidden.</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dashboardData.assignedProfiles.map((assignment) => (
                    <AssignedProfileCard
                      key={assignment.id}
                      assignment={assignment}
                      onReveal={() => handleRevealProfile(assignment.id)}
                      onViewProfile={() => openProfileDialog(assignment.female_user)}
                      loading={actionLoading === 'select'}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Waiting State */}
        {!dashboardData.isLocked && !dashboardData.hasActiveDecision && dashboardData.assignedProfiles.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Card className="bg-black/40 backdrop-blur-xl border-white/10">
              <CardContent className="py-16">
                <Hourglass className="h-16 w-16 text-blue-400 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-white mb-4">Waiting for Assignments</h2>
                <p className="text-gray-400 text-lg mb-6">
                  Our admin team is carefully selecting profiles for you. You'll be notified when your matches are ready!
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="text-center">
                    <Target className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                    <h3 className="text-white font-medium mb-2">Personalized Matching</h3>
                    <p className="text-gray-400 text-sm">We match you based on your preferences and compatibility</p>
                  </div>
                  
                  <div className="text-center">
                    <Award className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                    <h3 className="text-white font-medium mb-2">Quality Profiles</h3>
                    <p className="text-gray-400 text-sm">All profiles are verified and genuine for the best experience</p>
                  </div>
                  
                  <div className="text-center">
                    <Coffee className="h-12 w-12 text-green-400 mx-auto mb-3" />
                    <h3 className="text-white font-medium mb-2">Perfect Timing</h3>
                    <p className="text-gray-400 text-sm">Matches are assigned at the optimal time for connections</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Profile Detail Dialog */}
        <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
          <DialogContent className="max-w-2xl bg-gray-900/95 backdrop-blur-xl border border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-400" />
                <span>Profile Details</span>
              </DialogTitle>
            </DialogHeader>
            
            {selectedProfile && (
              <div className="space-y-6">
                <div className="text-center">
                  <Avatar className="h-32 w-32 mx-auto mb-4 ring-4 ring-blue-500/50">
                    <AvatarImage src={selectedProfile.profile_photo} />
                    <AvatarFallback className="text-4xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {selectedProfile.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {selectedProfile.full_name}
                  </h2>
                  
                  <div className="flex items-center justify-center space-x-4 text-gray-300 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {selectedProfile.age} years
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {selectedProfile.university}
                    </div>
                  </div>
                </div>
                
                <div className="bg-black/40 rounded-lg p-6">
                  <h3 className="text-white font-medium mb-3">About</h3>
                  <p className="text-gray-300">{selectedProfile.bio}</p>
                </div>
                
                {selectedProfile.instagram && (
                  <div className="bg-black/40 rounded-lg p-6">
                    <div className="flex items-center">
                      <Instagram className="h-5 w-5 mr-2 text-pink-400" />
                      <span className="text-white font-medium mr-2">Instagram:</span>
                      <span className="text-pink-400">@{selectedProfile.instagram}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

// Assigned Profile Card Component
function AssignedProfileCard({ assignment, onReveal, onViewProfile, loading }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 hover:border-white/30 transition-all duration-300"
    >
      <div className="text-center mb-4">
        <Avatar className="h-20 w-20 mx-auto mb-4 ring-4 ring-blue-500/50">
          <AvatarImage src={assignment.female_user.profile_photo} />
          <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
            {assignment.female_user.full_name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        
        <h3 className="text-white font-medium text-lg">
          {assignment.female_user.full_name}
        </h3>
        <p className="text-gray-400 text-sm">
          {assignment.female_user.age} years • {assignment.female_user.university}
        </p>
      </div>
      
      <div className="space-y-3">
        <Button
          onClick={onViewProfile}
          variant="outline"
          className="w-full border-white/30 text-white hover:bg-white/10"
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview Profile
        </Button>
        
        <Button
          onClick={onReveal}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {loading ? 'Selecting...' : 'Select as Final Match'}
        </Button>
      </div>
    </motion.div>
  )
}

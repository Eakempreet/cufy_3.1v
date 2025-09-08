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
  Star,
  MapPin,
  Calendar,
  Instagram,
  BookOpen,
  Users,
  AlertTriangle,
  Sparkles,
  User,
  Gift,
  Coffee,
  UserCheck,
  Activity,
  TrendingUp,
  Award,
  Target,
  Crown
} from 'lucide-react'

interface MaleProfile {
  id: string
  full_name: string
  age: number
  university: string
  profile_photo: string
  bio: string
  instagram: string
  tempMatchId?: string
  selectedAt?: string
  expiresAt?: string
  permMatchId?: string
  matchedAt?: string
}

interface FemaleDashboardData {
  user: any
  maleProfiles: MaleProfile[]
  permanentMatches: MaleProfile[]
}

export default function GirlsDashboard() {
  const { data: session } = useSession()
  const [dashboardData, setDashboardData] = useState<FemaleDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedProfile, setSelectedProfile] = useState<MaleProfile | null>(null)
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)

  // Fetch dashboard data
  const fetchDashboard = useCallback(async () => {
    if (!session?.user?.email) return
    
    try {
      const response = await fetch(`/api/dashboard?userId=${session.user.email}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.type === 'female') {
          setDashboardData(data.dashboard)
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }, [session?.user?.email])

  // Initial load
  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  // Auto refresh every 30 seconds to get real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboard()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [fetchDashboard])

  // Open profile dialog
  const openProfileDialog = (profile: MaleProfile) => {
    setSelectedProfile(profile)
    setProfileDialogOpen(true)
  }

  // Calculate time remaining for each temporary match
  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime()
    const expiry = new Date(expiresAt).getTime()
    const difference = expiry - now

    if (difference > 0) {
      const hours = Math.floor(difference / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      return `${hours}h ${minutes}m remaining`
    } else {
      return 'Decision time expired'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-pink-900/20 to-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-gray-600 border-t-pink-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Loading your dashboard...</p>
        </motion.div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-pink-900/20 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-yellow-400" />
          <h1 className="text-2xl font-bold mb-2">Dashboard Not Available</h1>
          <p className="text-gray-400">Please complete your registration to access the dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-pink-900/20 to-black">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-black/95 backdrop-blur-xl border-b border-pink-500/20 sticky top-0 z-40"
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Your Admirers</h1>
                  <p className="text-gray-400 text-sm">See who has chosen you as their match</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/50">
                <Users className="h-3 w-3 mr-1" />
                Read-Only Dashboard
              </Badge>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="px-6 py-8">
        {/* Permanent Matches */}
        {dashboardData.permanentMatches && dashboardData.permanentMatches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white text-2xl flex items-center justify-center">
                  <Heart className="h-6 w-6 mr-3 text-pink-400" />
                  Your Confirmed Matches ({dashboardData.permanentMatches.length})
                  <Heart className="h-6 w-6 ml-3 text-pink-400" />
                </CardTitle>
                <p className="text-center text-gray-300">These users have confirmed their match with you!</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dashboardData.permanentMatches.map((match) => (
                    <PermanentMatchCard
                      key={match.permMatchId}
                      match={match}
                      onViewProfile={() => openProfileDialog(match)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Male Profiles Who Selected You */}
        {dashboardData.maleProfiles && dashboardData.maleProfiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-black/40 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center">
                  <Timer className="h-6 w-6 mr-3 text-yellow-400" />
                  Currently Deciding ({dashboardData.maleProfiles.length})
                </CardTitle>
                <p className="text-gray-400">These users have selected you and are currently making their decision</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dashboardData.maleProfiles.map((profile) => (
                    <MaleProfileCard
                      key={profile.tempMatchId}
                      profile={profile}
                      onViewProfile={() => openProfileDialog(profile)}
                      timeRemaining={profile.expiresAt ? getTimeRemaining(profile.expiresAt) : ''}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Empty State */}
        {(!dashboardData.maleProfiles || dashboardData.maleProfiles.length === 0) && 
         (!dashboardData.permanentMatches || dashboardData.permanentMatches.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Card className="bg-black/40 backdrop-blur-xl border-white/10">
              <CardContent className="py-16">
                <Heart className="h-16 w-16 text-pink-400 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-white mb-4">No Admirers Yet</h2>
                <p className="text-gray-400 text-lg mb-6">
                  Don't worry! Your perfect match might be just around the corner. Users are being carefully matched right now.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="text-center">
                    <Sparkles className="h-12 w-12 text-pink-400 mx-auto mb-3" />
                    <h3 className="text-white font-medium mb-2">Quality Over Quantity</h3>
                    <p className="text-gray-400 text-sm">We focus on meaningful connections rather than just numbers</p>
                  </div>
                  
                  <div className="text-center">
                    <UserCheck className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                    <h3 className="text-white font-medium mb-2">Verified Profiles</h3>
                    <p className="text-gray-400 text-sm">All users go through a verification process for authenticity</p>
                  </div>
                  
                  <div className="text-center">
                    <Target className="h-12 w-12 text-green-400 mx-auto mb-3" />
                    <h3 className="text-white font-medium mb-2">Perfect Timing</h3>
                    <p className="text-gray-400 text-sm">Matches happen when both parties are ready for connections</p>
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
                  
                  {selectedProfile.matchedAt && (
                    <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/50 mb-4">
                      <Gift className="h-3 w-3 mr-1" />
                      Matched on {new Date(selectedProfile.matchedAt).toLocaleDateString()}
                    </Badge>
                  )}
                  
                  {selectedProfile.expiresAt && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 mb-4">
                      <Timer className="h-3 w-3 mr-1" />
                      {getTimeRemaining(selectedProfile.expiresAt)}
                    </Badge>
                  )}
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

// Male Profile Card Component (for temporary matches)
function MaleProfileCard({ profile, onViewProfile, timeRemaining }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 hover:border-white/30 transition-all duration-300"
    >
      <div className="text-center mb-4">
        <Avatar className="h-20 w-20 mx-auto mb-4 ring-4 ring-yellow-500/50">
          <AvatarImage src={profile.profile_photo} />
          <AvatarFallback className="text-2xl bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
            {profile.full_name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        
        <h3 className="text-white font-medium text-lg">
          {profile.full_name}
        </h3>
        <p className="text-gray-400 text-sm">
          {profile.age} years • {profile.university}
        </p>
        
        {timeRemaining && (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 mt-2">
            <Timer className="h-3 w-3 mr-1" />
            {timeRemaining}
          </Badge>
        )}
      </div>
      
      <div className="space-y-3">
        <Button
          onClick={onViewProfile}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          <Eye className="h-4 w-4 mr-2" />
          View Profile
        </Button>
        
        <div className="text-center">
          <p className="text-gray-400 text-xs">
            Selected you on {new Date(profile.selectedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// Permanent Match Card Component
function PermanentMatchCard({ match, onViewProfile }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/50 rounded-xl p-6 hover:border-pink-500/70 transition-all duration-300"
    >
      <div className="text-center mb-4">
        <Avatar className="h-20 w-20 mx-auto mb-4 ring-4 ring-pink-500/50">
          <AvatarImage src={match.profile_photo} />
          <AvatarFallback className="text-2xl bg-gradient-to-br from-pink-500 to-purple-500 text-white">
            {match.full_name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        
        <h3 className="text-white font-medium text-lg">
          {match.full_name}
        </h3>
        <p className="text-gray-300 text-sm">
          {match.age} years • {match.university}
        </p>
        
        <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/50 mt-2">
          <Heart className="h-3 w-3 mr-1" />
          Confirmed Match
        </Badge>
      </div>
      
      <div className="space-y-3">
        <Button
          onClick={onViewProfile}
          className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
        >
          <Eye className="h-4 w-4 mr-2" />
          View Profile
        </Button>
        
        <div className="text-center">
          <p className="text-gray-400 text-xs">
            Matched on {new Date(match.matchedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

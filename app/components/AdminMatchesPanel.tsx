'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  Crown, 
  Heart, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  User,
  Eye,
  X,
  Target,
  UserX,
  RefreshCw,
  Plus,
  Filter,
  Timer,
  Hourglass,
  Ban,
  RotateCcw,
  Star,
  Calendar,
  MapPin,
  Mail,
  Instagram,
  Trash2,
  UserCheck,
  PlayCircle,
  PauseCircle,
  StopCircle,
  SkipForward,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  Activity,
  Shield,
  Zap,
  Search,
  SlidersHorizontal,
  XCircle
} from 'lucide-react'

interface EnhancedMaleUser {
  id: string
  full_name: string
  email: string
  age: number
  university: string
  profile_photo: string
  subscription_type: 'basic' | 'premium'
  payment_confirmed: boolean
  current_round: number
  round_1_completed: boolean
  round_2_completed: boolean
  decision_timer_active: boolean
  decision_timer_expires_at: string | null
  decision_timer_started_at: string | null
  temp_match_id: string | null
  permanent_match_id: string | null
  match_confirmed_at: string | null
  last_activity_at: string
  created_at: string
  assignments: any[]
  assignedCount: number
  revealedCount: number
  disengagedCount: number
  maxAssignments: number
  availableSlots: number
  selectedAssignment: any
  currentTempMatch: any
  permanentMatch: any
  hasActiveTimer: boolean
  timeRemaining: number | null
  decisionExpiresAt: string | null
  roundInfo: {
    current: number
    round1Completed: boolean
    round2Completed: boolean
    canProgressToRound2: boolean
  }
  status: 'waiting' | 'assigned' | 'deciding' | 'temporary_match' | 'permanently_matched'
}

interface EnhancedFemaleUser {
  id: string
  full_name: string
  email: string
  age: number
  university: string
  profile_photo: string
  bio: string
  instagram: string
  created_at: string
  currentlyAssignedCount: number
  assignedCount: number
  totalAssignedCount: number
  selectedCount: number
  revealedCount: number
  permanentMatchCount: number
  currentAssignments: any[]
  currentTempMatches: any[]
  lastAssignedAt: string | null
}

interface MatchStatistics {
  premiumUsers: number
  basicUsers: number
  assignedUsers: number
  waitingUsers: number
  matchedUsers: number
}

export default function AdminMatchesPanel() {
  // Core state
  const [maleUsers, setMaleUsers] = useState<EnhancedMaleUser[]>([])
  const [femaleUsers, setFemaleUsers] = useState<EnhancedFemaleUser[]>([])
  const [statistics, setStatistics] = useState<MatchStatistics>({
    premiumUsers: 0,
    basicUsers: 0,
    assignedUsers: 0,
    waitingUsers: 0,
    matchedUsers: 0
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  // UI state
  const [selectedPlanType, setSelectedPlanType] = useState<'all' | 'premium' | 'basic'>('all')
  const [selectedMaleUser, setSelectedMaleUser] = useState<EnhancedMaleUser | null>(null)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedAssignSlot, setSelectedAssignSlot] = useState<1 | 2 | 3>(1)
  const [assignLoading, setAssignLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>('all')
  const [assignmentStatusFilter, setAssignmentStatusFilter] = useState<string>('all')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [femaleSearchTerm, setFemaleSearchTerm] = useState('')
  const [universityFilter, setUniversityFilter] = useState<string>('all')
  const [assignDialogSearchTerm, setAssignDialogSearchTerm] = useState('')

  // Fetch matches data
  const fetchMatchesData = useCallback(async (forceRefresh = false) => {
    try {
      if (!forceRefresh && !refreshing) {
        setRefreshing(true)
      }
      
      const response = await fetch(`/api/admin/matches?planType=${selectedPlanType}`)
      if (response.ok) {
        const data = await response.json()
        setMaleUsers(data.maleUsers || [])
        setFemaleUsers(data.femaleUsers || [])
        setStatistics(data.statistics || {
          premiumUsers: 0,
          basicUsers: 0,
          assignedUsers: 0,
          waitingUsers: 0,
          matchedUsers: 0
        })
      } else {
        console.error('Failed to fetch matches data')
      }
    } catch (error) {
      console.error('Error fetching matches data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [selectedPlanType, refreshing])

  // Initial load
  useEffect(() => {
    fetchMatchesData()
  }, [fetchMatchesData])

  // Handle plan type change
  useEffect(() => {
    if (!loading) {
      fetchMatchesData(true)
    }
  }, [selectedPlanType])

  // Filtered data computed properties
  const filteredMaleUsers = useMemo(() => {
    return maleUsers.filter(user => {
      // Search filter
      if (searchTerm && !user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !user.email.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !user.university.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Subscription filter
      if (subscriptionFilter !== 'all' && user.subscription_type !== subscriptionFilter) {
        return false
      }

      // Status filter
      if (statusFilter !== 'all' && user.status !== statusFilter) {
        return false
      }

      // Assignment status filter
      if (assignmentStatusFilter !== 'all') {
        if (assignmentStatusFilter === 'has_assignments' && user.assignedCount === 0) return false
        if (assignmentStatusFilter === 'no_assignments' && user.assignedCount > 0) return false
        if (assignmentStatusFilter === 'full_assignments' && user.assignedCount < user.maxAssignments) return false
        if (assignmentStatusFilter === 'partial_assignments' && 
            (user.assignedCount === 0 || user.assignedCount >= user.maxAssignments)) return false
      }

      // University filter
      if (universityFilter !== 'all' && user.university !== universityFilter) {
        return false
      }

      return true
    })
  }, [maleUsers, searchTerm, subscriptionFilter, statusFilter, assignmentStatusFilter, universityFilter])

  const filteredFemaleUsers = useMemo(() => {
    return femaleUsers.filter(user => {
      // Female search filter
      if (femaleSearchTerm && !user.full_name.toLowerCase().includes(femaleSearchTerm.toLowerCase()) && 
          !user.email.toLowerCase().includes(femaleSearchTerm.toLowerCase()) &&
          !user.university.toLowerCase().includes(femaleSearchTerm.toLowerCase())) {
        return false
      }

      // University filter
      if (universityFilter !== 'all' && user.university !== universityFilter) {
        return false
      }

      return true
    })
  }, [femaleUsers, femaleSearchTerm, universityFilter])

  // Get unique universities for filter
  const universities = useMemo(() => {
    const allUniversities = [...maleUsers, ...femaleUsers].map(user => user.university)
    return Array.from(new Set(allUniversities)).sort()
  }, [maleUsers, femaleUsers])

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('')
    setFemaleSearchTerm('')
    setStatusFilter('all')
    setSubscriptionFilter('all')
    setAssignmentStatusFilter('all')
    setUniversityFilter('all')
    setAssignDialogSearchTerm('')
  }

  // Handle assign profile
  const handleAssignProfile = async (maleUserId: string, femaleUserId: string) => {
    try {
      setAssignLoading(true)
      
      const response = await fetch('/api/admin/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign_profile',
          maleUserId,
          femaleUserId,
          data: { round: 1 }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        await fetchMatchesData(true)
        setAssignDialogOpen(false)
        alert('Profile assigned successfully!')
      } else {
        alert(result.error || 'Failed to assign profile')
      }
    } catch (error) {
      console.error('Error assigning profile:', error)
      alert('An error occurred while assigning profile')
    } finally {
      setAssignLoading(false)
    }
  }

  // Handle user actions
  const handleUserAction = async (action: string, maleUserId: string, femaleUserId?: string) => {
    try {
      setActionLoading(`${action}-${maleUserId}`)
      
      const response = await fetch('/api/admin/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          maleUserId,
          femaleUserId
        })
      })

      const result = await response.json()
      
      if (result.success) {
        await fetchMatchesData(true)
        alert(result.message || 'Action completed successfully!')
      } else {
        alert(result.error || 'Action failed')
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error)
      alert('An error occurred while performing action')
    } finally {
      setActionLoading(null)
    }
  }

  // Open assign dialog
  const openAssignDialog = (maleUser: EnhancedMaleUser, slot: 1 | 2 | 3) => {
    setSelectedMaleUser(maleUser)
    setSelectedAssignSlot(slot)
    setAssignDialogSearchTerm('') // Clear search when opening dialog
    setAssignDialogOpen(true)
  }

  // Get available female users for assignment (exclude already assigned to this male user)
  const getAvailableFemaleUsers = (maleUser: EnhancedMaleUser) => {
    const assignedFemaleIds = maleUser.assignments.map(a => a.female_user_id)
    const disengagedFemaleIds = maleUser.assignments
      .filter(a => a.status === 'disengaged')
      .map(a => a.female_user_id)
    
    return filteredFemaleUsers.filter(female => {
      // Exclude already assigned and disengaged
      if (assignedFemaleIds.includes(female.id) || disengagedFemaleIds.includes(female.id)) {
        return false
      }
      
      // Apply assignment dialog search filter
      if (assignDialogSearchTerm && 
          !female.full_name.toLowerCase().includes(assignDialogSearchTerm.toLowerCase()) && 
          !female.email.toLowerCase().includes(assignDialogSearchTerm.toLowerCase()) &&
          !female.university.toLowerCase().includes(assignDialogSearchTerm.toLowerCase()) &&
          !female.bio.toLowerCase().includes(assignDialogSearchTerm.toLowerCase())) {
        return false
      }
      
      return true
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-gray-600 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Loading Matches Panel...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Matches Management</h1>
          <p className="text-gray-400">Assign and manage profile matches for premium and basic users</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={selectedPlanType} onValueChange={(value: any) => setSelectedPlanType(value)}>
            <SelectTrigger className="w-48 bg-white/5 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="premium">Premium (₹249)</SelectItem>
              <SelectItem value="basic">Basic (₹99)</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            onClick={() => fetchMatchesData(true)}
            disabled={refreshing}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <Card className="bg-black/40 backdrop-blur-xl border-white/10">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Main Search Bar */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search male users by name, email, or university..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <Button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {(statusFilter !== 'all' || subscriptionFilter !== 'all' || assignmentStatusFilter !== 'all' || universityFilter !== 'all') && (
                  <Badge className="ml-2 bg-blue-500/20 text-blue-400 border-blue-500/50">
                    Active
                  </Badge>
                )}
              </Button>
              
              {(searchTerm || statusFilter !== 'all' || subscriptionFilter !== 'all' || assignmentStatusFilter !== 'all' || universityFilter !== 'all' || femaleSearchTerm || assignDialogSearchTerm) && (
                <Button
                  onClick={clearAllFilters}
                  variant="outline"
                  size="sm"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
              {showAdvancedFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 border-t border-white/10 pt-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Status Filter */}
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Status</label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="waiting">Waiting</SelectItem>
                          <SelectItem value="assigned">Assigned</SelectItem>
                          <SelectItem value="temporary_match">Temporary Match</SelectItem>
                          <SelectItem value="permanently_matched">Permanently Matched</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Subscription Filter */}
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Subscription</label>
                      <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Plans</SelectItem>
                          <SelectItem value="premium">Premium (₹249)</SelectItem>
                          <SelectItem value="basic">Basic (₹99)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Assignment Status Filter */}
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Assignments</label>
                      <Select value={assignmentStatusFilter} onValueChange={setAssignmentStatusFilter}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Assignment States</SelectItem>
                          <SelectItem value="no_assignments">No Assignments</SelectItem>
                          <SelectItem value="partial_assignments">Partial Assignments</SelectItem>
                          <SelectItem value="full_assignments">Full Assignments</SelectItem>
                          <SelectItem value="has_assignments">Has Assignments</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* University Filter */}
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">University</label>
                      <Select value={universityFilter} onValueChange={setUniversityFilter}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Universities</SelectItem>
                          {universities.map((university) => (
                            <SelectItem key={university} value={university}>
                              {university}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Female Users Search */}
                  <div className="border-t border-white/10 pt-4">
                    <label className="text-sm text-gray-400 mb-2 block">Search Female Users (for assignment)</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search female users by name, email, or university..."
                        value={femaleSearchTerm}
                        onChange={(e) => setFemaleSearchTerm(e.target.value)}
                        className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400"
                      />
                      {femaleSearchTerm && (
                        <button
                          onClick={() => setFemaleSearchTerm('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filter Results Summary */}
                  <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                    <div className="text-sm text-gray-300">
                      Showing <span className="text-white font-medium">{filteredMaleUsers.length}</span> of <span className="text-white font-medium">{maleUsers.length}</span> male users
                      {filteredFemaleUsers.length !== femaleUsers.length && (
                        <span className="ml-2">
                          • <span className="text-white font-medium">{filteredFemaleUsers.length}</span> of <span className="text-white font-medium">{femaleUsers.length}</span> female users
                        </span>
                      )}
                    </div>
                    
                    {(searchTerm || statusFilter !== 'all' || subscriptionFilter !== 'all' || assignmentStatusFilter !== 'all' || universityFilter !== 'all' || femaleSearchTerm || assignDialogSearchTerm) && (
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                          Filters Active
                        </Badge>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="bg-black/40 backdrop-blur-xl border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Premium Users</p>
                <p className="text-2xl font-bold text-purple-400 mt-1">{statistics.premiumUsers}</p>
              </div>
              <Crown className="h-8 w-8 text-purple-400/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/40 backdrop-blur-xl border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Basic Users</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">{statistics.basicUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/40 backdrop-blur-xl border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Assigned Users</p>
                <p className="text-2xl font-bold text-green-400 mt-1">{statistics.assignedUsers}</p>
              </div>
              <Target className="h-8 w-8 text-green-400/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/40 backdrop-blur-xl border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Waiting Users</p>
                <p className="text-2xl font-bold text-yellow-400 mt-1">{statistics.waitingUsers}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/40 backdrop-blur-xl border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Matched Users</p>
                <p className="text-2xl font-bold text-pink-400 mt-1">{statistics.matchedUsers}</p>
              </div>
              <Heart className="h-8 w-8 text-pink-400/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Premium Users Section */}
      {(selectedPlanType === 'all' || selectedPlanType === 'premium') && (
        <Card className="bg-black/40 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Crown className="h-6 w-6 mr-3 text-purple-400" />
              Premium Users (₹249) - {filteredMaleUsers.filter(u => u.subscription_type === 'premium').length}
              <div className="ml-4 space-x-2">
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                  Round 1: 2 Options
                </Badge>
                <Badge className="bg-purple-600/20 text-purple-300 border-purple-600/50">
                  Round 2: 3 Options
                </Badge>
              </div>
            </CardTitle>
            <div className="text-gray-400 text-sm mt-2">
              📋 Premium users get 2 profiles in Round 1, then 3 profiles in Round 2. 
              🎯 User selects 1 profile → 48hr timer starts → Other profiles hidden.
              ⚠️ Disengage option available with warning.
            </div>
          </CardHeader>
          <CardContent>
            <PremiumUsersTable 
              users={filteredMaleUsers.filter(u => u.subscription_type === 'premium')}
              onAssignProfile={openAssignDialog}
              onUserAction={handleUserAction}
              actionLoading={actionLoading}
            />
          </CardContent>
        </Card>
      )}

      {/* Basic Users Section */}
      {(selectedPlanType === 'all' || selectedPlanType === 'basic') && (
        <Card className="bg-black/40 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="h-6 w-6 mr-3 text-blue-400" />
              Basic Users (₹99) - {filteredMaleUsers.filter(u => u.subscription_type === 'basic').length}
              <div className="ml-4 space-x-2">
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                  Round 1: 1 Option
                </Badge>
                <Badge className="bg-blue-600/20 text-blue-300 border-blue-600/50">
                  Round 2: 1 Option
                </Badge>
              </div>
            </CardTitle>
            <div className="text-gray-400 text-sm mt-2">
              📋 Basic users get 1 profile per round. 
              🎯 User selects profile → 48hr timer starts. 
              ⚠️ Disengage option available with warning.
            </div>
          </CardHeader>
          <CardContent>
            <BasicUsersTable 
              users={filteredMaleUsers.filter(u => u.subscription_type === 'basic')}
              onAssignProfile={openAssignDialog}
              onUserAction={handleUserAction}
              actionLoading={actionLoading}
            />
          </CardContent>
        </Card>
      )}

      {/* Assign Profile Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] bg-gray-900/95 backdrop-blur-xl border border-gray-700 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-400" />
              <span>Assign Female Profile - Slot {selectedAssignSlot}</span>
            </DialogTitle>
            {selectedMaleUser && (
              <div className="text-gray-400 text-sm">
                Assigning to: {selectedMaleUser.full_name} ({selectedMaleUser.subscription_type} plan)
              </div>
            )}
          </DialogHeader>
          
          {selectedMaleUser && (
            <div className="space-y-4">
              {/* Assignment Dialog Search Bar */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search female profiles by name, email, university, or bio..."
                      value={assignDialogSearchTerm}
                      onChange={(e) => setAssignDialogSearchTerm(e.target.value)}
                      className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400"
                    />
                    {assignDialogSearchTerm && (
                      <button
                        onClick={() => setAssignDialogSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-300">
                    <span className="text-white font-medium">
                      {getAvailableFemaleUsers(selectedMaleUser).length}
                    </span>
                    {assignDialogSearchTerm ? 
                      ` matching profiles` : 
                      ` available profiles`
                    }
                  </div>
                </div>
                
                {assignDialogSearchTerm && getAvailableFemaleUsers(selectedMaleUser).length === 0 && (
                  <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-yellow-400 mr-2" />
                      <span className="text-yellow-300 text-sm">
                        No profiles match your search. Try different keywords or clear the search.
                      </span>
                    </div>
                  </div>
                )}
                
                {assignDialogSearchTerm && (
                  <div className="mt-2 text-xs text-gray-400">
                    💡 Tip: Search by name, university, interests in bio, or any keyword
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {getAvailableFemaleUsers(selectedMaleUser).map((female) => (
                  <FemaleProfileCard 
                    key={female.id}
                    female={female}
                    onAssign={() => handleAssignProfile(selectedMaleUser.id, female.id)}
                    loading={assignLoading}
                  />
                ))}
              </div>
              
              {getAvailableFemaleUsers(selectedMaleUser).length === 0 && !assignDialogSearchTerm && (
                <div className="text-center py-8">
                  <UserX className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-white font-medium">No available female profiles</p>
                  <p className="text-gray-400 text-sm">All female profiles have been assigned or disengaged by this user</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Premium Users Table Component
function PremiumUsersTable({ users, onAssignProfile, onUserAction, actionLoading }: any) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-white/5 border-b border-white/10">
          <tr>
            <th className="text-left p-4 text-white font-medium">User Details</th>
            <th className="text-left p-4 text-white font-medium">Round Info</th>
            <th className="text-left p-4 text-white font-medium">Assign Slot 1</th>
            <th className="text-left p-4 text-white font-medium">Assign Slot 2</th>
            <th className="text-left p-4 text-white font-medium">Assign Slot 3</th>
            <th className="text-left p-4 text-white font-medium">Selected/Timer</th>
            <th className="text-left p-4 text-white font-medium">Status</th>
            <th className="text-left p-4 text-white font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: EnhancedMaleUser, index: number) => (
            <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
              <td className="p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-white text-sm font-medium">{index + 1}</span>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.profile_photo} />
                    <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-medium">{user.full_name}</p>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                    <p className="text-gray-400 text-xs">{user.university}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50 text-xs">
                        <Crown className="h-2 w-2 mr-1" />
                        Premium
                      </Badge>
                    </div>
                  </div>
                </div>
              </td>
              
              {/* Round Information */}
              <td className="p-4">
                <RoundInfoDisplay user={user} />
              </td>
              
              {/* Assignment Slots - Only show for current round */}
              {user.current_round === 1 ? (
                <>
                  {/* Round 1: 2 slots for premium */}
                  {[1, 2].map((slot) => (
                    <td key={slot} className="p-4">
                      <AssignmentSlot 
                        user={user}
                        slot={slot}
                        onAssign={() => onAssignProfile(user, slot)}
                        onAction={onUserAction}
                        actionLoading={actionLoading}
                      />
                    </td>
                  ))}
                  <td className="p-4">
                    <span className="text-gray-400 text-sm">Round 2 Slot</span>
                  </td>
                </>
              ) : (
                <>
                  {/* Round 2: 3 slots for premium */}
                  {[1, 2, 3].map((slot) => (
                    <td key={slot} className="p-4">
                      <AssignmentSlot 
                        user={user}
                        slot={slot}
                        onAssign={() => onAssignProfile(user, slot)}
                        onAction={onUserAction}
                        actionLoading={actionLoading}
                      />
                    </td>
                  ))}
                </>
              )}
              
              {/* Selected Profile with Timer */}
              <td className="p-4">
                <SelectedProfileWithTimer user={user} onUserAction={onUserAction} actionLoading={actionLoading} />
              </td>
              
              {/* Status */}
              <td className="p-4">
                <UserStatusBadge user={user} />
              </td>
              
              {/* Actions */}
              <td className="p-4">
                <UserActionButtons 
                  user={user}
                  onAction={onUserAction}
                  actionLoading={actionLoading}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {users.length === 0 && (
        <div className="text-center py-8">
          <Crown className="h-12 w-12 text-purple-400 mx-auto mb-3" />
          <p className="text-white font-medium">No premium users found</p>
          <p className="text-gray-400 text-sm">Premium users will appear here once they confirm payment</p>
        </div>
      )}
    </div>
  )
}

// Basic Users Table Component
function BasicUsersTable({ users, onAssignProfile, onUserAction, actionLoading }: any) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-white/5 border-b border-white/10">
          <tr>
            <th className="text-left p-4 text-white font-medium">User Details</th>
            <th className="text-left p-4 text-white font-medium">Round Info</th>
            <th className="text-left p-4 text-white font-medium">Assign Slot</th>
            <th className="text-left p-4 text-white font-medium">Selected/Timer</th>
            <th className="text-left p-4 text-white font-medium">Status</th>
            <th className="text-left p-4 text-white font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: EnhancedMaleUser, index: number) => (
            <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
              <td className="p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-white text-sm font-medium">{index + 1}</span>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.profile_photo} />
                    <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-medium">{user.full_name}</p>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                    <p className="text-gray-400 text-xs">{user.university}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50 text-xs">
                        <Users className="h-2 w-2 mr-1" />
                        Basic
                      </Badge>
                    </div>
                  </div>
                </div>
              </td>
              
              {/* Round Information */}
              <td className="p-4">
                <RoundInfoDisplay user={user} />
              </td>
              
              {/* Single Assignment Slot */}
              <td className="p-4">
                <AssignmentSlot 
                  user={user}
                  slot={1}
                  onAssign={() => onAssignProfile(user, 1)}
                  onAction={onUserAction}
                  actionLoading={actionLoading}
                />
              </td>
              
              {/* Selected Profile with Timer */}
              <td className="p-4">
                <SelectedProfileWithTimer user={user} onUserAction={onUserAction} actionLoading={actionLoading} />
              </td>
              
              {/* Status */}
              <td className="p-4">
                <UserStatusBadge user={user} />
              </td>
              
              {/* Actions */}
              <td className="p-4">
                <UserActionButtons 
                  user={user}
                  onAction={onUserAction}
                  actionLoading={actionLoading}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {users.length === 0 && (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-blue-400 mx-auto mb-3" />
          <p className="text-white font-medium">No basic users found</p>
          <p className="text-gray-400 text-sm">Basic users will appear here once they confirm payment</p>
        </div>
      )}
    </div>
  )
}

// Round Info Display Component
function RoundInfoDisplay({ user }: { user: EnhancedMaleUser }) {
  const getRoundDisplay = () => {
    const maxForRound = user.subscription_type === 'premium' 
      ? (user.current_round === 1 ? 2 : 3)
      : 1
    
    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Badge className={`text-xs ${
            user.current_round === 1 
              ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
              : 'bg-green-500/20 text-green-400 border-green-500/50'
          }`}>
            Round {user.current_round}
          </Badge>
          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50 text-xs">
            Max {maxForRound}
          </Badge>
        </div>
        
        <div className="text-xs text-gray-400">
          R1: {user.round_1_completed ? '✅' : '⏳'} | 
          R2: {user.round_2_completed ? '✅' : user.current_round === 2 ? '⏳' : '⭕'}
        </div>
        
        {user.roundInfo.canProgressToRound2 && (
          <div className="text-xs text-yellow-400">
            🔄 Can progress to R2
          </div>
        )}
      </div>
    )
  }

  return getRoundDisplay()
}

// Assignment Slot Component with new logic
function AssignmentSlot({ user, slot, onAssign, onAction, actionLoading }: any) {
  // Get assignment for this specific slot in current round
  const currentRoundAssignments = user.assignments.filter((a: any) => 
    a.round_number === user.current_round && a.status === 'assigned'
  )
  const slotAssignment = currentRoundAssignments[slot - 1] // Get assignment for this slot
  
  // If user has selected a profile and timer is active, show that
  if (user.selectedAssignment && user.hasActiveTimer) {
    if (user.selectedAssignment.id === slotAssignment?.id) {
      return (
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.selectedAssignment.female_user?.profile_photo} />
            <AvatarFallback>S</AvatarFallback>
          </Avatar>
          <div className="text-xs">
            <div className="text-yellow-400 font-medium">Selected</div>
            <div className="text-gray-400">Timer Active</div>
          </div>
        </div>
      )
    } else {
      return (
        <div className="text-xs text-gray-500">
          Hidden (Timer active)
        </div>
      )
    }
  }
  
  // If there's an assignment in this slot
  if (slotAssignment) {
    return (
      <div className="flex items-center space-x-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={slotAssignment.female_user?.profile_photo} />
          <AvatarFallback>F</AvatarFallback>
        </Avatar>
        <Button
          onClick={() => onAction('select_profile', user.id, slotAssignment.female_user_id)}
          disabled={actionLoading === `select_profile-${user.id}` || user.hasActiveTimer}
          variant="outline"
          size="sm"
          className="border-green-500 text-green-400 hover:bg-green-500/10"
        >
          <PlayCircle className="h-3 w-3 mr-1" />
          Select
        </Button>
      </div>
    )
  }
  
  // If can assign more profiles and slot is available
  if (user.availableSlots > 0 && slot <= user.maxAssignments) {
    return (
      <Button
        onClick={onAssign}
        variant="outline"
        size="sm"
        className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
        disabled={user.hasActiveTimer}
      >
        <Plus className="h-3 w-3 mr-1" />
        Assign
      </Button>
    )
  }
  
  return (
    <span className="text-gray-400 text-sm">
      {slot > user.maxAssignments ? 'N/A' : 'Empty'}
    </span>
  )
}

// Selected Profile with Timer Component
function SelectedProfileWithTimer({ user, onUserAction, actionLoading }: any) {
  const [timeLeft, setTimeLeft] = useState<string>('')

  useEffect(() => {
    if (user.hasActiveTimer && user.decisionExpiresAt) {
      const interval = setInterval(() => {
        const now = new Date().getTime()
        const expires = new Date(user.decisionExpiresAt).getTime()
        const remaining = expires - now

        if (remaining > 0) {
          const hours = Math.floor(remaining / (1000 * 60 * 60))
          const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((remaining % (1000 * 60)) / 1000)
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
        } else {
          setTimeLeft('EXPIRED')
          clearInterval(interval)
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [user.hasActiveTimer, user.decisionExpiresAt])

  if (user.permanentMatch) {
    return (
      <div className="flex items-center space-x-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.permanentMatch.female_user?.profile_photo} />
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
        <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/50">
          <Heart className="h-2 w-2 mr-1" />
          Matched
        </Badge>
      </div>
    )
  }

  if (user.currentTempMatch) {
    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.currentTempMatch.female_user?.profile_photo} />
            <AvatarFallback>T</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="text-white text-sm font-medium">
              {user.currentTempMatch.female_user?.full_name}
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-xs">
              <Timer className="h-2 w-2 mr-1" />
              Auto Match Process
            </Badge>
          </div>
        </div>
      </div>
    )
  }

  if (user.selectedAssignment && user.hasActiveTimer) {
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.selectedAssignment.female_user?.profile_photo} />
            <AvatarFallback>S</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="text-white text-sm font-medium">
              {user.selectedAssignment.female_user?.full_name}
            </div>
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 text-xs">
              <Timer className="h-2 w-2 mr-1" />
              Decision Timer Active
            </Badge>
          </div>
        </div>
        
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-yellow-400 text-xs font-medium">Timer: Auto-confirm if no disengage</span>
            <div className="text-yellow-300 text-sm font-mono">{timeLeft}</div>
          </div>
          <Progress 
            value={user.timeRemaining ? Math.max(0, (user.timeRemaining / (48 * 60 * 60 * 1000)) * 100) : 0} 
            className="h-2"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => onUserAction('confirm_match', user.id, user.selectedAssignment.female_user_id)}
            disabled={actionLoading === `confirm_match-${user.id}`}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white text-xs"
          >
            <Heart className="h-3 w-3 mr-1" />
            Confirm Match
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-red-500 text-red-400 hover:bg-red-500/10 text-xs"
              >
                <UserX className="h-3 w-3 mr-1" />
                Disengage
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-gray-900 border-gray-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">⚠️ Confirm Disengagement</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400">
                  Are you sure you want to disengage? This will stop the timer and show other profiles again.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onUserAction('disengage_profile', user.id, user.selectedAssignment.female_user_id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Yes, Disengage
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    )
  }

  return <span className="text-gray-400 text-sm">No selection</span>
}

// User Status Badge Component
function UserStatusBadge({ user }: { user: EnhancedMaleUser }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'permanently_matched':
        return 'bg-pink-500/20 text-pink-400 border-pink-500/50'
      case 'temporary_match':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'deciding':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50'
      case 'assigned':
        return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'waiting':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'permanently_matched':
        return <Heart className="h-3 w-3 mr-1" />
      case 'temporary_match':
        return <Timer className="h-3 w-3 mr-1" />
      case 'deciding':
        return <Hourglass className="h-3 w-3 mr-1" />
      case 'assigned':
        return <CheckCircle className="h-3 w-3 mr-1" />
      case 'waiting':
        return <Clock className="h-3 w-3 mr-1" />
      default:
        return <AlertTriangle className="h-3 w-3 mr-1" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'permanently_matched':
        return 'Permanently Matched'
      case 'temporary_match':
        return 'Temporary Match'
      case 'deciding':
        return 'Making Decision'
      case 'assigned':
        return 'Has Assignments'
      case 'waiting':
        return 'Waiting for Assignment'
      default:
        return 'Unknown Status'
    }
  }

  return (
    <div className="space-y-1">
      <Badge className={getStatusColor(user.status)}>
        {getStatusIcon(user.status)}
        {getStatusText(user.status)}
      </Badge>
      
      {user.hasActiveTimer && user.decisionExpiresAt && (
        <div className="text-xs text-yellow-400">
          <Timer className="h-3 w-3 inline mr-1" />
          Expires: {new Date(user.decisionExpiresAt).toLocaleString()}
        </div>
      )}
      
      <div className="text-xs text-gray-400">
        {user.assignedCount}/{user.maxAssignments} assigned
      </div>
    </div>
  )
}

// User Action Buttons Component
function UserActionButtons({ user, onAction, actionLoading }: any) {
  return (
    <div className="flex flex-col space-y-2">
      {/* Progress to Round 2 */}
      {user.roundInfo.canProgressToRound2 && (
        <Button
          onClick={() => onAction('progress_to_round_2', user.id)}
          disabled={actionLoading === `progress_to_round_2-${user.id}`}
          variant="outline"
          size="sm"
          className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
        >
          <ArrowRight className="h-3 w-3 mr-1" />
          Round 2
        </Button>
      )}
      
      {/* Permanent Match Action */}
      {user.currentTempMatch && !user.hasActiveTimer && (
        <Button
          onClick={() => onAction('confirm_match', user.id, user.currentTempMatch.female_user_id)}
          disabled={actionLoading === `confirm_match-${user.id}`}
          variant="outline"
          size="sm"
          className="border-pink-500 text-pink-400 hover:bg-pink-500/10"
        >
          <Heart className="h-3 w-3 mr-1" />
          Confirm
        </Button>
      )}
      
      {/* Clear History */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="border-red-500 text-red-400 hover:bg-red-500/10"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-gray-900 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Reset User History</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This will permanently delete all assignments, matches, and reset the user to Round 1. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => onAction('clear_history', user.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Reset User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Female Profile Card Component
function FemaleProfileCard({ female, onAssign, loading }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all duration-300"
    >
      <div className="text-center mb-4">
        <Avatar className="h-16 w-16 mx-auto mb-3">
          <AvatarImage src={female.profile_photo} />
          <AvatarFallback>{female.full_name.charAt(0)}</AvatarFallback>
        </Avatar>
        <h3 className="text-white font-medium">{female.full_name}</h3>
        <p className="text-gray-400 text-sm">{female.age} years</p>
        <p className="text-gray-400 text-xs">{female.university}</p>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Currently Assigned:</span>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
            {female.currentlyAssignedCount}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Selected Count:</span>
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
            {female.selectedCount}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Permanent Matches:</span>
          <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/50">
            {female.permanentMatchCount}
          </Badge>
        </div>
      </div>
      
      <Button
        onClick={onAssign}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        ) : (
          <Plus className="h-4 w-4 mr-2" />
        )}
        {loading ? 'Assigning...' : 'Assign Profile'}
      </Button>
    </motion.div>
  )
}

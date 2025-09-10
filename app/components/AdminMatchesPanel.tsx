'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Cake,
  Info,
  UserCheck,
  PlayCircle,
  PauseCircle,
  GraduationCap,
  Activity,
  UserCircle,
  FileText,
  BarChart3,
  StopCircle,
  SkipForward,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  Shield,
  Zap,
  Search,
  SlidersHorizontal,
  XCircle,
  Settings,
  Database,
  Grid3X3,
  List,
  Maximize2,
  Minimize2
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
  is_active?: boolean
  currentlyAssignedCount: number
  assignedCount: number
  totalAssignedCount: number
  selectedCount: number
  revealedCount: number
  permanentMatchCount: number
  currentAssignments: any[]
  currentTempMatches: any[]
  assignments?: any[]
  lastAssignedAt: string | null
}

interface MatchStatistics {
  premiumUsers: number
  basicUsers: number
  assignedUsers: number
  waitingUsers: number
  matchedUsers: number
  permanentMatches: number
  tempMatches: number
  round1Users: number
  round2Users: number
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
    matchedUsers: 0,
    permanentMatches: 0,
    tempMatches: 0,
    round1Users: 0,
    round2Users: 0
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedFemaleUser, setSelectedFemaleUser] = useState<EnhancedFemaleUser | null>(null)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  
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

  // Debounced search terms for performance
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [debouncedFemaleSearchTerm, setDebouncedFemaleSearchTerm] = useState('')
  const [debouncedAssignDialogSearchTerm, setDebouncedAssignDialogSearchTerm] = useState('')

  // Debounce search terms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFemaleSearchTerm(femaleSearchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [femaleSearchTerm])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAssignDialogSearchTerm(assignDialogSearchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [assignDialogSearchTerm])

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
          matchedUsers: 0,
          permanentMatches: 0,
          tempMatches: 0,
          round1Users: 0,
          round2Users: 0
        })

        // Calculate enhanced statistics from the data
        if (data.maleUsers) {
          const enhancedStats = {
            // Only count paid/confirmed users
            premiumUsers: data.maleUsers.filter((u: any) => 
              u.subscription_type === 'premium' && u.payment_confirmed === true
            ).length,
            basicUsers: data.maleUsers.filter((u: any) => 
              u.subscription_type === 'basic' && u.payment_confirmed === true
            ).length,
            // Users who have been assigned but haven't selected anyone yet
            assignedUsers: data.maleUsers.filter((u: any) => 
              u.assignedCount > 0 && !u.selectedAssignment && !u.currentTempMatch && !u.permanentMatch
            ).length,
            // Users waiting for assignment (payment confirmed but no assignments)
            waitingUsers: data.maleUsers.filter((u: any) => 
              u.payment_confirmed === true && u.assignedCount === 0
            ).length,
            // Users with successful matches (either temp or permanent)
            matchedUsers: data.maleUsers.filter((u: any) => 
              u.permanentMatch || u.currentTempMatch
            ).length,
            // Count of permanent matches only
            permanentMatches: data.maleUsers.filter((u: any) => 
              u.permanentMatch
            ).length,
            // Count of temporary matches (not yet permanent)
            tempMatches: data.maleUsers.filter((u: any) => 
              u.currentTempMatch && !u.permanentMatch
            ).length,
            // Users currently in round 1
            round1Users: data.maleUsers.filter((u: any) => 
              u.current_round === 1 && u.payment_confirmed === true
            ).length,
            // Users currently in round 2
            round2Users: data.maleUsers.filter((u: any) => 
              u.current_round === 2 && u.payment_confirmed === true
            ).length
          }
          setStatistics(enhancedStats)
        }
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

  // Handle view female profile
  const handleViewFemaleProfile = useCallback((female: EnhancedFemaleUser) => {
    setSelectedFemaleUser(female)
    setIsProfileDialogOpen(true)
  }, [])

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
      // Always show paid users, even if they have 'waiting' status after reset
      // Only exclude truly waiting users (those who haven't paid yet)
      if (user.status === 'waiting' && !user.payment_confirmed) {
        return false
      }

      // Search filter (debounced)
      if (debouncedSearchTerm && !user.full_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) && 
          !user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) &&
          !user.university.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) {
        return false
      }

      // Subscription filter
      if (subscriptionFilter !== 'all' && user.subscription_type !== subscriptionFilter) {
        return false
      }

      // Status filter - but allow reset users (with payment) to show regardless of status
      if (statusFilter !== 'all' && user.status !== statusFilter) {
        // Allow users with confirmed payment to show even if status doesn't match
        // This ensures reset users remain visible
        if (!user.payment_confirmed) {
          return false
        }
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
  }, [maleUsers, debouncedSearchTerm, subscriptionFilter, statusFilter, assignmentStatusFilter, universityFilter])

  const filteredFemaleUsers = useMemo(() => {
    return femaleUsers.filter(user => {
      // Female search filter (debounced)
      if (debouncedFemaleSearchTerm && !user.full_name.toLowerCase().includes(debouncedFemaleSearchTerm.toLowerCase()) && 
          !user.email.toLowerCase().includes(debouncedFemaleSearchTerm.toLowerCase()) &&
          !user.university.toLowerCase().includes(debouncedFemaleSearchTerm.toLowerCase())) {
        return false
      }

      // University filter
      if (universityFilter !== 'all' && user.university !== universityFilter) {
        return false
      }

      return true
    })
  }, [femaleUsers, debouncedFemaleSearchTerm, universityFilter])

  // Get unique universities for filter
  const universities = useMemo(() => {
    const allUniversities = [...maleUsers, ...femaleUsers].map(user => user.university)
    return Array.from(new Set(allUniversities)).sort()
  }, [maleUsers, femaleUsers])

  // Memoized filtered user counts for performance
  const filteredUserCounts = useMemo(() => {
    const premiumUsers = filteredMaleUsers.filter(u => u.subscription_type === 'premium')
    const basicUsers = filteredMaleUsers.filter(u => u.subscription_type === 'basic')
    
    return {
      premium: premiumUsers,
      basic: basicUsers,
      premiumCount: premiumUsers.length,
      basicCount: basicUsers.length
    }
  }, [filteredMaleUsers])

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchTerm('')
    setFemaleSearchTerm('')
    setStatusFilter('all')
    setSubscriptionFilter('all')
    setAssignmentStatusFilter('all')
    setUniversityFilter('all')
    setAssignDialogSearchTerm('')
  }, [])

  // Enhanced assign profile with optimized performance
  const handleAssignProfile = async (maleUserId: string, femaleUserId: string) => {
    try {
      setAssignLoading(true)
      
      // Optimistic UI update - immediately update local state
      const updatedMales = maleUsers.map(male => {
        if (male.id === maleUserId) {
          return {
            ...male,
            assignedCount: male.assignedCount + 1
          }
        }
        return male
      })
      setMaleUsers(updatedMales)
      
      // Show immediate feedback
      const femaleUser = femaleUsers.find(f => f.id === femaleUserId)
      const successToast = `✅ Assigning ${femaleUser?.full_name || 'profile'} to ${selectedMaleUser?.full_name || 'user'}...`
      
      // Create a temporary toast element for immediate feedback
      const toastElement = document.createElement('div')
      toastElement.className = 'fixed top-4 right-4 bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-2 rounded-lg z-50 transition-all duration-300'
      toastElement.textContent = successToast
      document.body.appendChild(toastElement)
      
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
      
      // Remove temporary toast
      setTimeout(() => {
        if (document.body.contains(toastElement)) {
          document.body.removeChild(toastElement)
        }
      }, 3000)
      
      if (result.success) {
        // Update with server response
        await fetchMatchesData(true)
        setAssignDialogOpen(false)
        
        // Show success notification
        const successElement = document.createElement('div')
        successElement.className = 'fixed top-4 right-4 bg-green-500/20 border border-green-500/50 text-green-400 px-6 py-3 rounded-lg z-50 transition-all duration-300 flex items-center space-x-2'
        successElement.innerHTML = `
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>Profile assigned successfully! 🎉</span>
        `
        document.body.appendChild(successElement)
        
        setTimeout(() => {
          if (document.body.contains(successElement)) {
            document.body.removeChild(successElement)
          }
        }, 4000)
      } else {
        // Revert optimistic update on error
        await fetchMatchesData(true)
        
        const errorElement = document.createElement('div')
        errorElement.className = 'fixed top-4 right-4 bg-red-500/20 border border-red-500/50 text-red-400 px-6 py-3 rounded-lg z-50'
        errorElement.textContent = result.error || 'Failed to assign profile'
        document.body.appendChild(errorElement)
        
        setTimeout(() => {
          if (document.body.contains(errorElement)) {
            document.body.removeChild(errorElement)
          }
        }, 4000)
      }
    } catch (error) {
      console.error('Error assigning profile:', error)
      // Revert optimistic update on error
      await fetchMatchesData(true)
      
      const errorElement = document.createElement('div')
      errorElement.className = 'fixed top-4 right-4 bg-red-500/20 border border-red-500/50 text-red-400 px-6 py-3 rounded-lg z-50'
      errorElement.textContent = 'Network error occurred while assigning profile'
      document.body.appendChild(errorElement)
      
      setTimeout(() => {
        if (document.body.contains(errorElement)) {
          document.body.removeChild(errorElement)
        }
      }, 4000)
    } finally {
      setAssignLoading(false)
    }
  }

  // Handle user actions
  const handleUserAction = async (action: string, maleUserId: string, femaleUserId?: string) => {
    try {
      setActionLoading(`${action}-${maleUserId}`)
      
      // For reset action, show optimistic UI update
      if (action === 'clear_history') {
        const updatedMales = maleUsers.map(male => {
          if (male.id === maleUserId) {
            return {
              ...male,
              current_round: 1,
              round_1_completed: false,
              round_2_completed: false,
              decision_timer_active: false,
              decision_timer_expires_at: null,
              decision_timer_started_at: null,
              temp_match_id: null,
              permanent_match_id: null,
              match_confirmed_at: null,
              assignments: [],
              assignedCount: 0,
              revealedCount: 0,
              disengagedCount: 0,
              availableSlots: male.maxAssignments,
              selectedAssignment: null,
              currentTempMatch: null,
              permanentMatch: null,
              hasActiveTimer: false,
              timeRemaining: null,
              status: 'assigned' as const // Set to 'assigned' status so user remains visible
            }
          }
          return male
        })
        setMaleUsers(updatedMales)
      }
      
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
        // Always refresh data from server to ensure consistency
        await fetchMatchesData(true)
        
        // Enhanced success notifications based on action
        let successMessage = result.message || 'Action completed successfully!'
        let successIcon = '✅'
        
        if (action === 'clear_history') {
          successMessage = '🔄 User profile reset successfully! All assignments cleared and user moved to Round 1.'
          successIcon = '🔄'
        }
        
        // Show enhanced toast notification
        const successElement = document.createElement('div')
        successElement.className = 'fixed top-4 right-4 bg-green-500/20 border border-green-500/50 text-green-400 px-6 py-4 rounded-lg z-50 transition-all duration-300 flex items-start space-x-3 max-w-md'
        successElement.innerHTML = `
          <div class="text-2xl">${successIcon}</div>
          <div>
            <div class="font-semibold">${action === 'clear_history' ? 'Profile Reset Complete' : 'Success'}</div>
            <div class="text-sm text-green-300 mt-1">${successMessage}</div>
          </div>
        `
        document.body.appendChild(successElement)
        
        setTimeout(() => {
          if (document.body.contains(successElement)) {
            successElement.style.opacity = '0'
            successElement.style.transform = 'translateX(100%)'
            setTimeout(() => {
              if (document.body.contains(successElement)) {
                document.body.removeChild(successElement)
              }
            }, 300)
          }
        }, 5000)
      } else {
        // Revert optimistic update on error
        if (action === 'clear_history') {
          await fetchMatchesData(true)
        }
        
        const errorElement = document.createElement('div')
        errorElement.className = 'fixed top-4 right-4 bg-red-500/20 border border-red-500/50 text-red-400 px-6 py-4 rounded-lg z-50 max-w-md'
        errorElement.innerHTML = `
          <div class="flex items-start space-x-3">
            <div class="text-xl">❌</div>
            <div>
              <div class="font-semibold">Action Failed</div>
              <div class="text-sm text-red-300 mt-1">${result.error || 'Action failed'}</div>
            </div>
          </div>
        `
        document.body.appendChild(errorElement)
        
        setTimeout(() => {
          if (document.body.contains(errorElement)) {
            errorElement.style.opacity = '0'
            setTimeout(() => {
              if (document.body.contains(errorElement)) {
                document.body.removeChild(errorElement)
              }
            }, 300)
          }
        }, 4000)
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error)
      
      // Revert optimistic update on error
      if (action === 'clear_history') {
        await fetchMatchesData(true)
      }
      
      const errorElement = document.createElement('div')
      errorElement.className = 'fixed top-4 right-4 bg-red-500/20 border border-red-500/50 text-red-400 px-6 py-4 rounded-lg z-50 max-w-md'
      errorElement.innerHTML = `
        <div class="flex items-start space-x-3">
          <div class="text-xl">⚠️</div>
          <div>
            <div class="font-semibold">Network Error</div>
            <div class="text-sm text-red-300 mt-1">An error occurred while performing action</div>
          </div>
        </div>
      `
      document.body.appendChild(errorElement)
      
      setTimeout(() => {
        if (document.body.contains(errorElement)) {
          document.body.removeChild(errorElement)
        }
      }, 4000)
    } finally {
      setActionLoading(null)
    }
  }

  // Open assign dialog
  const openAssignDialog = (maleUser: EnhancedMaleUser, slot: 1 | 2 | 3) => {
    console.log('openAssignDialog called with:', { maleUser: maleUser.full_name, slot })
    setSelectedMaleUser(maleUser)
    setSelectedAssignSlot(slot)
    setAssignDialogSearchTerm('') // Clear search when opening dialog
    setAssignDialogOpen(true)
    console.log('Dialog state set to open')
  }

  // Get available female users for assignment (exclude already assigned to this male user)
  const getAvailableFemaleUsers = useCallback((maleUser: EnhancedMaleUser) => {
    const assignedFemaleIds = maleUser.assignments.map(a => a.female_user_id)
    const disengagedFemaleIds = maleUser.assignments
      .filter(a => a.status === 'disengaged')
      .map(a => a.female_user_id)
    
    return filteredFemaleUsers.filter(female => {
      // Exclude already assigned and disengaged
      if (assignedFemaleIds.includes(female.id) || disengagedFemaleIds.includes(female.id)) {
        return false
      }
      
      // Apply assignment dialog search filter (debounced)
      if (debouncedAssignDialogSearchTerm && 
          !female.full_name.toLowerCase().includes(debouncedAssignDialogSearchTerm.toLowerCase()) && 
          !female.email.toLowerCase().includes(debouncedAssignDialogSearchTerm.toLowerCase()) &&
          !female.university.toLowerCase().includes(debouncedAssignDialogSearchTerm.toLowerCase()) &&
          !female.bio.toLowerCase().includes(debouncedAssignDialogSearchTerm.toLowerCase())) {
        return false
      }
      
      return true
    })
  }, [filteredFemaleUsers, debouncedAssignDialogSearchTerm])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center" style={{ zoom: '0.8' }}>
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
    <div className="min-h-screen bg-black" style={{ zoom: '0.8' }}>
      <div className="w-full px-4 py-6 space-y-6">
        {/* Advanced Filter Panel */}
        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Main Search Row */}
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder="Search users by name, email, university..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-400 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-all"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  )}
                </div>
                
                <Button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  variant="outline"
                  className="h-12 px-6 border-slate-700/50 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-200"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Advanced Filters
                  {(statusFilter !== 'all' || subscriptionFilter !== 'all' || assignmentStatusFilter !== 'all' || universityFilter !== 'all') && (
                    <Badge className="ml-3 bg-blue-500/20 text-blue-400 border-blue-500/50 pulse-animation">
                      Active
                    </Badge>
                  )}
                </Button>
                
                {(searchTerm || statusFilter !== 'all' || subscriptionFilter !== 'all' || assignmentStatusFilter !== 'all' || universityFilter !== 'all' || femaleSearchTerm || assignDialogSearchTerm) && (
                  <Button
                    onClick={clearAllFilters}
                    variant="outline"
                    className="h-12 px-4 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 transition-all duration-200"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                )}
                
                <Button
                  onClick={() => fetchMatchesData(true)}
                  disabled={refreshing}
                  variant="outline"
                  className="h-12 px-4 border-slate-700/50 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-200"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              {/* Advanced Filters Collapsible */}
              <AnimatePresence>
                {showAdvancedFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="space-y-6 border-t border-slate-700/50 pt-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      {/* Plan Type Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Plan Type</label>
                        <Select value={selectedPlanType} onValueChange={(value: any) => setSelectedPlanType(value)}>
                          <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white hover:bg-slate-700/50 transition-colors">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="all">All Plans</SelectItem>
                            <SelectItem value="premium">Premium (₹249)</SelectItem>
                            <SelectItem value="basic">Basic (₹99)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Status Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">User Status</label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white hover:bg-slate-700/50 transition-colors">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="waiting">Waiting Assignment</SelectItem>
                            <SelectItem value="assigned">Has Assignments</SelectItem>
                            <SelectItem value="temporary_match">In Temporary Match</SelectItem>
                            <SelectItem value="permanently_matched">Permanently Matched</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Subscription Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Subscription Plan</label>
                        <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
                          <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white hover:bg-slate-700/50 transition-colors">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="all">All Plans</SelectItem>
                            <SelectItem value="premium">Premium (₹249)</SelectItem>
                            <SelectItem value="basic">Basic (₹99)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Assignment Status Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Assignment Status</label>
                        <Select value={assignmentStatusFilter} onValueChange={setAssignmentStatusFilter}>
                          <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white hover:bg-slate-700/50 transition-colors">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="all">All Assignment States</SelectItem>
                            <SelectItem value="no_assignments">No Assignments</SelectItem>
                            <SelectItem value="partial_assignments">Partial Assignments</SelectItem>
                            <SelectItem value="full_assignments">Full Assignments</SelectItem>
                            <SelectItem value="has_assignments">Has Assignments</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* University Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">University</label>
                        <Select value={universityFilter} onValueChange={setUniversityFilter}>
                          <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white hover:bg-slate-700/50 transition-colors">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
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
                    <div className="space-y-3 border-t border-slate-700/50 pt-4">
                      <label className="text-sm font-medium text-slate-300">Female Users Search (for assignment)</label>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Search female users by name, email, university, or bio..."
                          value={femaleSearchTerm}
                          onChange={(e) => setFemaleSearchTerm(e.target.value)}
                          className="pl-12 bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-400 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/25 transition-all"
                        />
                        {femaleSearchTerm && (
                          <button
                            onClick={() => setFemaleSearchTerm('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Results Summary */}
                    <div className="flex items-center justify-between bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
                      <div className="text-sm text-slate-300">
                        Showing <span className="text-white font-bold">{filteredMaleUsers.length}</span> of <span className="text-slate-400">{maleUsers.length}</span> male users
                        {filteredFemaleUsers.length !== femaleUsers.length && (
                          <span className="ml-4">
                            • <span className="text-white font-bold">{filteredFemaleUsers.length}</span> of <span className="text-slate-400">{femaleUsers.length}</span> female users
                          </span>
                        )}
                      </div>
                      
                      {(searchTerm || statusFilter !== 'all' || subscriptionFilter !== 'all' || assignmentStatusFilter !== 'all' || universityFilter !== 'all' || femaleSearchTerm || assignDialogSearchTerm) && (
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50 animate-pulse">
                          <Filter className="h-3 w-3 mr-1" />
                          Filters Active
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 backdrop-blur-xl border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 group">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="p-2 bg-purple-500/20 rounded-lg mx-auto w-fit mb-2">
                    <Crown className="h-5 w-5 text-purple-400" />
                  </div>
                  <p className="text-purple-300 text-xs font-medium mb-1">Premium Users</p>
                  <p className="text-2xl font-bold text-purple-400">{statistics.premiumUsers}</p>
                  <p className="text-purple-400/70 text-xs">₹249 (Paid)</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 backdrop-blur-xl border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 group">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="p-2 bg-blue-500/20 rounded-lg mx-auto w-fit mb-2">
                    <Users className="h-5 w-5 text-blue-400" />
                  </div>
                  <p className="text-blue-300 text-xs font-medium mb-1">Basic Users</p>
                  <p className="text-2xl font-bold text-blue-400">{statistics.basicUsers}</p>
                  <p className="text-blue-400/70 text-xs">₹99 (Paid)</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 backdrop-blur-xl border-green-500/20 hover:border-green-500/40 transition-all duration-300 group">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="p-2 bg-green-500/20 rounded-lg mx-auto w-fit mb-2">
                    <Target className="h-5 w-5 text-green-400" />
                  </div>
                  <p className="text-green-300 text-xs font-medium mb-1">Currently Assigned</p>
                  <p className="text-2xl font-bold text-green-400">{statistics.assignedUsers}</p>
                  <p className="text-green-400/70 text-xs">Not selected yet</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 backdrop-blur-xl border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 group">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="p-2 bg-orange-500/20 rounded-lg mx-auto w-fit mb-2">
                    <Calendar className="h-5 w-5 text-orange-400" />
                  </div>
                  <p className="text-orange-300 text-xs font-medium mb-1">Round 1</p>
                  <p className="text-2xl font-bold text-orange-400">{statistics.round1Users}</p>
                  <p className="text-orange-400/70 text-xs">Active users</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-indigo-900/20 to-indigo-800/10 backdrop-blur-xl border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300 group">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="p-2 bg-indigo-500/20 rounded-lg mx-auto w-fit mb-2">
                    <Calendar className="h-5 w-5 text-indigo-400" />
                  </div>
                  <p className="text-indigo-300 text-xs font-medium mb-1">Round 2</p>
                  <p className="text-2xl font-bold text-indigo-400">{statistics.round2Users}</p>
                  <p className="text-indigo-400/70 text-xs">Active users</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-gradient-to-br from-pink-900/20 to-pink-800/10 backdrop-blur-xl border-pink-500/20 hover:border-pink-500/40 transition-all duration-300 group">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="p-2 bg-pink-500/20 rounded-lg mx-auto w-fit mb-2">
                    <Heart className="h-5 w-5 text-pink-400" />
                  </div>
                  <p className="text-pink-300 text-xs font-medium mb-1">Permanent Matches</p>
                  <p className="text-2xl font-bold text-pink-400">{statistics.permanentMatches}</p>
                  <p className="text-pink-400/70 text-xs">Final matches</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="premium" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 p-1 rounded-xl">
            <TabsTrigger 
              value="premium" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-500 data-[state=active]:text-white text-slate-300 transition-all duration-300 rounded-lg"
            >
              <Crown className="h-4 w-4 mr-2" />
              Premium Users ({filteredUserCounts.premiumCount})
            </TabsTrigger>
            <TabsTrigger 
              value="basic" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 data-[state=active]:text-white text-slate-300 transition-all duration-300 rounded-lg"
            >
              <Users className="h-4 w-4 mr-2" />
              Basic Users ({filteredUserCounts.basicCount})
            </TabsTrigger>
          </TabsList>

          {/* Premium Users Tab */}
          <TabsContent value="premium" className="mt-8">
            {(selectedPlanType === 'all' || selectedPlanType === 'premium') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-500/20 rounded-lg mr-3">
                          <Crown className="h-6 w-6 text-purple-400" />
                        </div>
                        <div>
                          <span className="text-xl">Premium Users Management</span>
                          <p className="text-sm text-slate-400 font-normal mt-1">
                            Advanced matching system with multiple profile options
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50 px-3 py-1">
                          Round 1: 2 Options
                        </Badge>
                        <Badge className="bg-purple-600/20 text-purple-300 border-purple-600/50 px-3 py-1">
                          Round 2: 3 Options
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <PremiumUsersTable 
                      users={filteredUserCounts.premium}
                      onAssignProfile={openAssignDialog}
                      onUserAction={handleUserAction}
                      actionLoading={actionLoading}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          {/* Basic Users Tab */}
          <TabsContent value="basic" className="mt-8">
            {(selectedPlanType === 'all' || selectedPlanType === 'basic') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-500/20 rounded-lg mr-3">
                          <Users className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                          <span className="text-xl">Basic Users Management</span>
                          <p className="text-sm text-slate-400 font-normal mt-1">
                            Simplified matching with single profile per round
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50 px-3 py-1">
                          Round 1: 1 Option
                        </Badge>
                        <Badge className="bg-blue-600/20 text-blue-300 border-blue-600/50 px-3 py-1">
                          Round 2: 1 Option
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <BasicUsersTable 
                      users={filteredUserCounts.basic}
                      onAssignProfile={openAssignDialog}
                      onUserAction={handleUserAction}
                      actionLoading={actionLoading}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>

        {/* Enhanced Female Profile Dialog */}
        <EnhancedFemaleProfileDialog 
          femaleUser={selectedFemaleUser}
          isOpen={isProfileDialogOpen}
          onClose={() => {
            setIsProfileDialogOpen(false)
            setSelectedFemaleUser(null)
          }}
        />
      </div>

      {/* Enhanced Assign Profile Dialog - Fixed Implementation */}
      {assignDialogOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setAssignDialogOpen(false)}
          />
          
          {/* Dialog Content */}
          <div className="relative bg-gray-900/98 backdrop-blur-xl border border-gray-700/50 rounded-xl max-w-7xl max-h-[95vh] overflow-hidden w-full mx-4">
            
            {/* Loading Overlay */}
            {assignLoading && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-gray-800/90 rounded-xl p-6 border border-gray-700/50 flex items-center space-x-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                  <div className="text-white">
                    <div className="font-semibold">Processing Assignment</div>
                    <div className="text-sm text-gray-400">Please wait while we assign the profile...</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Enhanced Dialog Header */}
            <div className="bg-gradient-to-r from-slate-900/95 to-gray-900/95 border-b border-slate-700/50 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30">
                    <Target className="h-7 w-7 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      Assign Female Profile
                    </h2>
                    <div className="text-sm font-medium text-gray-400 mt-1 flex items-center space-x-2">
                      <span>Slot {selectedAssignSlot} Assignment</span>
                      <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                      <span>Round 1</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/30 px-4 py-2 text-sm font-medium">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Active Round
                  </Badge>
                  <button
                    onClick={() => setAssignDialogOpen(false)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/30 border border-transparent rounded-lg transition-all duration-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              {selectedMaleUser && (
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20 mt-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12 border-2 border-blue-500/30">
                      <AvatarImage src={selectedMaleUser.profile_photo} />
                      <AvatarFallback className="bg-blue-500/20 text-blue-400">
                        {selectedMaleUser.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-white font-semibold text-lg">{selectedMaleUser.full_name}</h3>
                        <Badge className={selectedMaleUser.subscription_type === 'premium' ? 
                          'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 
                          'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        }>
                          <Crown className="h-3 w-3 mr-1" />
                          {selectedMaleUser.subscription_type}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                        <span>📧 {selectedMaleUser.email}</span>
                        <span>🎂 {selectedMaleUser.age} years</span>
                        <span>🏫 {selectedMaleUser.university}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {selectedMaleUser && (
              <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                {/* Enhanced Search and Filters Section */}
                <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl p-6 border border-slate-600/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Search className="h-5 w-5 mr-2 text-blue-400" />
                      Search & Filter Profiles
                    </h3>
                    <div className="text-sm text-gray-300 bg-slate-700/50 rounded-full px-3 py-1">
                      <span className="text-blue-400 font-semibold">
                        {getAvailableFemaleUsers(selectedMaleUser).length}
                      </span>
                      {assignDialogSearchTerm ? ` matching` : ` available`} profiles
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="🔍 Search by name, email, university, interests, or any keyword..."
                        value={assignDialogSearchTerm}
                        onChange={(e) => setAssignDialogSearchTerm(e.target.value)}
                        className="pl-12 pr-12 h-12 bg-slate-800/50 border-slate-600/50 text-white placeholder-gray-400 rounded-lg text-base focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                      />
                      {assignDialogSearchTerm && (
                        <button
                          onClick={() => setAssignDialogSearchTerm('')}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                    
                    {/* Quick Filter Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => setAssignDialogSearchTerm('')}
                        variant="outline"
                        size="sm"
                        className={`border-slate-600/50 text-slate-300 hover:bg-slate-700/50 ${!assignDialogSearchTerm ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : ''}`}
                      >
                        All Profiles
                      </Button>
                      <Button
                        onClick={() => setAssignDialogSearchTerm('19')}
                        variant="outline"
                        size="sm"
                        className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
                      >
                        Age 19
                      </Button>
                      <Button
                        onClick={() => setAssignDialogSearchTerm('20')}
                        variant="outline"
                        size="sm"
                        className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
                      >
                        Age 20
                      </Button>
                      <Button
                        onClick={() => setAssignDialogSearchTerm('21')}
                        variant="outline"
                        size="sm"
                        className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
                      >
                        Age 21
                      </Button>
                    </div>
                  </div>
                  
                  {assignDialogSearchTerm && getAvailableFemaleUsers(selectedMaleUser).length === 0 && (
                    <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-amber-300 font-medium">No profiles match your search</p>
                          <p className="text-amber-400/80 text-sm mt-1">
                            Try different keywords, check spelling, or clear the search to see all available profiles.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {assignDialogSearchTerm && getAvailableFemaleUsers(selectedMaleUser).length > 0 && (
                    <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                        <span className="text-green-300 text-sm">
                          Found {getAvailableFemaleUsers(selectedMaleUser).length} matching profiles
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Female Profiles Grid */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Users className="h-5 w-5 mr-2 text-purple-400" />
                      Available Female Profiles
                    </h3>
                    <div className="flex items-center space-x-2">
                      {assignLoading && (
                        <div className="flex items-center space-x-2 text-blue-400">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                          <span className="text-sm">Processing assignment...</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[50vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                    {getAvailableFemaleUsers(selectedMaleUser).map((female, index) => (
                      <div key={female.id}>
                        <EnhancedFemaleProfileCard 
                          female={female}
                          onAssign={() => handleAssignProfile(selectedMaleUser.id, female.id)}
                          onViewProfile={handleViewFemaleProfile}
                          loading={assignLoading}
                          index={index}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                {getAvailableFemaleUsers(selectedMaleUser).length === 0 && !assignDialogSearchTerm && (
                  <div className="text-center py-12">
                    <div className="bg-slate-800/50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                      <UserX className="h-12 w-12 text-slate-400" />
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-2">No Available Profiles</h3>
                    <p className="text-slate-400 text-sm max-w-md mx-auto">
                      All female profiles have been assigned or disengaged by this user. 
                      You may need to add more female users to the system.
                    </p>
                    <Button
                      onClick={() => setAssignDialogOpen(false)}
                      variant="outline"
                      className="mt-4 border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
                    >
                      Close Dialog
                    </Button>
                  </div>
                )}
                
                {/* Keyboard Shortcuts Info */}
                {getAvailableFemaleUsers(selectedMaleUser).length > 0 && (
                  <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                    <div className="text-xs text-slate-400 text-center">
                      💡 <strong>Pro Tips:</strong> Use search filters to quickly find profiles • Click on profile photos for detailed view • Assignments are processed instantly
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Premium Users Table Component with Enhanced Professional Design
function PremiumUsersTable({ users, onAssignProfile, onUserAction, actionLoading }: any) {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  
  if (users.length === 0) {
    return (
      <div className="text-center py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto"
        >
          <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="h-12 w-12 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Premium Users Found</h3>
          <p className="text-slate-400">Premium users will appear here once they confirm payment and complete their profiles.</p>
          <div className="mt-6 bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <p className="text-purple-300 text-sm">
              <Crown className="h-4 w-4 inline mr-2" />
              Premium plan includes: 2 profiles in Round 1, 3 profiles in Round 2, selection features
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between border-b border-slate-700/50 pb-4">
        <div className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-purple-400" />
          <span className="text-slate-300 font-medium">{users.length} Premium Users</span>
        </div>
        <div className="flex items-center space-x-2 bg-slate-800/50 rounded-lg p-1">
          <Button
            onClick={() => setViewMode('table')}
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            className={`${viewMode === 'table' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'} transition-all`}
          >
            <List className="h-4 w-4 mr-1" />
            Table
          </Button>
          <Button
            onClick={() => setViewMode('cards')}
            variant={viewMode === 'cards' ? 'default' : 'ghost'}
            size="sm"
            className={`${viewMode === 'cards' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'} transition-all`}
          >
            <Grid3X3 className="h-4 w-4 mr-1" />
            Cards
          </Button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-slate-700/50">
                <tr>
                  <th className="text-left p-4 text-white font-semibold">User Details</th>
                  <th className="text-left p-4 text-white font-semibold">Round Status</th>
                  <th className="text-left p-4 text-white font-semibold">Assignment Slots</th>
                  <th className="text-left p-4 text-white font-semibold">Selection Status</th>
                  <th className="text-left p-4 text-white font-semibold">Current Status</th>
                  <th className="text-left p-4 text-white font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: EnhancedMaleUser, index: number) => (
                  <motion.tr 
                    key={user.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                  >
                    {/* User Details */}
                    <td className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-bold">
                            {index + 1}
                          </span>
                        </div>
                        <Avatar className="h-12 w-12 ring-2 ring-purple-500/20">
                          <AvatarImage src={user.profile_photo} />
                          <AvatarFallback className="bg-purple-500/20 text-purple-400">
                            {user.full_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-semibold truncate">{user.full_name}</p>
                          <p className="text-slate-400 text-sm truncate">{user.email}</p>
                          <p className="text-slate-500 text-xs truncate">{user.university}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50 text-xs">
                              <Crown className="h-3 w-3 mr-1" />
                              Premium
                            </Badge>
                            {user.payment_confirmed && (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Paid
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Round Status */}
                    <td className="p-4">
                      <EnhancedRoundInfoDisplay user={user} />
                    </td>
                    
                    {/* Assignment Slots */}
                    <td className="p-4">
                      <div className="space-y-2">
                        {user.current_round === 1 ? (
                          // Round 1: 2 slots for premium
                          <div className="grid grid-cols-2 gap-2">
                            {[1, 2].map((slot) => (
                              <div key={slot} className="min-w-0">
                                <div className="text-xs text-slate-400 mb-1">Slot {slot}</div>
                                <EnhancedAssignmentSlot 
                                  user={user}
                                  slot={slot}
                                  onAssign={() => onAssignProfile(user, slot)}
                                  onAction={onUserAction}
                                  actionLoading={actionLoading}
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          // Round 2: 3 slots for premium
                          <div className="grid grid-cols-3 gap-1">
                            {[1, 2, 3].map((slot) => (
                              <div key={slot} className="min-w-0">
                                <div className="text-xs text-slate-400 mb-1">S{slot}</div>
                                <EnhancedAssignmentSlot 
                                  user={user}
                                  slot={slot}
                                  onAssign={() => onAssignProfile(user, slot)}
                                  onAction={onUserAction}
                                  actionLoading={actionLoading}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    {/* Selection Status */}
                    <td className="p-4">
                      <EnhancedSelectedProfileWithTimer user={user} onUserAction={onUserAction} actionLoading={actionLoading} />
                    </td>
                    
                    {/* Current Status */}
                    <td className="p-4">
                      <EnhancedUserStatusBadge user={user} />
                    </td>
                    
                    {/* Actions */}
                    <td className="p-4">
                      <EnhancedUserActionButtons 
                        user={user}
                        onAction={onUserAction}
                        actionLoading={actionLoading}
                      />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user: EnhancedMaleUser, index: number) => (
            <UserCardView 
              key={user.id}
              user={user}
              index={index}
              onAssignProfile={onAssignProfile}
              onUserAction={onUserAction}
              actionLoading={actionLoading}
              planType="premium"
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Basic Users Table Component with Enhanced Professional Design
function BasicUsersTable({ users, onAssignProfile, onUserAction, actionLoading }: any) {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  
  if (users.length === 0) {
    return (
      <div className="text-center py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto"
        >
          <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="h-12 w-12 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Basic Users Found</h3>
          <p className="text-slate-400">Basic users will appear here once they confirm payment and complete their profiles.</p>
          <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-blue-300 text-sm">
              <Users className="h-4 w-4 inline mr-2" />
              Basic plan includes: 1 profile per round across 2 rounds
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between border-b border-slate-700/50 pb-4">
        <div className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-blue-400" />
          <span className="text-slate-300 font-medium">{users.length} Basic Users</span>
        </div>
        <div className="flex items-center space-x-2 bg-slate-800/50 rounded-lg p-1">
          <Button
            onClick={() => setViewMode('table')}
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            className={`${viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'} transition-all`}
          >
            <List className="h-4 w-4 mr-1" />
            Table
          </Button>
          <Button
            onClick={() => setViewMode('cards')}
            variant={viewMode === 'cards' ? 'default' : 'ghost'}
            size="sm"
            className={`${viewMode === 'cards' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'} transition-all`}
          >
            <Grid3X3 className="h-4 w-4 mr-1" />
            Cards
          </Button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-slate-700/50">
                <tr>
                  <th className="text-left p-4 text-white font-semibold">User Details</th>
                  <th className="text-left p-4 text-white font-semibold">Round Status</th>
                  <th className="text-left p-4 text-white font-semibold">Assignment Slot</th>
                  <th className="text-left p-4 text-white font-semibold">Selection Status</th>
                  <th className="text-left p-4 text-white font-semibold">Current Status</th>
                  <th className="text-left p-4 text-white font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: EnhancedMaleUser, index: number) => (
                  <motion.tr 
                    key={user.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                  >
                    {/* User Details */}
                    <td className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-bold">
                            {index + 1}
                          </span>
                        </div>
                        <Avatar className="h-12 w-12 ring-2 ring-blue-500/20">
                          <AvatarImage src={user.profile_photo} />
                          <AvatarFallback className="bg-blue-500/20 text-blue-400">
                            {user.full_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-semibold truncate">{user.full_name}</p>
                          <p className="text-slate-400 text-sm truncate">{user.email}</p>
                          <p className="text-slate-500 text-xs truncate">{user.university}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50 text-xs">
                              <Users className="h-3 w-3 mr-1" />
                              Basic
                            </Badge>
                            {user.payment_confirmed && (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Paid
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Round Status */}
                    <td className="p-4">
                      <EnhancedRoundInfoDisplay user={user} />
                    </td>
                    
                    {/* Single Assignment Slot */}
                    <td className="p-4">
                      <div className="space-y-2">
                        <div className="text-xs text-slate-400 mb-1">Single Slot</div>
                        <EnhancedAssignmentSlot 
                          user={user}
                          slot={1}
                          onAssign={() => onAssignProfile(user, 1)}
                          onAction={onUserAction}
                          actionLoading={actionLoading}
                        />
                      </div>
                    </td>
                    
                    {/* Selection Status */}
                    <td className="p-4">
                      <EnhancedSelectedProfileWithTimer user={user} onUserAction={onUserAction} actionLoading={actionLoading} />
                    </td>
                    
                    {/* Current Status */}
                    <td className="p-4">
                      <EnhancedUserStatusBadge user={user} />
                    </td>
                    
                    {/* Actions */}
                    <td className="p-4">
                      <EnhancedUserActionButtons 
                        user={user}
                        onAction={onUserAction}
                        actionLoading={actionLoading}
                      />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user: EnhancedMaleUser, index: number) => (
            <UserCardView 
              key={user.id}
              user={user}
              index={index}
              onAssignProfile={onAssignProfile}
              onUserAction={onUserAction}
              actionLoading={actionLoading}
              planType="basic"
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Enhanced Round Info Display Component
function EnhancedRoundInfoDisplay({ user }: { user: EnhancedMaleUser }) {
  const maxForRound = user.subscription_type === 'premium' 
    ? (user.current_round === 1 ? 2 : 3)
    : 1
  
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Badge className={`text-xs font-medium ${
          user.current_round === 1 
            ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
            : 'bg-green-500/20 text-green-400 border-green-500/50'
        }`}>
          <Activity className="h-3 w-3 mr-1" />
          Round {user.current_round}
        </Badge>
        <Badge className="bg-slate-600/20 text-slate-400 border-slate-600/50 text-xs">
          Max {maxForRound}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className={`flex items-center space-x-1 ${user.round_1_completed ? 'text-green-400' : 'text-slate-500'}`}>
          {user.round_1_completed ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
          <span>R1: {user.round_1_completed ? 'Done' : 'Pending'}</span>
        </div>
        <div className={`flex items-center space-x-1 ${
          user.round_2_completed ? 'text-green-400' : 
          user.current_round === 2 ? 'text-yellow-400' : 'text-slate-500'
        }`}>
          {user.round_2_completed ? <CheckCircle className="h-3 w-3" /> : 
           user.current_round === 2 ? <Clock className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
          <span>R2: {user.round_2_completed ? 'Done' : user.current_round === 2 ? 'Active' : 'Waiting'}</span>
        </div>
      </div>
      
      {user.roundInfo.canProgressToRound2 && (
        <div className="flex items-center space-x-1 text-yellow-400 text-xs">
          <ArrowRight className="h-3 w-3" />
          <span>Ready for R2</span>
        </div>
      )}
    </div>
  )
}

// Enhanced Assignment Slot Component
function EnhancedAssignmentSlot({ user, slot, onAssign, onAction, actionLoading }: any) {
  const currentRoundAssignments = user.assignments.filter((a: any) => 
    a.round_number === user.current_round && a.status === 'assigned'
  )
  const slotAssignment = currentRoundAssignments[slot - 1]
  
  if (user.selectedAssignment && user.hasActiveTimer) {
    if (user.selectedAssignment.id === slotAssignment?.id) {
      return (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <Avatar className="h-6 w-6">
              <AvatarImage src={user.selectedAssignment.female_user?.profile_photo} />
              <AvatarFallback className="text-xs">S</AvatarFallback>
            </Avatar>
          </div>
          <div className="text-xs text-yellow-400 font-medium mt-1">Selected</div>
        </div>
      )
    } else {
      return (
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-2">
          <div className="text-xs text-slate-500 text-center">Hidden</div>
        </div>
      )
    }
  }
  
  if (slotAssignment) {
    return (
      <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-2">
        <div className="flex items-center space-x-2 mb-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={slotAssignment.female_user?.profile_photo} />
            <AvatarFallback className="text-xs">F</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-white font-medium truncate">
              {slotAssignment.female_user?.full_name}
            </div>
          </div>
        </div>
        <Button
          onClick={() => onAction('select_profile', user.id, slotAssignment.female_user_id)}
          disabled={actionLoading === `select_profile-${user.id}` || user.hasActiveTimer}
          variant="outline"
          size="sm"
          className="w-full border-green-500/50 text-green-400 hover:bg-green-500/10 text-xs h-7"
        >
          <PlayCircle className="h-3 w-3 mr-1" />
          Select
        </Button>
      </div>
    )
  }
  
  if (user.availableSlots > 0 && slot <= user.maxAssignments) {
    return (
      <div className="border-2 border-dashed border-slate-600/50 rounded-lg p-2">
        <Button
          onClick={() => {
            console.log('Assign button clicked for slot:', slot, 'user:', user.full_name)
            onAssign()
          }}
          variant="outline"
          size="sm"
          className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10 text-xs h-7"
          disabled={user.hasActiveTimer}
        >
          <Plus className="h-3 w-3 mr-1" />
          Assign
        </Button>
      </div>
    )
  }
  
  return (
    <div className="bg-slate-800/20 border border-slate-700/30 rounded-lg p-2">
      <div className="text-xs text-slate-500 text-center">
        {slot > user.maxAssignments ? 'N/A' : 'Empty'}
      </div>
    </div>
  )
}

// Enhanced Selected Profile with Timer Component
function EnhancedSelectedProfileWithTimer({ user, onUserAction, actionLoading }: any) {
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
      <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.permanentMatch.female_user?.profile_photo} />
            <AvatarFallback>M</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="text-sm font-medium text-white">
              {user.permanentMatch.female_user?.full_name}
            </div>
            <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/50 text-xs">
              <Heart className="h-2 w-2 mr-1" />
              Permanent Match
            </Badge>
          </div>
        </div>
      </div>
    )
  }

  if (user.currentTempMatch) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.currentTempMatch.female_user?.profile_photo} />
            <AvatarFallback>T</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="text-sm font-medium text-white">
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
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 space-y-3">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.selectedAssignment.female_user?.profile_photo} />
            <AvatarFallback>S</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="text-sm font-medium text-white">
              {user.selectedAssignment.female_user?.full_name}
            </div>
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 text-xs">
              <Timer className="h-2 w-2 mr-1" />
              Decision Timer
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-yellow-400 font-medium">Timer</span>
            <span className="text-yellow-300 font-mono">{timeLeft}</span>
          </div>
          <Progress 
            value={user.timeRemaining ? Math.max(0, (user.timeRemaining / (48 * 60 * 60 * 1000)) * 100) : 0} 
            className="h-1"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => onUserAction('confirm_match', user.id, user.selectedAssignment.female_user_id)}
            disabled={actionLoading === `confirm_match-${user.id}`}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white text-xs h-7"
          >
            <Heart className="h-3 w-3 mr-1" />
            Confirm
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10 text-xs h-7"
              >
                <UserX className="h-3 w-3 mr-1" />
                Disengage
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-900 border-slate-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">⚠️ Confirm Disengagement</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400">
                  Are you sure you want to disengage? This will stop the timer and show other profiles again.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-slate-700 text-white hover:bg-slate-800">
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

  return (
    <div className="bg-slate-800/20 border border-slate-700/30 rounded-lg p-3">
      <div className="text-xs text-slate-500 text-center">No selection</div>
    </div>
  )
}

// Enhanced User Status Badge Component
function EnhancedUserStatusBadge({ user }: { user: EnhancedMaleUser }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'permanently_matched':
        return {
          color: 'bg-pink-500/20 text-pink-400 border-pink-500/50',
          icon: <Heart className="h-3 w-3 mr-1" />,
          text: 'Matched'
        }
      case 'temporary_match':
        return {
          color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
          icon: <Timer className="h-3 w-3 mr-1" />,
          text: 'Temp Match'
        }
      case 'deciding':
        return {
          color: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
          icon: <Hourglass className="h-3 w-3 mr-1" />,
          text: 'Deciding'
        }
      case 'assigned':
        return {
          color: 'bg-green-500/20 text-green-400 border-green-500/50',
          icon: <CheckCircle className="h-3 w-3 mr-1" />,
          text: 'Assigned'
        }
      case 'waiting':
        return {
          color: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
          icon: <Clock className="h-3 w-3 mr-1" />,
          text: 'Waiting'
        }
      default:
        return {
          color: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
          icon: <AlertTriangle className="h-3 w-3 mr-1" />,
          text: 'Unknown'
        }
    }
  }

  const config = getStatusConfig(user.status)

  return (
    <div className="space-y-2">
      <Badge className={config.color}>
        {config.icon}
        {config.text}
      </Badge>
      
      {user.hasActiveTimer && user.decisionExpiresAt && (
        <div className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded px-2 py-1">
          <Timer className="h-3 w-3 inline mr-1" />
          Expires: {new Date(user.decisionExpiresAt).toLocaleDateString()}
        </div>
      )}
      
      <div className="text-xs text-slate-400 bg-slate-800/30 rounded px-2 py-1">
        {user.assignedCount}/{user.maxAssignments} slots used
      </div>
    </div>
  )
}

// Enhanced User Action Buttons Component
function EnhancedUserActionButtons({ user, onAction, actionLoading }: any) {
  return (
    <div className="flex flex-col space-y-2">
      {user.roundInfo.canProgressToRound2 && (
        <Button
          onClick={() => onAction('progress_to_round_2', user.id)}
          disabled={actionLoading === `progress_to_round_2-${user.id}`}
          variant="outline"
          size="sm"
          className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 text-xs h-8"
        >
          <ArrowRight className="h-3 w-3 mr-1" />
          Progress to R2
        </Button>
      )}
      
      {user.currentTempMatch && !user.hasActiveTimer && (
        <Button
          onClick={() => onAction('confirm_match', user.id, user.currentTempMatch.female_user_id)}
          disabled={actionLoading === `confirm_match-${user.id}`}
          variant="outline"
          size="sm"
          className="border-pink-500/50 text-pink-400 hover:bg-pink-500/10 text-xs h-8"
        >
          <Heart className="h-3 w-3 mr-1" />
          Confirm Match
        </Button>
      )}
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10 text-xs h-8"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset User
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center space-x-2">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <RotateCcw className="h-5 w-5 text-orange-400" />
              </div>
              <span>Reset User Profile</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400 space-y-3">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                <h4 className="text-white font-medium mb-2">This action will:</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                    <span>Clear all profile assignments</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                    <span>Remove temporary and permanent matches</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                    <span>Reset to Round 1 status</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                    <span className="text-green-400">Keep user account and subscription active</span>
                  </li>
                </ul>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="text-amber-300 text-sm">
                    <strong>Note:</strong> The user will remain visible in the admin panel and can receive new assignments immediately.
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 text-white hover:bg-slate-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => onAction('clear_history', user.id)}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Profile Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// User Card View Component
function UserCardView({ user, index, onAssignProfile, onUserAction, actionLoading, planType }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-slate-800/50 backdrop-blur-xl border rounded-xl p-6 hover:border-slate-600/50 transition-all duration-300 ${
        planType === 'premium' ? 'border-purple-500/30' : 'border-blue-500/30'
      }`}
    >
      <div className="space-y-4">
        {/* User Header */}
        <div className="flex items-center space-x-4">
          <Avatar className={`h-16 w-16 ring-2 ${
            planType === 'premium' ? 'ring-purple-500/30' : 'ring-blue-500/30'
          }`}>
            <AvatarImage src={user.profile_photo} />
            <AvatarFallback className={
              planType === 'premium' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
            }>
              {user.full_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold truncate">{user.full_name}</h3>
            <p className="text-slate-400 text-sm truncate">{user.email}</p>
            <p className="text-slate-500 text-xs truncate">{user.university}</p>
            <div className="flex items-center space-x-2 mt-2">
              <Badge className={
                planType === 'premium' 
                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/50 text-xs'
                  : 'bg-blue-500/20 text-blue-400 border-blue-500/50 text-xs'
              }>
                {planType === 'premium' ? <Crown className="h-2 w-2 mr-1" /> : <Users className="h-2 w-2 mr-1" />}
                {planType === 'premium' ? 'Premium' : 'Basic'}
              </Badge>
              {user.payment_confirmed && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-xs">
                  <CheckCircle className="h-2 w-2 mr-1" />
                  Paid
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Round Status */}
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-2">Round Status</div>
          <EnhancedRoundInfoDisplay user={user} />
        </div>

        {/* Assignment Slots */}
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-2">Assignment Slots</div>
          <div className="space-y-2">
            {planType === 'premium' ? (
              user.current_round === 1 ? (
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2].map((slot) => (
                    <div key={slot}>
                      <div className="text-xs text-slate-400 mb-1">Slot {slot}</div>
                      <EnhancedAssignmentSlot 
                        user={user}
                        slot={slot}
                        onAssign={() => onAssignProfile(user, slot)}
                        onAction={onUserAction}
                        actionLoading={actionLoading}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1">
                  {[1, 2, 3].map((slot) => (
                    <div key={slot}>
                      <div className="text-xs text-slate-400 mb-1">S{slot}</div>
                      <EnhancedAssignmentSlot 
                        user={user}
                        slot={slot}
                        onAssign={() => onAssignProfile(user, slot)}
                        onAction={onUserAction}
                        actionLoading={actionLoading}
                      />
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div>
                <div className="text-xs text-slate-400 mb-1">Single Slot</div>
                <EnhancedAssignmentSlot 
                  user={user}
                  slot={1}
                  onAssign={() => onAssignProfile(user, 1)}
                  onAction={onUserAction}
                  actionLoading={actionLoading}
                />
              </div>
            )}
          </div>
        </div>

        {/* Selection Status */}
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-2">Selection Status</div>
          <EnhancedSelectedProfileWithTimer user={user} onUserAction={onUserAction} actionLoading={actionLoading} />
        </div>

        {/* Current Status & Actions */}
        <div className="flex items-center justify-between">
          <EnhancedUserStatusBadge user={user} />
          <EnhancedUserActionButtons 
            user={user}
            onAction={onUserAction}
            actionLoading={actionLoading}
          />
        </div>
      </div>
    </motion.div>
  )
}

// Female Profile Card Component
// Enhanced Female Profile Card with better design and performance
const EnhancedFemaleProfileCard = React.memo(({ female, onAssign, loading, onViewProfile, index }: any) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  
  return (
    <div
      className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-5 hover:border-purple-500/50 transition-all duration-300 group"
    >
      {/* Profile Header */}
      <div className="text-center mb-4">
        <div className="relative mb-3">
          <Avatar 
            className="h-20 w-20 mx-auto cursor-pointer hover:ring-4 hover:ring-purple-500/30 transition-all duration-300 border-2 border-slate-600/50"
            onClick={() => onViewProfile?.(female)}
          >
            <AvatarImage 
              src={female.profile_photo} 
              onLoad={() => setImageLoaded(true)}
              className={`transition-all duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
            <AvatarFallback className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-white text-lg font-semibold">
              {female.full_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <h3 
          className="text-white font-semibold text-lg cursor-pointer hover:text-purple-400 transition-colors line-clamp-1"
          onClick={() => onViewProfile?.(female)}
        >
          {female.full_name}
        </h3>
        
        <div className="flex items-center justify-center space-x-3 text-sm text-gray-400 mt-2">
          <div className="flex items-center">
            <Cake className="h-4 w-4 mr-1" />
            {female.age} years
          </div>
          <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="line-clamp-1">{female.university}</span>
          </div>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 text-center">
          <div className="text-blue-400 font-semibold text-lg">{female.currentlyAssignedCount}</div>
          <div className="text-blue-300 text-xs">Assigned</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2 text-center">
          <div className="text-yellow-400 font-semibold text-lg">{female.selectedCount}</div>
          <div className="text-yellow-300 text-xs">Selected</div>
        </div>
        <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-2 text-center">
          <div className="text-pink-400 font-semibold text-lg">{female.permanentMatchCount}</div>
          <div className="text-pink-300 text-xs">Matches</div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="space-y-2">
        <Button
          onClick={() => onViewProfile?.(female)}
          variant="outline"
          size="sm"
          className="w-full border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all group-hover:border-slate-500/50"
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
        
        <Button
          onClick={onAssign}
          disabled={loading}
          size="sm"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-300 disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Assigning...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Target className="h-4 w-4 mr-2" />
              Assign Profile
            </div>
          )}
        </Button>
      </div>
      
      {/* Quick Info Badge */}
      <div className="mt-3 flex justify-center">
        <Badge className="bg-slate-700/50 text-slate-300 border-slate-600/50 text-xs">
          Profile #{index + 1}
        </Badge>
      </div>
    </div>
  )
})

// Keep the original FemaleProfileCard for compatibility
function FemaleProfileCard({ female, onAssign, loading, onViewProfile }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all duration-300"
    >
      <div className="text-center mb-4">
        <Avatar 
          className="h-16 w-16 mx-auto mb-3 cursor-pointer hover:ring-2 hover:ring-purple-500/50 transition-all"
          onClick={() => onViewProfile?.(female)}
        >
          <AvatarImage src={female.profile_photo} />
          <AvatarFallback>{female.full_name.charAt(0)}</AvatarFallback>
        </Avatar>
        <h3 
          className="text-white font-medium cursor-pointer hover:text-purple-400 transition-colors"
          onClick={() => onViewProfile?.(female)}
        >
          {female.full_name}
        </h3>
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
      
      <div className="space-x-2 mb-4">
        <Button
          onClick={() => onViewProfile?.(female)}
          variant="outline"
          size="sm"
          className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800/50"
        >
          <Info className="h-3 w-3 mr-1" />
          Details
        </Button>
        <Button
          onClick={onAssign}
          disabled={loading}
          size="sm"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
          ) : (
            <Plus className="h-3 w-3 mr-1" />
          )}
          {loading ? 'Assigning...' : 'Assign'}
        </Button>
      </div>
    </motion.div>
  )
}

// Enhanced Female User Profile Dialog
function EnhancedFemaleProfileDialog({ 
  femaleUser, 
  isOpen, 
  onClose 
}: { 
  femaleUser: EnhancedFemaleUser | null
  isOpen: boolean
  onClose: () => void
}) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      // Open new tab instead of document fullscreen to avoid scroll issues
      const newTab = window.open('', '_blank')
      if (newTab && femaleUser) {
        newTab.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Female User Profile - ${femaleUser.full_name}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
                color: white;
                min-height: 100vh;
              }
              .container { 
                max-width: 800px; 
                margin: 0 auto; 
                background: rgba(31, 41, 55, 0.8);
                border-radius: 12px;
                padding: 24px;
                border: 1px solid rgba(55, 65, 81, 0.5);
              }
              .profile-header { 
                display: flex; 
                align-items: center; 
                gap: 16px; 
                margin-bottom: 24px; 
              }
              .avatar { 
                width: 80px; 
                height: 80px; 
                border-radius: 50%; 
                background: rgba(139, 92, 246, 0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 32px;
                color: rgb(196, 181, 253);
              }
              .stats-grid { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                gap: 16px; 
                margin-bottom: 24px; 
              }
              .stat-card { 
                background: rgba(55, 65, 81, 0.3); 
                padding: 16px; 
                border-radius: 8px; 
                border: 1px solid rgba(75, 85, 99, 0.5);
              }
              .stat-value { 
                font-size: 24px; 
                font-weight: bold; 
                margin-bottom: 4px; 
              }
              .stat-label { 
                font-size: 12px; 
                opacity: 0.7; 
                text-transform: uppercase; 
                letter-spacing: 0.5px; 
              }
              .detail-section { 
                background: rgba(55, 65, 81, 0.3); 
                padding: 16px; 
                border-radius: 8px; 
                margin-bottom: 16px; 
                border: 1px solid rgba(75, 85, 99, 0.5);
              }
              .section-title { 
                font-weight: 600; 
                margin-bottom: 8px; 
                color: rgb(196, 181, 253); 
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="profile-header">
                <div class="avatar">${femaleUser.full_name.charAt(0)}</div>
                <div>
                  <h1 style="margin: 0; font-size: 28px;">${femaleUser.full_name}</h1>
                  <p style="margin: 4px 0; opacity: 0.8;">${femaleUser.email}</p>
                  <p style="margin: 4px 0; opacity: 0.6;">${femaleUser.university}</p>
                </div>
              </div>
              
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-value" style="color: rgb(34, 197, 94);">${femaleUser.currentlyAssignedCount}</div>
                  <div class="stat-label">Currently Assigned</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value" style="color: rgb(59, 130, 246);">${femaleUser.assignedCount}</div>
                  <div class="stat-label">Total Assigned</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value" style="color: rgb(245, 158, 11);">${femaleUser.selectedCount}</div>
                  <div class="stat-label">Selected Count</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value" style="color: rgb(236, 72, 153);">${femaleUser.permanentMatchCount}</div>
                  <div class="stat-label">Permanent Matches</div>
                </div>
              </div>

              <div class="detail-section">
                <div class="section-title">Profile Details</div>
                <p><strong>Age:</strong> ${femaleUser.age || 'N/A'}</p>
                <p><strong>University:</strong> ${femaleUser.university}</p>
                <p><strong>Status:</strong> ${femaleUser.is_active ?? true ? 'Active' : 'Inactive'}</p>
                <p><strong>Bio:</strong> ${femaleUser.bio || 'No bio available'}</p>
                <p><strong>Instagram:</strong> ${femaleUser.instagram ? '@' + femaleUser.instagram : 'Not provided'}</p>
              </div>

              <div class="detail-section">
                <div class="section-title">Assignment History</div>
                ${femaleUser.assignments && Array.isArray(femaleUser.assignments) && femaleUser.assignments.length > 0 
                  ? femaleUser.assignments.map((assignment: any) => `
                    <div style="padding: 8px; background: rgba(75, 85, 99, 0.2); border-radius: 4px; margin-bottom: 8px;">
                      <strong>${assignment.male_user?.full_name || 'Unknown'}</strong> - 
                      Status: ${assignment.status} | 
                      Round: ${assignment.round_number}
                    </div>
                  `).join('')
                  : '<p>No assignment history found.</p>'
                }
              </div>
            </div>
          </body>
          </html>
        `)
        newTab.document.close()
      }
    }
  }

  if (!femaleUser || !isOpen) return null

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog Content */}
      <div className="relative bg-gray-900/98 backdrop-blur-xl border border-gray-700/50 rounded-xl max-w-4xl max-h-[90vh] overflow-hidden w-full mx-4">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-purple-900/95 to-pink-900/95 border-b border-purple-700/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
                <User className="h-7 w-7 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Female User Profile
                </h2>
                <div className="text-sm font-medium text-gray-300 mt-1">
                  Complete profile information and statistics
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={toggleFullscreen}
                variant="outline"
                size="sm"
                className="border-purple-600/50 text-purple-300 hover:bg-purple-500/10 hover:border-purple-500/50 transition-all duration-200"
              >
                <Maximize2 className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/30 border border-transparent rounded-lg transition-all duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Enhanced Profile Header */}
          <div className="bg-gradient-to-r from-slate-800/80 to-gray-800/80 border border-slate-600/50 rounded-xl p-6">
            <div className="flex items-start space-x-6">
              {/* Profile Avatar */}
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-purple-500/30 shadow-xl shadow-purple-500/20">
                  <AvatarImage src={femaleUser.profile_photo} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500/30 to-pink-500/30 text-white text-2xl font-bold">
                    {femaleUser.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-green-500 border-2 border-gray-900 rounded-full h-6 w-6 flex items-center justify-center">
                  <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              
              {/* Profile Info */}
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{femaleUser.full_name}</h3>
                  <div className="flex items-center space-x-4 text-gray-300">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-blue-400" />
                      <span className="text-sm">{femaleUser.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Cake className="h-4 w-4 text-pink-400" />
                      <span className="text-sm">{femaleUser.age} years old</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-300">
                  <GraduationCap className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-medium">{femaleUser.university}</span>
                </div>
                
                {/* Status Badges */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/50 px-3 py-1">
                    <Users className="h-3 w-3 mr-1" />
                    Female Profile
                  </Badge>
                  {(femaleUser.is_active ?? true) && (
                    <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/50 px-3 py-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active User
                    </Badge>
                  )}
                  <Badge className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-300 border-blue-500/50 px-3 py-1">
                    <Clock className="h-3 w-3 mr-1" />
                    Online Now
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Statistics Dashboard */}
          <div className="bg-gradient-to-r from-slate-800/50 to-gray-800/50 border border-slate-600/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold text-white flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-400" />
                Profile Statistics
              </h4>
              <Badge className="bg-blue-500/10 text-blue-300 border-blue-500/30 px-3 py-1">
                Live Data
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div 
                className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <UserCheck className="h-5 w-5 text-green-400" />
                  <div className="text-2xl font-bold text-green-400">{femaleUser.currentlyAssignedCount}</div>
                </div>
                <div className="text-xs text-green-300 uppercase font-medium tracking-wide">Currently Assigned</div>
                <div className="text-xs text-gray-400 mt-1">Active assignments right now</div>
              </div>
              
              <div 
                className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <Target className="h-5 w-5 text-blue-400" />
                  <div className="text-2xl font-bold text-blue-400">{femaleUser.assignedCount}</div>
                </div>
                <div className="text-xs text-blue-300 uppercase font-medium tracking-wide">Total Assigned</div>
                <div className="text-xs text-gray-400 mt-1">Lifetime assignment count</div>
              </div>
              
              <div 
                className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <div className="text-2xl font-bold text-yellow-400">{femaleUser.selectedCount}</div>
                </div>
                <div className="text-xs text-yellow-300 uppercase font-medium tracking-wide">Selected Count</div>
                <div className="text-xs text-gray-400 mt-1">Times selected by users</div>
              </div>
              
              <div 
                className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/30 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <Heart className="h-5 w-5 text-pink-400" />
                  <div className="text-2xl font-bold text-pink-400">{femaleUser.permanentMatchCount}</div>
                </div>
                <div className="text-xs text-pink-300 uppercase font-medium tracking-wide">Permanent Matches</div>
                <div className="text-xs text-gray-400 mt-1">Successful long-term matches</div>
              </div>
            </div>
          </div>

          {/* Enhanced Profile Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Profile Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Age:</span>
                  <span className="text-white">{femaleUser.age || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">University:</span>
                  <span className="text-white truncate ml-2">{femaleUser.university}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={`${(femaleUser.is_active ?? true) ? 'text-green-400' : 'text-red-400'}`}>
                    {(femaleUser.is_active ?? true) ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Instagram:</span>
                  <span className="text-white">
                    {femaleUser.instagram ? `@${femaleUser.instagram}` : 'Not provided'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Assignment Analytics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Assignment Rate:</span>
                  <span className="text-green-400">
                    {femaleUser.totalAssignedCount > 0 
                      ? `${Math.round((femaleUser.selectedCount / femaleUser.totalAssignedCount) * 100)}%`
                      : '0%'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Match Success:</span>
                  <span className="text-pink-400">
                    {femaleUser.selectedCount > 0 
                      ? `${Math.round((femaleUser.permanentMatchCount / femaleUser.selectedCount) * 100)}%`
                      : '0%'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Assigned:</span>
                  <span className="text-white">
                    {femaleUser.lastAssignedAt 
                      ? new Date(femaleUser.lastAssignedAt).toLocaleDateString()
                      : 'Never'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Temp Matches:</span>
                  <span className="text-yellow-400">{femaleUser.currentTempMatches?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {femaleUser.bio && (
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Bio</h4>
              <p className="text-white text-sm leading-relaxed">{femaleUser.bio}</p>
            </div>
          )}

          {/* Assignment History */}
          {femaleUser.assignments && Array.isArray(femaleUser.assignments) && femaleUser.assignments.length > 0 && (
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Assignment History</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {femaleUser.assignments.map((assignment: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded text-sm">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={assignment.male_user?.profile_photo} />
                        <AvatarFallback className="text-xs">{assignment.male_user?.full_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-white font-medium">{assignment.male_user?.full_name}</div>
                        <div className="text-gray-400 text-xs">{assignment.male_user?.university}</div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Badge className={`text-xs ${
                        assignment.status === 'matched' 
                          ? 'bg-pink-500/20 text-pink-400 border-pink-500/50'
                          : assignment.status === 'assigned'
                          ? 'bg-green-500/20 text-green-400 border-green-500/50'
                          : assignment.status === 'selected'
                          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                          : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
                      }`}>
                        {assignment.status}
                      </Badge>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50 text-xs">
                        R{assignment.round_number}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

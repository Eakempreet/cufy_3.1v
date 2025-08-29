'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { 
  Users, 
  UserPlus, 
  Clock, 
  Heart, 
  Ban, 
  CheckCircle,
  AlertTriangle,
  Settings,
  Search,
  Filter,
  Calendar,
  User,
  DollarSign,
  Eye,
  X,
  Info,
  Star,
  Target
} from 'lucide-react'

interface User {
  id: string
  email: string
  full_name: string
  age: number
  gender: 'male' | 'female'
  university: string
  profile_photo: string
  bio: string
  created_at: string
  subscription_type?: string
  subscription_status?: string
  payment_confirmed?: boolean
  payment_proof_url?: string
  rounds_count?: number
  status?: 'active' | 'temporary' | 'permanent' | 'assigned'
}

interface ProfileAssignment {
  id: string
  male_user: User
  female_user: User
  created_at: string
  status: 'active' | 'revealed' | 'expired'
  male_revealed: boolean
  female_revealed: boolean
  assignment_count?: number
}

interface AssignmentDetails {
  female_user: User
  assignment_count: number
  status: 'assigned' | 'matched' | 'permanent'
  is_current_assignment: boolean
}

interface TemporaryMatch {
  id: string
  male_user: User
  female_user: User
  created_at: string
  expires_at: string
  male_disengaged: boolean
  female_disengaged: boolean
  time_remaining?: string
}

interface PermanentMatch {
  id: string
  male_user: User
  female_user: User
  created_at: string
  male_accepted: boolean
  female_accepted: boolean
  is_active: boolean
}

export default function AdminPanel() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [assignments, setAssignments] = useState<ProfileAssignment[]>([])
  const [temporaryMatches, setTemporaryMatches] = useState<TemporaryMatch[]>([])
  const [permanentMatches, setPermanentMatches] = useState<PermanentMatch[]>([])
  const [paymentUsers, setPaymentUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all')
  const [selectedMaleUser, setSelectedMaleUser] = useState<User | null>(null)
  const [availableProfiles, setAvailableProfiles] = useState<User[]>([])
  const [currentAssignments, setCurrentAssignments] = useState<AssignmentDetails[]>([])
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedPaymentProof, setSelectedPaymentProof] = useState<string | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)

  useEffect(() => {
    checkAdminAccess()
    fetchData()
  }, [])

  const checkAdminAccess = async () => {
    if (!session?.user?.email) {
      router.push('/')
      return
    }

    try {
      const response = await fetch('/api/admin/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email }),
      })

      const { isAdmin } = await response.json()
      if (!isAdmin) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error checking admin access:', error)
      router.push('/dashboard')
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [usersRes, assignmentsRes, temporaryRes, permanentRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/assignments'),
        fetch('/api/admin/temporary-matches'),
        fetch('/api/admin/permanent-matches')
      ])

      const [usersData, assignmentsData, temporaryData, permanentData] = await Promise.all([
        usersRes.json(),
        assignmentsRes.json(),
        temporaryRes.json(),
        permanentRes.json()
      ])

      setUsers(usersData.users || [])
      setAssignments(assignmentsData.assignments || [])
      setTemporaryMatches(temporaryData.matches || [])
      setPermanentMatches(permanentData.matches || [])
      
      // Fetch payment users separately
      const paymentRes = await fetch('/api/admin/payments')
      const paymentData = await paymentRes.json()
      setPaymentUsers(paymentData.users || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewPaymentProof = (user: User) => {
    // Assuming payment_proof_url is available in the user object
    setSelectedPaymentProof(user.payment_proof_url || '')
    setPaymentDialogOpen(true)
  }

  const confirmPayment = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'confirm' }),
      })

      const result = await response.json()

      if (response.ok) {
        await fetchData() // Refresh data
        alert('Payment confirmed successfully!')
      } else {
        console.error('Payment confirmation failed:', result)
        alert(result.error || 'Failed to confirm payment')
      }
    } catch (error) {
      console.error('Error confirming payment:', error)
      alert('An error occurred while confirming payment')
    }
  }

  const openAssignDialog = async (maleUser: User) => {
    setSelectedMaleUser(maleUser)
    
    try {
      // Fetch current assignments for this user
      const currentResponse = await fetch('/api/admin/user-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maleUserId: maleUser.id }),
      })
      
      const currentData = await currentResponse.json()
      setCurrentAssignments(currentData.assignments || [])
      
      // Fetch available profiles (excluding already assigned and permanent matches)
      const response = await fetch('/api/admin/available-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maleUserId: maleUser.id }),
      })
      
      const { profiles } = await response.json()
      setAvailableProfiles(profiles || [])
      setAssignDialogOpen(true)
    } catch (error) {
      console.error('Error fetching assignment data:', error)
    }
  }

  const assignProfile = async (femaleUserId: string) => {
    if (!selectedMaleUser) return

    // Check payment confirmation first
    if (!selectedMaleUser.payment_confirmed) {
      alert(`Cannot assign profile: ${selectedMaleUser.full_name}'s payment is not yet confirmed.`)
      return
    }

    // Check subscription-based assignment limits
    const currentAssignments = assignments.filter(a => 
      a.male_user.id === selectedMaleUser.id && a.status === 'active'
    ).length
    
    const maxAssignments = selectedMaleUser.subscription_type === 'premium' ? 3 : 1
    
    if (currentAssignments >= maxAssignments) {
      alert(`This user has reached their assignment limit (${maxAssignments} for ${selectedMaleUser.subscription_type} plan)`)
      return
    }

    try {
      const response = await fetch('/api/admin/assign-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maleUserId: selectedMaleUser.id,
          femaleUserId: femaleUserId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        alert(result.error || 'Failed to assign profile')
        return
      }

      if (response.ok) {
        await fetchData()
        await openAssignDialog(selectedMaleUser) // Refresh the dialog data
      }
    } catch (error) {
      console.error('Error assigning profile:', error)
      alert('An error occurred while assigning the profile')
    }
  }

  const getProfileStatus = (femaleUser: User) => {
    // Check if user is in permanent matches
    const permanentMatch = permanentMatches.find(pm => pm.female_user.id === femaleUser.id)
    if (permanentMatch) return 'permanent'
    
    // Check if user is in temporary matches  
    const tempMatch = temporaryMatches.find(tm => tm.female_user.id === femaleUser.id && !tm.male_disengaged && !tm.female_disengaged)
    if (tempMatch) return 'temp_locked'
    
    // Check assignment count
    const assignmentCount = assignments.filter(a => a.female_user.id === femaleUser.id && a.status === 'active').length
    if (assignmentCount > 0) return 'assigned'
    
    return 'available'
  }

  const getMaleUserStatus = (maleUser: User) => {
    // Check if user is in permanent matches
    const permanentMatch = permanentMatches.find(pm => pm.male_user.id === maleUser.id)
    if (permanentMatch) return 'permanent'
    
    // Check if user is in temporary matches  
    const tempMatch = temporaryMatches.find(tm => tm.male_user.id === maleUser.id && !tm.male_disengaged && !tm.female_disengaged)
    if (tempMatch) return 'temp_locked'
    
    // Check assignment count
    const assignmentCount = assignments.filter(a => a.male_user.id === maleUser.id && a.status === 'active').length
    if (assignmentCount >= 3) return 'max_assigned'
    
    return 'available'
  }

  const getAssignmentCount = (femaleUserId: string) => {
    return assignments.filter(a => a.female_user.id === femaleUserId && a.status === 'active').length
  }

  const handleDisengage = async (matchId: string, reason?: string) => {
    try {
      const response = await fetch('/api/admin/force-disengage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, reason }),
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error forcing disengage:', error)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGender = genderFilter === 'all' || user.gender === genderFilter
    return matchesSearch && matchesGender
  })

  const getCurrentAssignments = (userId: string) => {
    return assignments.filter(a => a.male_user.id === userId && a.status === 'active').length
  }

  const getPrevAssignments = (userId: string) => {
    return assignments.filter(a => a.male_user.id === userId).length
  }

  const getTempMatches = (userId: string) => {
    return temporaryMatches.filter(tm => tm.male_user.id === userId && !tm.male_disengaged && !tm.female_disengaged).length
  }

  const getPermanentMatches = (userId: string) => {
    return permanentMatches.filter(pm => pm.male_user.id === userId).length
  }

  const getSelectedMatch = (userId: string) => {
    const revealed = assignments.find(a => a.male_user.id === userId && (a.male_revealed || a.female_revealed))
    return revealed?.female_user.full_name || 'None Selected'
  }

  // New subscription-based statistics functions
  const getUnassignedGirls = () => {
    const assignedGirlIds = assignments
      .filter(a => a.status === 'active')
      .map(a => a.female_user.id)
    
    const tempMatchGirlIds = temporaryMatches
      .filter(tm => !tm.male_disengaged && !tm.female_disengaged)
      .map(tm => tm.female_user.id)
    
    const permMatchGirlIds = permanentMatches.map(pm => pm.female_user.id)
    
    const occupiedGirls = new Set([...assignedGirlIds, ...tempMatchGirlIds, ...permMatchGirlIds])
    
    return users.filter(user => 
      user.gender === 'female' && 
      !occupiedGirls.has(user.id)
    ).length
  }

  const getUnassignedBoys = () => {
    // Boys who haven't received any assignments yet and don't have temp/permanent matches
    return users.filter(user => {
      if (user.gender !== 'male' || !user.payment_confirmed) return false
      
      const hasAssignments = assignments.some(a => a.male_user.id === user.id)
      const hasTempMatches = temporaryMatches.some(tm => tm.male_user.id === user.id)
      const hasPermMatches = permanentMatches.some(pm => pm.male_user.id === user.id)
      
      return !hasAssignments && !hasTempMatches && !hasPermMatches
    }).length
  }

  const getBoysNeedingAssignment = () => {
    // Boys who have completed payment but don't have active assignments matching their subscription
    return users.filter(user => {
      if (user.gender !== 'male' || !user.payment_confirmed) return false
      
      const currentAssignments = assignments.filter(a => 
        a.male_user.id === user.id && a.status === 'active'
      ).length
      
      const expectedAssignments = user.subscription_type === 'premium' ? 3 : 1
      
      return currentAssignments < expectedAssignments
    }).length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading admin panel...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-6 py-8">
        {/* Modern Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Admin Dashboard
                  </h1>
                  <p className="text-slate-400 mt-1">
                    Manage users, assignments, and matches efficiently
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{users.length}</div>
                  <div className="text-sm text-slate-400">Total Users</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-pink-400">{getUnassignedGirls()}</div>
                  <div className="text-sm text-slate-400">Unassigned Girls</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-400">{getUnassignedBoys()}</div>
                  <div className="text-sm text-slate-400">New Boys</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-400">{getBoysNeedingAssignment()}</div>
                  <div className="text-sm text-slate-400">Need Assignments</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">{permanentMatches.length}</div>
                  <div className="text-sm text-slate-400">Matches</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-400">{temporaryMatches.length}</div>
                  <div className="text-sm text-slate-400">Pending</div>
                </div>
                <Button
                  onClick={fetchData}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Clean Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-1 mb-8">
            <TabsTrigger 
              value="users" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg px-6 py-3 transition-all"
            >
              <Users className="h-4 w-4 mr-2" />
              Users Management
            </TabsTrigger>
            <TabsTrigger 
              value="temporary" 
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white rounded-lg px-6 py-3 transition-all"
            >
              <Clock className="h-4 w-4 mr-2" />
              Temporary Zone
            </TabsTrigger>
            <TabsTrigger 
              value="permanent" 
              className="data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-lg px-6 py-3 transition-all"
            >
              <Heart className="h-4 w-4 mr-2" />
              Permanent Zone
            </TabsTrigger>
            <TabsTrigger 
              value="payments" 
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg px-6 py-3 transition-all"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Payments
            </TabsTrigger>
          </TabsList>

          {/* Users Tab - Redesigned */}
          <TabsContent value="users">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Modern Search Bar */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <Input
                      placeholder="Search users by name, email, or university..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 bg-white/5 border-white/20 text-white placeholder-slate-400 rounded-lg h-12"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant={genderFilter === 'all' ? 'default' : 'outline'}
                      onClick={() => setGenderFilter('all')}
                      className={`px-6 py-3 rounded-lg transition-all ${
                        genderFilter === 'all' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white/5 border-white/20 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      All Users
                    </Button>
                    <Button
                      variant={genderFilter === 'male' ? 'default' : 'outline'}
                      onClick={() => setGenderFilter('male')}
                      className={`px-6 py-3 rounded-lg transition-all ${
                        genderFilter === 'male' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white/5 border-white/20 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      Male
                    </Button>
                    <Button
                      variant={genderFilter === 'female' ? 'default' : 'outline'}
                      onClick={() => setGenderFilter('female')}
                      className={`px-6 py-3 rounded-lg transition-all ${
                        genderFilter === 'female' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white/5 border-white/20 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      Female
                    </Button>
                  </div>
                </div>
              </div>

              {/* Clean Users Grid */}
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-14 w-14 border-2 border-white/20">
                          <AvatarImage src={user.profile_photo} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
                            {user.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <h3 className="text-xl font-semibold text-white">
                            {user.full_name || 'Unknown'}
                          </h3>
                          <p className="text-slate-400">
                            {user.age} years old • {user.university}
                          </p>
                          <div className="flex items-center space-x-3">
                            <Badge 
                              variant="outline" 
                              className={`${
                                user.gender === 'male' 
                                  ? 'border-blue-500 text-blue-400 bg-blue-500/10' 
                                  : 'border-pink-500 text-pink-400 bg-pink-500/10'
                              } rounded-full px-3 py-1`}
                            >
                              {user.gender === 'male' ? '♂ Male' : '♀ Female'}
                            </Badge>
                            
                            {/* Subscription Badge for Male Users */}
                            {user.gender === 'male' && user.subscription_type && (
                              <Badge 
                                variant="outline" 
                                className={`${
                                  user.subscription_type === 'premium' 
                                    ? 'border-purple-500 text-purple-400 bg-purple-500/10' 
                                    : 'border-green-500 text-green-400 bg-green-500/10'
                                } rounded-full px-3 py-1`}
                              >
                                {user.subscription_type === 'premium' ? '₹249 Premium' : '₹99 Basic'}
                              </Badge>
                            )}

                            {/* Payment Status Badge for Male Users */}
                            {user.gender === 'male' && (
                              <Badge 
                                variant="outline" 
                                className={`${
                                  user.payment_confirmed 
                                    ? 'border-green-500 text-green-400 bg-green-500/10' 
                                    : 'border-orange-500 text-orange-400 bg-orange-500/10'
                                } rounded-full px-3 py-1`}
                              >
                                {user.payment_confirmed ? (
                                  <>
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Payment Confirmed
                                  </>
                                ) : (
                                  <>
                                    <Clock className="h-3 w-3 mr-1" />
                                    Payment Pending
                                  </>
                                )}
                              </Badge>
                            )}
                            
                            <span className="text-xs text-slate-500">
                              Joined {new Date(user.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {user.gender === 'male' && (
                          <>
                            <div className="text-right space-y-1">
                              <div className="text-sm text-slate-400">Current / Max Assignments</div>
                              <div className="text-2xl font-bold text-white">
                                {getCurrentAssignments(user.id)}/{user.subscription_type === 'premium' ? '3' : '1'}
                              </div>
                              <div className="text-xs text-slate-500">
                                Total Ever: {getPrevAssignments(user.id)}
                              </div>
                              <div className="flex space-x-3 text-xs text-slate-500">
                                <span className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>Temp: {getTempMatches(user.id)}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Heart className="h-3 w-3" />
                                  <span>Perm: {getPermanentMatches(user.id)}</span>
                                </span>
                              </div>
                              <div className="text-xs text-slate-500">
                                Selected: {getSelectedMatch(user.id)}
                              </div>
                              {getMaleUserStatus(user) === 'temp_locked' && (
                                <Badge variant="outline" className="border-orange-500 text-orange-400 bg-orange-500/10 rounded-full px-2 py-1 text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Temp Locked
                                </Badge>
                              )}
                              {user.payment_confirmed && getCurrentAssignments(user.id) < (user.subscription_type === 'premium' ? 3 : 1) && (
                                <Badge variant="outline" className="border-green-500 text-green-400 bg-green-500/10 rounded-full px-2 py-1 text-xs">
                                  <Target className="h-3 w-3 mr-1" />
                                  Needs Assignment
                                </Badge>
                              )}
                            </div>
                            
                            <Button
                              onClick={() => openAssignDialog(user)}
                              disabled={!user.payment_confirmed || getCurrentAssignments(user.id) >= 3 || getMaleUserStatus(user) === 'temp_locked'}
                              className={`px-6 py-3 rounded-lg transition-all ${
                                !user.payment_confirmed || getCurrentAssignments(user.id) >= 3 || getMaleUserStatus(user) === 'temp_locked'
                                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                              }`}
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              {!user.payment_confirmed ? 'Payment Not Confirmed' : 
                               getMaleUserStatus(user) === 'temp_locked' ? 'In Temporary Match' : 
                               getCurrentAssignments(user.id) >= 3 ? 'Max Assignments Reached' : 'Assign Profile'}
                            </Button>
                          </>
                        )}
                        
                        {user.gender === 'female' && (
                          <div className="text-right space-y-1">
                            <div className="text-sm text-slate-400">Current Status</div>
                            <Badge 
                              variant="outline" 
                              className={`${
                                getProfileStatus(user) === 'available'
                                  ? 'border-green-500 text-green-400 bg-green-500/10'
                                  : getProfileStatus(user) === 'temp_locked'
                                  ? 'border-orange-500 text-orange-400 bg-orange-500/10'
                                  : getProfileStatus(user) === 'assigned'
                                  ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                                  : 'border-purple-500 text-purple-400 bg-purple-500/10'
                              } rounded-full`}
                            >
                              {getProfileStatus(user) === 'available' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {getProfileStatus(user) === 'temp_locked' && <Clock className="h-3 w-3 mr-1" />}
                              {getProfileStatus(user) === 'assigned' && <User className="h-3 w-3 mr-1" />}
                              {getProfileStatus(user) === 'permanent' && <Heart className="h-3 w-3 mr-1 fill-current" />}
                              {getProfileStatus(user) === 'temp_locked' ? 'Temp Locked' : 
                               getProfileStatus(user) === 'available' ? 'Available' :
                               getProfileStatus(user) === 'assigned' ? 'Assigned' : 'Permanent'}
                            </Badge>
                            <div className="text-xs text-slate-500">
                              {getProfileStatus(user) === 'temp_locked' ? 'In temporary match' : 'Ready for assignment'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* Temporary Matches Tab - Redesigned */}
          <TabsContent value="temporary">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Temporary Zone</h2>
                    <p className="text-slate-400">48-hour decision period for matched couples</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {temporaryMatches.map((match) => {
                    const timeRemaining = new Date(match.expires_at).getTime() - new Date().getTime()
                    const hoursLeft = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60)))
                    const minutesLeft = Math.max(0, Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60)))
                    
                    return (
                      <div 
                        key={match.id} 
                        className="bg-white/5 border border-white/20 rounded-xl p-6 hover:bg-white/10 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-12 w-12 border-2 border-blue-500/50">
                                <AvatarImage src={match.male_user.profile_photo} />
                                <AvatarFallback className="bg-blue-500 text-white">
                                  {match.male_user.full_name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <Heart className="h-6 w-6 text-pink-400" />
                              <Avatar className="h-12 w-12 border-2 border-pink-500/50">
                                <AvatarImage src={match.female_user.profile_photo} />
                                <AvatarFallback className="bg-pink-500 text-white">
                                  {match.female_user.full_name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-white text-lg">
                                {match.male_user.full_name} ↔ {match.female_user.full_name}
                              </div>
                              <div className="text-sm text-slate-400">
                                Matched: {new Date(match.created_at).toLocaleDateString()}
                              </div>
                              <div className="flex items-center space-x-4 text-sm">
                                <span className={`flex items-center space-x-1 ${
                                  match.male_disengaged ? 'text-red-400' : 'text-green-400'
                                }`}>
                                  <div className={`w-2 h-2 rounded-full ${
                                    match.male_disengaged ? 'bg-red-400' : 'bg-green-400'
                                  }`} />
                                  <span>Male: {match.male_disengaged ? 'Disengaged' : 'Active'}</span>
                                </span>
                                <span className={`flex items-center space-x-1 ${
                                  match.female_disengaged ? 'text-red-400' : 'text-green-400'
                                }`}>
                                  <div className={`w-2 h-2 rounded-full ${
                                    match.female_disengaged ? 'bg-red-400' : 'bg-green-400'
                                  }`} />
                                  <span>Female: {match.female_disengaged ? 'Disengaged' : 'Active'}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right space-y-2">
                            <div className="text-2xl font-bold text-white">
                              {hoursLeft}h {minutesLeft}m
                            </div>
                            <div className="text-sm text-slate-400">Time remaining</div>
                            
                            {!match.male_disengaged && !match.female_disengaged && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="border-red-500 text-red-400 hover:bg-red-500/10 bg-red-500/5"
                                  >
                                    <Ban className="h-4 w-4 mr-2" />
                                    Force Disengage
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-slate-900 border-white/20">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-white">Force Disengage Match</AlertDialogTitle>
                                    <AlertDialogDescription className="text-slate-400">
                                      This will immediately disengage both users and move them back to the normal pool. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDisengage(match.id, 'Admin forced disengage')}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Confirm Disengage
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  
                  {temporaryMatches.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No temporary matches at the moment</p>
                      <p className="text-sm mt-2">Matched couples will appear here during their 48-hour decision period</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Permanent Matches Tab - Redesigned */}
          <TabsContent value="permanent">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Permanent Zone</h2>
                    <p className="text-slate-400">Successfully matched couples</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {permanentMatches.map((match) => (
                    <div 
                      key={match.id} 
                      className="bg-white/5 border border-white/20 rounded-xl p-6 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-12 w-12 border-2 border-green-500/50">
                              <AvatarImage src={match.male_user.profile_photo} />
                              <AvatarFallback className="bg-blue-500 text-white">
                                {match.male_user.full_name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <Heart className="h-6 w-6 text-green-400 fill-current" />
                            <Avatar className="h-12 w-12 border-2 border-green-500/50">
                              <AvatarImage src={match.female_user.profile_photo} />
                              <AvatarFallback className="bg-pink-500 text-white">
                                {match.female_user.full_name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="space-y-1">
                            <div className="font-semibold text-white text-lg">
                              {match.male_user.full_name} ↔ {match.female_user.full_name}
                            </div>
                            <div className="text-sm text-slate-400">
                              Permanently matched: {new Date(match.created_at).toLocaleDateString()}
                            </div>
                            <div className="flex items-center space-x-4 text-sm">
                              <span className={`flex items-center space-x-1 ${
                                match.male_accepted ? 'text-green-400' : 'text-yellow-400'
                              }`}>
                                <div className={`w-2 h-2 rounded-full ${
                                  match.male_accepted ? 'bg-green-400' : 'bg-yellow-400'
                                }`} />
                                <span>Male: {match.male_accepted ? 'Accepted' : 'Pending'}</span>
                              </span>
                              <span className={`flex items-center space-x-1 ${
                                match.female_accepted ? 'text-green-400' : 'text-yellow-400'
                              }`}>
                                <div className={`w-2 h-2 rounded-full ${
                                  match.female_accepted ? 'bg-green-400' : 'bg-yellow-400'
                                }`} />
                                <span>Female: {match.female_accepted ? 'Accepted' : 'Pending'}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Badge 
                            variant="outline" 
                            className="border-green-500 text-green-400 bg-green-500/10 rounded-full px-3 py-1"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Permanent Match
                          </Badge>
                          
                          {(!match.male_accepted || !match.female_accepted || !match.is_active) && (
                            <Badge 
                              variant="outline" 
                              className="border-yellow-500 text-yellow-400 bg-yellow-500/10 rounded-full px-3 py-1"
                            >
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {!match.is_active ? 'Inactive' : 'Pending'}
                            </Badge>
                          )}
                          
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-white/20 text-white hover:bg-white/10"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-red-500 text-red-400 hover:bg-red-500/10 bg-red-500/5"
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Remove
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-slate-900 border-white/20">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-white">Remove Permanent Match</AlertDialogTitle>
                                  <AlertDialogDescription className="text-slate-400">
                                    This will remove the permanent match and add both users back to the available pool. This action should only be used in exceptional circumstances.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                                    Remove Match
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {permanentMatches.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <Heart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No permanent matches yet</p>
                      <p className="text-sm mt-2">Successful couples from the temporary zone will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Payments Tab - Redesigned */}
          <TabsContent value="payments">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Payment Management</h2>
                    <p className="text-slate-400">Review and confirm user payments</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {paymentUsers.map((user) => (
                    <div 
                      key={user.id} 
                      className="bg-white/5 border border-white/20 rounded-xl p-6 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12 border-2 border-purple-500/50">
                            <AvatarImage src={user.profile_photo} />
                            <AvatarFallback className="bg-purple-500 text-white">
                              {user.full_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <div className="font-semibold text-white text-lg">
                              {user.full_name}
                            </div>
                            <div className="text-sm text-slate-400">
                              {user.email}
                            </div>
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="text-slate-300">
                                Subscription: {user.subscription_type === 'premium' ? '₹249 Premium' : user.subscription_type === 'basic' ? '₹99 Basic' : 'None'}
                              </span>
                              {user.gender === 'male' && user.subscription_type && (
                                <span className="text-slate-300">
                                  Profiles: {getCurrentAssignments(user.id)}/{user.subscription_type === 'premium' ? '3' : '1'}
                                </span>
                              )}
                              <span className="text-slate-300">
                                Rounds: {user.rounds_count || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <Badge 
                            variant="outline" 
                            className={`${
                              user.payment_confirmed 
                                ? 'border-green-500 text-green-400 bg-green-500/10' 
                                : 'border-yellow-500 text-yellow-400 bg-yellow-500/10'
                            } rounded-full px-3 py-1`}
                          >
                            {user.payment_confirmed ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Payment Confirmed
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3 mr-1" />
                                Pending Confirmation
                              </>
                            )}
                          </Badge>
                          
                          <div className="flex space-x-2">
                            <Button 
                              onClick={() => handleViewPaymentProof(user)}
                              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Proof
                            </Button>
                            {!user.payment_confirmed && (
                              <Button 
                                onClick={() => confirmPayment(user.id)}
                                className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirm
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {paymentUsers.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <DollarSign className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No payment confirmations pending</p>
                      <p className="text-sm mt-2">Payment requests will appear here for review</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </TabsContent>

        </Tabs>

        {/* Assignment Dialog - NEW */}
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogContent className="max-w-4xl bg-slate-900/95 backdrop-blur-xl border border-white/20">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-400" />
                <span>Assign Profile to {selectedMaleUser?.full_name}</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-6 space-y-6">
              {/* Current Assignments Section */}
              {currentAssignments.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <Info className="h-5 w-5 text-blue-400" />
                    <span>Current Assignments ({currentAssignments.length}/3)</span>
                  </h3>
                  <div className="grid gap-3">
                    {currentAssignments.map((assignment, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-4"
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10 border-2 border-pink-500/50">
                            <AvatarImage src={assignment.female_user.profile_photo} />
                            <AvatarFallback className="bg-pink-500 text-white text-sm">
                              {assignment.female_user.full_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-white">
                              {assignment.female_user.full_name}
                            </div>
                            <div className="text-sm text-slate-400">
                              {assignment.female_user.age} • {assignment.female_user.university}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge 
                            variant="outline" 
                            className={`${
                              assignment.status === 'permanent' 
                                ? 'border-green-500 text-green-400 bg-green-500/10'
                                : assignment.status === 'matched'
                                ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10'
                                : 'border-blue-500 text-blue-400 bg-blue-500/10'
                            } rounded-full px-3 py-1`}
                          >
                            {assignment.status === 'permanent' && <Heart className="h-3 w-3 mr-1 fill-current" />}
                            {assignment.status === 'matched' && <Clock className="h-3 w-3 mr-1" />}
                            {assignment.status === 'assigned' && <User className="h-3 w-3 mr-1" />}
                            {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                          </Badge>
                          <span className="text-sm text-slate-400">
                            Assignment #{assignment.assignment_count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Profiles Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-400" />
                  <span>Available Profiles ({availableProfiles.length})</span>
                </h3>
                
                {availableProfiles.length > 0 ? (
                  <div className="grid gap-3 max-h-96 overflow-y-auto">
                    {availableProfiles.map((profile) => {
                      const status = getProfileStatus(profile)
                      const assignmentCount = getAssignmentCount(profile.id)
                      
                      return (
                        <div 
                          key={profile.id}
                          className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all"
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12 border-2 border-pink-500/50">
                              <AvatarImage src={profile.profile_photo} />
                              <AvatarFallback className="bg-pink-500 text-white">
                                {profile.full_name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <div className="font-medium text-white text-lg">
                                {profile.full_name}
                              </div>
                              <div className="text-sm text-slate-400">
                                {profile.age} years old • {profile.university}
                              </div>
                              <div className="text-xs text-slate-500">
                                {profile.bio?.substring(0, 50)}...
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className="text-right space-y-1">
                              <Badge 
                                variant="outline" 
                                className={`${
                                  status === 'available' 
                                    ? 'border-green-500 text-green-400 bg-green-500/10'
                                    : status === 'assigned'
                                    ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                                    : status === 'temp_locked'
                                    ? 'border-orange-500 text-orange-400 bg-orange-500/10'
                                    : 'border-yellow-500 text-yellow-400 bg-yellow-500/10'
                                } rounded-full px-3 py-1`}
                              >
                                {status === 'available' && <CheckCircle className="h-3 w-3 mr-1" />}
                                {status === 'assigned' && <User className="h-3 w-3 mr-1" />}
                                {status === 'temp_locked' && <Clock className="h-3 w-3 mr-1" />}
                                {status === 'permanent' && <Heart className="h-3 w-3 mr-1 fill-current" />}
                                {status === 'temp_locked' ? 'Temp Locked' : status.charAt(0).toUpperCase() + status.slice(1)}
                              </Badge>
                              <div className="text-xs text-slate-400">
                                {assignmentCount > 0 ? `${assignmentCount} assignment${assignmentCount > 1 ? 's' : ''}` : 'No assignments'}
                              </div>
                            </div>
                            
                            <Button
                              onClick={() => assignProfile(profile.id)}
                              disabled={status !== 'available' || assignmentCount >= 2}
                              className={`px-4 py-2 rounded-lg transition-all ${
                                status !== 'available' || assignmentCount >= 2
                                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                              }`}
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              {status === 'temp_locked' ? 'Locked' : 'Assign'}
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No available profiles</p>
                    <p className="text-sm mt-2">All female users are either already assigned or in permanent matches</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t border-white/20 pt-4 flex justify-end space-x-3">
              <Button
                onClick={() => setAssignDialogOpen(false)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setAssignDialogOpen(false)
                  fetchData() // Refresh all data
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Settings className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Payment Proof Dialog - Redesigned */}
        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
          <DialogContent className="max-w-3xl bg-slate-900/95 backdrop-blur-xl border border-white/20">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white flex items-center space-x-2">
                <Eye className="h-5 w-5 text-blue-400" />
                <span>Payment Proof Verification</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-6">
              {selectedPaymentProof ? (
                <div className="text-center space-y-4">
                  <img 
                    src={selectedPaymentProof} 
                    alt="Payment Proof" 
                    className="max-w-full h-auto rounded-xl border border-white/20 shadow-2xl mx-auto"
                  />
                  <p className="text-slate-400 text-sm">Review the payment proof above and confirm if valid</p>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <AlertTriangle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No payment proof available</p>
                  <p className="text-sm mt-2">The user hasn't uploaded payment proof yet</p>
                </div>
              )}
            </div>
            
            <div className="border-t border-white/20 pt-4 flex justify-end">
              <Button
                onClick={() => setPaymentDialogOpen(false)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { 
  Users, 
  UserPlus, 
  Clock, 
  Heart, 
  CheckCircle,
  AlertTriangle,
  Settings,
  Search,
  User,
  DollarSign,
  Eye,
  X,
  Target,
  UserX,
  ToggleLeft,
  ToggleRight,
  Shield,
  Trash2,
  Phone,
  Mail,
  Calendar,
  Instagram,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Database
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
  phone_number?: string
  year_of_study?: string
  instagram?: string
}

interface Assignment {
  id: string
  male_user_id: string
  female_user_id: string
  status: 'assigned' | 'revealed' | 'disengaged' | 'expired'
  male_revealed: boolean
  female_revealed: boolean
  assigned_at: string
  revealed_at?: string
  disengaged_at?: string
  expired_at?: string
  created_at: string
  updated_at: string
  male_user?: User
  female_user?: User
}

interface TemporaryMatch {
  id: string
  assignment_id: string
  male_user_id: string
  female_user_id: string
  status: 'active' | 'expired' | 'promoted' | 'disengaged'
  male_decision?: 'accept' | 'reject'
  female_decision?: 'accept' | 'reject'
  male_decided_at?: string
  female_decided_at?: string
  created_at: string
  expires_at: string
  male_user?: User
  female_user?: User
}

interface PermanentMatch {
  id: string
  temporary_match_id?: string
  male_user_id: string
  female_user_id: string
  status: 'active' | 'inactive'
  instagram_shared: boolean
  connection_made: boolean
  created_at: string
  male_user?: User
  female_user?: User
}

export default function AdminPanel() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [temporaryMatches, setTemporaryMatches] = useState<TemporaryMatch[]>([])
  const [permanentMatches, setPermanentMatches] = useState<PermanentMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userViewDialogOpen, setUserViewDialogOpen] = useState(false)
  const [selectedPaymentProof, setSelectedPaymentProof] = useState<string | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(20)
  const [totalUsers, setTotalUsers] = useState(0)
  const [fetchedUsers, setFetchedUsers] = useState(0)
  const [boysRegistrationEnabled, setBoysRegistrationEnabled] = useState(true)
  const [selectedMaleUser, setSelectedMaleUser] = useState<User | null>(null)
  const [selectedFemaleUser, setSelectedFemaleUser] = useState<User | null>(null)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('users')

  useEffect(() => {
    checkAdminAccess()
    fetchData()
    fetchAssignments()
    fetchTemporaryMatches()
    fetchPermanentMatches()
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
      // Add cache busting parameter to prevent caching issues on Vercel
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/admin/users?_=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const data = await response.json()
      
      console.log('Fetched users data:', data)
      
      setUsers(data.users || [])
      setTotalUsers(data.total || 0)
      setFetchedUsers(data.fetched || 0)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/admin/assignments')
      const data = await response.json()
      setAssignments(data.assignments || [])
    } catch (error) {
      console.error('Error fetching assignments:', error)
    }
  }

  const fetchTemporaryMatches = async () => {
    try {
      const response = await fetch('/api/admin/temporary-matches')
      const data = await response.json()
      setTemporaryMatches(data.matches || [])
    } catch (error) {
      console.error('Error fetching temporary matches:', error)
    }
  }

  const fetchPermanentMatches = async () => {
    try {
      const response = await fetch('/api/admin/permanent-matches')
      const data = await response.json()
      setPermanentMatches(data.matches || [])
    } catch (error) {
      console.error('Error fetching permanent matches:', error)
    }
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setUserViewDialogOpen(true)
  }

  const handleDeleteUser = async (user: User) => {
    try {
      // Optimistic update - remove user from UI immediately
      const originalUsers = [...users]
      setUsers(users.filter(u => u.id !== user.id))
      setTotalUsers(prev => prev - 1)
      setFetchedUsers(prev => prev - 1)

      const response = await fetch('/api/admin/users/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })

      const result = await response.json()

      if (result.success) {
        // Fetch fresh data to ensure consistency
        await fetchData()
        alert('User deleted successfully!')
      } else {
        // Revert optimistic update on error
        setUsers(originalUsers)
        setTotalUsers(prev => prev + 1)
        setFetchedUsers(prev => prev + 1)
        alert(result.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      // Fetch fresh data on error to ensure consistency
      await fetchData()
      alert('An error occurred while deleting the user')
    }
  }

  const handleAssignProfile = async (user: User) => {
    try {
      const response = await fetch('/api/admin/assignments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })

      const result = await response.json()
      if (response.ok) {
        alert(`Assignment created successfully! ${result.message || ''}`)
        fetchAssignments()
        fetchTemporaryMatches()
      } else {
        alert(result.error || 'Failed to create assignment')
      }
    } catch (error) {
      console.error('Error creating assignment:', error)
      alert('Error creating assignment')
    }
  }

  const handleViewPaymentProof = (user: User) => {
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
        await fetchData()
        alert('Payment confirmed successfully!')
      } else {
        alert(result.error || 'Failed to confirm payment')
      }
    } catch (error) {
      console.error('Error confirming payment:', error)
      alert('An error occurred while confirming payment')
    }
  }

  const toggleBoysRegistration = async () => {
    try {
      const response = await fetch('/api/admin/system-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_boys_registration' }),
      })

      const result = await response.json()

      if (result.success) {
        setBoysRegistrationEnabled(result.new_value)
        alert(result.message)
      } else {
        alert('Failed to toggle boys registration')
      }
    } catch (error) {
      console.error('Error toggling boys registration:', error)
      alert('An error occurred while toggling boys registration')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.university?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGender = genderFilter === 'all' || user.gender === genderFilter
    return matchesSearch && matchesGender
  })

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="h-12 w-12 text-blue-400 mx-auto animate-spin" />
          <div className="text-white text-xl">Loading Admin Dashboard...</div>
          <div className="text-slate-400">Fetching user data and analytics</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-6 py-8">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Professional Admin Dashboard
                  </h1>
                  <p className="text-slate-400 mt-1">
                    Complete user management & analytics platform
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-slate-400">Database Status</div>
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 font-medium">Connected</span>
                  </div>
                </div>
                <Button
                  onClick={fetchData}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 flex items-center space-x-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
                </Button>
              </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{totalUsers}</div>
                <div className="text-xs text-slate-400">Total DB</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{fetchedUsers}</div>
                <div className="text-xs text-slate-400">Fetched</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-pink-400">{users.filter(u => u.gender === 'female').length}</div>
                <div className="text-xs text-slate-400">Girls</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{users.filter(u => u.gender === 'male').length}</div>
                <div className="text-xs text-slate-400">Boys</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{users.filter(u => u.payment_confirmed).length}</div>
                <div className="text-xs text-slate-400">Paid</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{users.filter(u => u.subscription_type === 'premium').length}</div>
                <div className="text-xs text-slate-400">Premium</div>
              </div>
            </div>

            {/* Data consistency warning */}
            {totalUsers !== fetchedUsers && (
              <div className="mt-4 bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-orange-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">
                    Database shows {totalUsers} users but only {fetchedUsers} were fetched. 
                    Some users may not be displayed.
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-1 mb-8">
            <TabsTrigger 
              value="users" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg px-6 py-3 transition-all"
            >
              <Users className="h-4 w-4 mr-2" />
              Users ({users.length})
            </TabsTrigger>
            <TabsTrigger 
              value="system" 
              className="data-[state=active]:bg-red-500 data-[state=active]:text-white rounded-lg px-6 py-3 transition-all"
            >
              <Shield className="h-4 w-4 mr-2" />
              System Controls
            </TabsTrigger>
            <TabsTrigger 
              value="payments" 
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg px-6 py-3 transition-all"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger 
              value="temp-zone" 
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white rounded-lg px-6 py-3 transition-all"
            >
              <Clock className="h-4 w-4 mr-2" />
              Temp Zone
            </TabsTrigger>
            <TabsTrigger 
              value="permanent-zone" 
              className="data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-lg px-6 py-3 transition-all"
            >
              <Heart className="h-4 w-4 mr-2" />
              Permanent Zone
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Search & Filter */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <Input
                      placeholder="Search by name, email, university..."
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
                      All ({users.length})
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
                      Male ({users.filter(u => u.gender === 'male').length})
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
                      Female ({users.filter(u => u.gender === 'female').length})
                    </Button>
                    <Button
                      onClick={fetchData}
                      disabled={loading}
                      className={`px-4 py-3 rounded-lg transition-all bg-green-600 hover:bg-green-700 text-white border-0 ${loading ? 'opacity-50' : ''}`}
                      title="Refresh user data"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>

                {/* Pagination Info */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                  <div className="text-sm text-slate-400">
                    Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <span className="px-3 py-1 bg-white/10 rounded-lg text-white text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Users Grid */}
              <div className="space-y-4">
                {currentUsers.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-16 w-16 border-2 border-white/20">
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
                          <div className="flex items-center space-x-3 text-sm">
                            <span className="text-slate-500">{user.email}</span>
                            {user.phone_number && (
                              <span className="text-slate-500">• {user.phone_number}</span>
                            )}
                          </div>
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
                                    Confirmed
                                  </>
                                ) : (
                                  <>
                                    <Clock className="h-3 w-3 mr-1" />
                                    Pending
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
                      
                      <div className="flex flex-col space-y-2">
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleViewUser(user)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            onClick={() => handleAssignProfile(user)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                            disabled={user.subscription_type === 'none' || !user.payment_confirmed}
                          >
                            <Target className="h-4 w-4 mr-2" />
                            Assign
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="border-red-500 text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-slate-900 border-white/20">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">Delete User</AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-400">
                                  Are you sure you want to delete {user.full_name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteUser(user)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete User
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* System Controls Tab */}
          <TabsContent value="system">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">System Controls</h2>
                    <p className="text-slate-400">Manage registration settings</p>
                  </div>
                </div>

                <Card className="bg-white/5 border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-3">
                      <UserX className="h-5 w-5 text-red-400" />
                      <span>Boys Registration Control</span>
                      <Badge 
                        variant="outline" 
                        className={`${
                          boysRegistrationEnabled 
                            ? 'border-green-500 text-green-400 bg-green-500/10' 
                            : 'border-red-500 text-red-400 bg-red-500/10'
                        } rounded-full px-3 py-1 ml-auto`}
                      >
                        {boysRegistrationEnabled ? 'ENABLED' : 'DISABLED'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="space-y-1">
                        <div className="text-white font-medium">
                          {boysRegistrationEnabled ? 'Boys Can Join' : 'Boys Registration Stopped'}
                        </div>
                        <div className="text-sm text-slate-400">
                          {boysRegistrationEnabled 
                            ? 'Boys can create new accounts and join the platform'
                            : 'New boys registration is blocked'
                          }
                        </div>
                      </div>
                      
                      <Button
                        onClick={toggleBoysRegistration}
                        className={`px-6 py-3 rounded-lg transition-all flex items-center space-x-2 ${
                          boysRegistrationEnabled
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {boysRegistrationEnabled ? (
                          <>
                            <ToggleRight className="h-5 w-5" />
                            <span>Stop Registration</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-5 w-5" />
                            <span>Enable Registration</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </TabsContent>

          {/* Payments Tab */}
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
                  {users.filter(user => user.gender === 'male' && user.subscription_type).map((user) => (
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
                              {user.email} • {user.subscription_type === 'premium' ? '₹249 Premium' : '₹99 Basic'}
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
                            {user.payment_confirmed ? 'Confirmed' : 'Pending'}
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
                  
                  {users.filter(user => user.gender === 'male' && user.subscription_type).length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <DollarSign className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No payment records found</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Temp Zone Tab */}
          <TabsContent value="temp-zone">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-yellow-400">Active Matches</h3>
                        <p className="text-3xl font-bold text-yellow-300">{temporaryMatches.filter(m => m.status === 'active').length}</p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border-red-500/20 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-red-400">Disengaged</h3>
                        <p className="text-3xl font-bold text-red-300">{temporaryMatches.filter(m => m.status === 'disengaged').length}</p>
                      </div>
                      <UserX className="h-8 w-8 text-red-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-blue-400">Expired</h3>
                        <p className="text-3xl font-bold text-blue-300">{temporaryMatches.filter(m => m.status === 'expired').length}</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-black/20 border-white/10 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    Temporary Matches (48-hour window)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {temporaryMatches.length > 0 ? (
                    <div className="grid gap-4">
                      {temporaryMatches.map((match) => (
                        <div key={match.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <Badge 
                                variant="outline" 
                                className={`${
                                  match.status === 'active' ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10' :
                                  match.status === 'disengaged' ? 'border-red-500 text-red-400 bg-red-500/10' :
                                  'border-gray-500 text-gray-400 bg-gray-500/10'
                                } rounded-full px-3 py-1`}
                              >
                                {match.status.toUpperCase()}
                              </Badge>
                              <span className="text-sm text-gray-400">
                                Created: {new Date(match.created_at).toLocaleDateString()}
                              </span>
                              <span className="text-sm text-orange-400">
                                Expires: {new Date(match.expires_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Male User */}
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                              <h4 className="text-blue-400 font-semibold mb-2">Male User</h4>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={match.male_user?.profile_photo || `/placeholder.svg?height=48&width=48`} />
                                  <AvatarFallback>{match.male_user?.full_name?.charAt(0) || 'M'}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold text-white">{match.male_user?.full_name || 'Unknown'}</p>
                                  <p className="text-sm text-gray-400">{match.male_user?.university || 'N/A'}</p>
                                  <p className="text-xs text-blue-400">
                                    Decision: {match.male_decision || 'Pending'}
                                    {match.male_decided_at && ` (${new Date(match.male_decided_at).toLocaleDateString()})`}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Female User */}
                            <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-4">
                              <h4 className="text-pink-400 font-semibold mb-2">Female User</h4>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={match.female_user?.profile_photo || `/placeholder.svg?height=48&width=48`} />
                                  <AvatarFallback>{match.female_user?.full_name?.charAt(0) || 'F'}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold text-white">{match.female_user?.full_name || 'Unknown'}</p>
                                  <p className="text-sm text-gray-400">{match.female_user?.university || 'N/A'}</p>
                                  <p className="text-xs text-pink-400">
                                    Decision: {match.female_decision || 'Pending'}
                                    {match.female_decided_at && ` (${new Date(match.female_decided_at).toLocaleDateString()})`}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Clock className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-400 mb-2">No Temporary Matches</h3>
                      <p className="text-gray-500">No active temporary matches found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Permanent Zone Tab */}
          <TabsContent value="permanent-zone">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-green-400">Total Matches</h3>
                        <p className="text-3xl font-bold text-green-300">{permanentMatches.length}</p>
                      </div>
                      <Heart className="h-8 w-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-purple-400">Active Connections</h3>
                        <p className="text-3xl font-bold text-purple-300">{permanentMatches.filter(m => m.status === 'active').length}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-orange-400">Instagram Shared</h3>
                        <p className="text-3xl font-bold text-orange-300">{permanentMatches.filter(m => m.instagram_shared).length}</p>
                      </div>
                      <Instagram className="h-8 w-8 text-orange-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-black/20 border-white/10 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    Permanent Matches (Successful Connections)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {permanentMatches.length > 0 ? (
                    <div className="grid gap-4">
                      {permanentMatches.map((match) => (
                        <div key={match.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <Badge 
                                variant="outline" 
                                className={`${
                                  match.status === 'active' ? 'border-green-500 text-green-400 bg-green-500/10' :
                                  'border-gray-500 text-gray-400 bg-gray-500/10'
                                } rounded-full px-3 py-1`}
                              >
                                {match.status.toUpperCase()}
                              </Badge>
                              <span className="text-sm text-gray-400">
                                Connected: {new Date(match.created_at).toLocaleDateString()}
                              </span>
                              {match.instagram_shared && (
                                <Badge variant="outline" className="border-pink-500 text-pink-400 bg-pink-500/10 rounded-full px-3 py-1">
                                  Instagram Shared
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Male User */}
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                              <h4 className="text-blue-400 font-semibold mb-2">Male User</h4>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={match.male_user?.profile_photo || `/placeholder.svg?height=48&width=48`} />
                                  <AvatarFallback>{match.male_user?.full_name?.charAt(0) || 'M'}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold text-white">{match.male_user?.full_name || 'Unknown'}</p>
                                  <p className="text-sm text-gray-400">{match.male_user?.university || 'N/A'}</p>
                                  {match.male_user?.instagram && (
                                    <p className="text-xs text-blue-400">@{match.male_user.instagram}</p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Female User */}
                            <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-4">
                              <h4 className="text-pink-400 font-semibold mb-2">Female User</h4>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={match.female_user?.profile_photo || `/placeholder.svg?height=48&width=48`} />
                                  <AvatarFallback>{match.female_user?.full_name?.charAt(0) || 'F'}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold text-white">{match.female_user?.full_name || 'Unknown'}</p>
                                  <p className="text-sm text-gray-400">{match.female_user?.university || 'N/A'}</p>
                                  {match.female_user?.instagram && (
                                    <p className="text-xs text-pink-400">@{match.female_user.instagram}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-400 mb-2">No Permanent Matches</h3>
                      <p className="text-gray-500">No permanent connections found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* User View Dialog */}
        <Dialog open={userViewDialogOpen} onOpenChange={setUserViewDialogOpen}>
          <DialogContent className="max-w-4xl bg-slate-900/95 backdrop-blur-xl border border-white/20">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center space-x-3">
                <Avatar className="h-12 w-12 border-2 border-white/20">
                  <AvatarImage src={selectedUser?.profile_photo} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {selectedUser?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span>{selectedUser?.full_name || 'Unknown User'}</span>
                  <div className="text-sm text-slate-400 font-normal">Complete Profile View</div>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            {selectedUser && (
              <div className="py-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center space-x-2">
                        <User className="h-5 w-5 text-blue-400" />
                        <span>Basic Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-slate-400">Full Name</div>
                          <div className="text-white font-medium">{selectedUser.full_name}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-400">Age</div>
                          <div className="text-white font-medium">{selectedUser.age} years</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-400">Gender</div>
                          <Badge className={`${
                            selectedUser.gender === 'male' 
                              ? 'bg-blue-500/20 text-blue-400' 
                              : 'bg-pink-500/20 text-pink-400'
                          }`}>
                            {selectedUser.gender === 'male' ? '♂ Male' : '♀ Female'}
                          </Badge>
                        </div>
                        <div>
                          <div className="text-sm text-slate-400">University</div>
                          <div className="text-white font-medium">{selectedUser.university}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center space-x-2">
                        <Mail className="h-5 w-5 text-green-400" />
                        <span>Contact Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="text-sm text-slate-400">Email</div>
                        <div className="text-white font-medium break-all">{selectedUser.email}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400">Phone</div>
                        <div className="text-white font-medium">{selectedUser.phone_number || 'Not provided'}</div>
                      </div>
                      {selectedUser.instagram && (
                        <div>
                          <div className="text-sm text-slate-400">Instagram</div>
                          <div className="text-white font-medium flex items-center space-x-2">
                            <Instagram className="h-4 w-4 text-pink-400" />
                            <span>@{selectedUser.instagram}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Bio */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Bio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-white">{selectedUser.bio || 'No bio provided'}</div>
                  </CardContent>
                </Card>

                {/* Account Info */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-yellow-400" />
                      <span>Account Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-slate-400">Account Created</div>
                        <div className="text-white font-medium">
                          {new Date(selectedUser.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400">User ID</div>
                        <div className="text-white font-mono text-sm">{selectedUser.id}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <div className="border-t border-white/20 pt-4 flex justify-between">
              <Button
                onClick={() => setUserViewDialogOpen(false)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Close
              </Button>
              <div className="flex space-x-3">
                {selectedUser && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="border-red-500 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete User
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-slate-900 border-white/20">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Delete User</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                          Are you sure you want to permanently delete {selectedUser?.full_name}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => {
                            if (selectedUser) {
                              setUserViewDialogOpen(false)
                              handleDeleteUser(selectedUser)
                            }
                          }}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete User
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Payment Proof Dialog */}
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

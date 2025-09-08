'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
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
  ExternalLink,
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
  Database,
  StickyNote,
  Plus,
  Edit,
  Save,
  LogOut,
  Crown,
  Filter,
  Download,
  Upload,
  FileText,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Star,
  Award,
  Zap,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  MapPin,
  CreditCard,
  Building2,
  GraduationCap,
  CakeIcon
} from 'lucide-react'

interface User {
  id: string
  email: string
  full_name: string
  age: number
  gender: string
  university: string
  year_of_study: string
  course: string
  profile_photo: string
  bio: string
  instagram_handle: string
  created_at: string
  subscription_type: string
  subscription_status: string
  payment_confirmed: boolean
  payment_proof_url: string
  user_device_info: any
  is_admin: boolean
  last_active: string
  engagement_score: number
  reveal_count: number
  match_count: number
  rounds_participated: number
}

interface AdminNote {
  id: string
  user_id: string
  admin_email: string
  note: string
  created_at: string
}

interface Statistics {
  totalUsers: number
  maleUsers: number
  femaleUsers: number
  activeUsers: number
  pendingPayments: number
  confirmedPayments: number
  totalRevenue: number
  newUsersToday: number
  engagementRate: number
}

export default function AdminPanel() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [genderFilter, setGenderFilter] = useState('all')
  const [subscriptionFilter, setSubscriptionFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(10)
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [adminNotes, setAdminNotes] = useState<AdminNote[]>([])
  const [newNote, setNewNote] = useState('')
  const [showNoteDialog, setShowNoteDialog] = useState(false)
  const [selectedAction, setSelectedAction] = useState('')
  const [bulkSelectedUsers, setBulkSelectedUsers] = useState<string[]>([])
  const [showPaymentProof, setShowPaymentProof] = useState<string | null>(null)

  // Check if user is admin
  const isAdmin = session?.user?.email === 'cufy.online@gmail.com'

  useEffect(() => {
    if (!isAdmin && session?.user) {
      router.push('/')
    }
  }, [session, isAdmin, router])

  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }, [isAdmin])

  const fetchStatistics = useCallback(async () => {
    if (!isAdmin) return

    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('gender, subscription_type, payment_confirmed, created_at, last_active')

      if (error) throw error

      const stats: Statistics = {
        totalUsers: users.length,
        maleUsers: users.filter(u => u.gender === 'male').length,
        femaleUsers: users.filter(u => u.gender === 'female').length,
        activeUsers: users.filter(u => {
          const lastActive = new Date(u.last_active || u.created_at)
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
          return lastActive > oneDayAgo
        }).length,
        pendingPayments: users.filter(u => u.subscription_type && !u.payment_confirmed).length,
        confirmedPayments: users.filter(u => u.payment_confirmed).length,
        totalRevenue: users
          .filter(u => u.payment_confirmed)
          .reduce((sum, u) => sum + (u.subscription_type === 'premium' ? 249 : 99), 0),
        newUsersToday: users.filter(u => {
          const created = new Date(u.created_at)
          const today = new Date()
          return created.toDateString() === today.toDateString()
        }).length,
        engagementRate: 0 // Calculate based on your engagement metrics
      }

      setStatistics(stats)
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }, [isAdmin])

  const fetchAdminNotes = useCallback(async (userId: string) => {
    if (!isAdmin) return

    try {
      const { data, error } = await supabase
        .from('admin_notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAdminNotes(data || [])
    } catch (error) {
      console.error('Error fetching admin notes:', error)
    }
  }, [isAdmin])

  useEffect(() => {
    if (isAdmin) {
      fetchUsers()
      fetchStatistics()
    }
  }, [isAdmin, fetchUsers, fetchStatistics])

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.university?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (genderFilter !== 'all') {
      filtered = filtered.filter(user => user.gender === genderFilter)
    }

    if (subscriptionFilter !== 'all') {
      filtered = filtered.filter(user => user.subscription_type === subscriptionFilter)
    }

    if (paymentFilter !== 'all') {
      if (paymentFilter === 'confirmed') {
        filtered = filtered.filter(user => user.payment_confirmed)
      } else if (paymentFilter === 'pending') {
        filtered = filtered.filter(user => user.subscription_type && !user.payment_confirmed)
      } else if (paymentFilter === 'none') {
        filtered = filtered.filter(user => !user.subscription_type)
      }
    }

    setFilteredUsers(filtered)
    setCurrentPage(1)
  }, [users, searchTerm, genderFilter, subscriptionFilter, paymentFilter])

  const confirmPayment = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          payment_confirmed: true,
          subscription_status: 'active'
        })
        .eq('id', userId)

      if (error) throw error
      
      await fetchUsers()
      await fetchStatistics()
    } catch (error) {
      console.error('Error confirming payment:', error)
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (error) throw error
      
      await fetchUsers()
      await fetchStatistics()
      setSelectedUser(null)
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const addAdminNote = async () => {
    if (!selectedUser || !newNote.trim()) return

    try {
      const { error } = await supabase
        .from('admin_notes')
        .insert({
          user_id: selectedUser.id,
          admin_email: session?.user?.email,
          note: newNote.trim()
        })

      if (error) throw error
      
      setNewNote('')
      setShowNoteDialog(false)
      await fetchAdminNotes(selectedUser.id)
    } catch (error) {
      console.error('Error adding admin note:', error)
    }
  }

  const handleBulkAction = async () => {
    if (!selectedAction || bulkSelectedUsers.length === 0) return

    try {
      if (selectedAction === 'confirm_payment') {
        const { error } = await supabase
          .from('users')
          .update({ 
            payment_confirmed: true,
            subscription_status: 'active'
          })
          .in('id', bulkSelectedUsers)

        if (error) throw error
      } else if (selectedAction === 'delete') {
        const { error } = await supabase
          .from('users')
          .delete()
          .in('id', bulkSelectedUsers)

        if (error) throw error
      }

      setBulkSelectedUsers([])
      setSelectedAction('')
      await fetchUsers()
      await fetchStatistics()
    } catch (error) {
      console.error('Error performing bulk action:', error)
    }
  }

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">You don&apos;t have permission to access this admin panel.</p>
            <Button onClick={() => router.push('/')} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-white/70">Manage users, payments, and system operations</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={fetchUsers}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
            <Button
              onClick={() => signOut()}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-white/70">Total Users</p>
                    <p className="text-2xl font-bold text-white">{statistics.totalUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-white/70">Pending Payments</p>
                    <p className="text-2xl font-bold text-white">{statistics.pendingPayments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-white/70">Confirmed Payments</p>
                    <p className="text-2xl font-bold text-white">{statistics.confirmedPayments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-purple-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-white/70">Total Revenue</p>
                    <p className="text-2xl font-bold text-white">₹{statistics.totalRevenue}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card className="bg-white/10 border-white/20 mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>

              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Filter by gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>

              <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Filter by subscription" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subscriptions</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>

              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Filter by payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="none">No Subscription</SelectItem>
                </SelectContent>
              </Select>

              {bulkSelectedUsers.length > 0 && (
                <div className="flex space-x-2">
                  <Select value={selectedAction} onValueChange={setSelectedAction}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Bulk actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirm_payment">Confirm Payments</SelectItem>
                      <SelectItem value="delete">Delete Users</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleBulkAction}
                    disabled={!selectedAction}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Apply ({bulkSelectedUsers.length})
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-white/10 border-white/20">
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4 text-white/70">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBulkSelectedUsers(currentUsers.map(u => u.id))
                          } else {
                            setBulkSelectedUsers([])
                          }
                        }}
                        checked={bulkSelectedUsers.length === currentUsers.length && currentUsers.length > 0}
                        className="rounded"
                      />
                    </th>
                    <th className="text-left py-3 px-4 text-white/70">User</th>
                    <th className="text-left py-3 px-4 text-white/70">University</th>
                    <th className="text-left py-3 px-4 text-white/70">Subscription</th>
                    <th className="text-left py-3 px-4 text-white/70">Payment</th>
                    <th className="text-left py-3 px-4 text-white/70">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user) => (
                    <tr key={user.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={bulkSelectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBulkSelectedUsers([...bulkSelectedUsers, user.id])
                            } else {
                              setBulkSelectedUsers(bulkSelectedUsers.filter(id => id !== user.id))
                            }
                          }}
                          className="rounded"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.profile_photo} />
                            <AvatarFallback>
                              <User className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-white font-medium">{user.full_name}</p>
                            <p className="text-white/60 text-sm">{user.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={`text-xs ${
                                user.gender === 'male' 
                                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/50' 
                                  : 'bg-pink-500/20 text-pink-300 border-pink-500/50'
                              }`}>
                                {user.gender} • {user.age}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-white text-sm">{user.university}</p>
                          <p className="text-white/60 text-xs">{user.course} • {user.year_of_study}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {user.subscription_type ? (
                          <Badge className={`${
                            user.subscription_type === 'premium' 
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' 
                              : 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                          }`}>
                            {user.subscription_type} - ₹{user.subscription_type === 'premium' ? '249' : '99'}
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/50">
                            No subscription
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {user.subscription_type && (
                          <Badge className={`${
                            user.payment_confirmed 
                              ? 'bg-green-500/20 text-green-300 border-green-500/50' 
                              : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
                          }`}>
                            {user.payment_confirmed ? 'Confirmed' : 'Pending'}
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => {
                              setSelectedUser(user)
                              fetchAdminNotes(user.id)
                            }}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {user.subscription_type && !user.payment_confirmed && (
                            <Button
                              onClick={() => confirmPayment(user.id)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {user.payment_proof_url && (
                            <Button
                              onClick={() => setShowPaymentProof(user.payment_proof_url)}
                              size="sm"
                              variant="outline"
                              className="border-white/20 text-white hover:bg-white/10"
                            >
                              <CreditCard className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-white/70 text-sm">
                  Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                    <Button
                      key={number}
                      onClick={() => paginate(number)}
                      size="sm"
                      variant={currentPage === number ? "default" : "outline"}
                      className={currentPage === number 
                        ? "bg-blue-600 hover:bg-blue-700" 
                        : "border-white/20 text-white hover:bg-white/10"
                      }
                    >
                      {number}
                    </Button>
                  ))}
                  <Button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Details Modal */}
        {selectedUser && (
          <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white text-xl">User Details</DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Info */}
                <Card className="bg-white/10 border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={selectedUser.profile_photo} />
                        <AvatarFallback>
                          <User className="h-8 w-8" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-white font-semibold text-lg">{selectedUser.full_name}</h3>
                        <p className="text-white/70">{selectedUser.email}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge className={`${
                            selectedUser.gender === 'male' 
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/50' 
                              : 'bg-pink-500/20 text-pink-300 border-pink-500/50'
                          }`}>
                            {selectedUser.gender} • {selectedUser.age}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-white/70">University</p>
                        <p className="text-white">{selectedUser.university}</p>
                      </div>
                      <div>
                        <p className="text-white/70">Course</p>
                        <p className="text-white">{selectedUser.course}</p>
                      </div>
                      <div>
                        <p className="text-white/70">Year of Study</p>
                        <p className="text-white">{selectedUser.year_of_study}</p>
                      </div>
                      <div>
                        <p className="text-white/70">Instagram</p>
                        <p className="text-white">{selectedUser.instagram_handle || 'Not provided'}</p>
                      </div>
                    </div>

                    {selectedUser.bio && (
                      <div>
                        <p className="text-white/70 text-sm">Bio</p>
                        <p className="text-white text-sm mt-1">{selectedUser.bio}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Subscription & Payment Info */}
                <Card className="bg-white/10 border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Subscription & Payment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-white/70 text-sm">Subscription Type</p>
                        {selectedUser.subscription_type ? (
                          <Badge className={`mt-1 ${
                            selectedUser.subscription_type === 'premium' 
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' 
                              : 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                          }`}>
                            {selectedUser.subscription_type} - ₹{selectedUser.subscription_type === 'premium' ? '249' : '99'}
                          </Badge>
                        ) : (
                          <Badge className="mt-1 bg-gray-500/20 text-gray-300 border-gray-500/50">
                            No subscription
                          </Badge>
                        )}
                      </div>
                      <div>
                        <p className="text-white/70 text-sm">Payment Status</p>
                        {selectedUser.subscription_type ? (
                          <Badge className={`mt-1 ${
                            selectedUser.payment_confirmed 
                              ? 'bg-green-500/20 text-green-300 border-green-500/50' 
                              : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
                          }`}>
                            {selectedUser.payment_confirmed ? 'Confirmed' : 'Pending'}
                          </Badge>
                        ) : (
                          <Badge className="mt-1 bg-gray-500/20 text-gray-300 border-gray-500/50">
                            No payment required
                          </Badge>
                        )}
                      </div>
                    </div>

                    {selectedUser.subscription_type && !selectedUser.payment_confirmed && (
                      <Button
                        onClick={() => confirmPayment(selectedUser.id)}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm Payment
                      </Button>
                    )}

                    {selectedUser.payment_proof_url && (
                      <Button
                        onClick={() => setShowPaymentProof(selectedUser.payment_proof_url)}
                        variant="outline"
                        className="w-full border-white/20 text-white hover:bg-white/10"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Payment Proof
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Admin Notes */}
                <Card className="bg-white/10 border-white/20 lg:col-span-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center">
                        <StickyNote className="h-5 w-5 mr-2" />
                        Admin Notes
                      </CardTitle>
                      <Button
                        onClick={() => setShowNoteDialog(true)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Note
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-40 overflow-y-auto">
                      {adminNotes.length > 0 ? (
                        adminNotes.map((note) => (
                          <div key={note.id} className="bg-white/5 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-white/70 text-sm">{note.admin_email}</p>
                              <p className="text-white/50 text-xs">
                                {new Date(note.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <p className="text-white text-sm">{note.note}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-white/50 text-sm text-center py-4">No admin notes yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="bg-red-500/10 border-red-500/50 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-red-400 flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Danger Zone
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete User
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-gray-900 border-gray-700">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Delete User</AlertDialogTitle>
                          <AlertDialogDescription className="text-white/70">
                            Are you sure you want to delete this user? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteUser(selectedUser.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Add Note Dialog */}
        <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
          <DialogContent className="bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Add Admin Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Enter your note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                rows={4}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  onClick={() => setShowNoteDialog(false)}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={addAdminNote}
                  disabled={!newNote.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Note
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Payment Proof Modal */}
        {showPaymentProof && (
          <Dialog open={!!showPaymentProof} onOpenChange={() => setShowPaymentProof(null)}>
            <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white flex items-center justify-between">
                  Payment Proof
                  <Button
                    onClick={() => setShowPaymentProof(null)}
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DialogTitle>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-auto">
                <Image
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/payment-proofs/${showPaymentProof}`}
                  alt="Payment Proof"
                  width={600}
                  height={800}
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}

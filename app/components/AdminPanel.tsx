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
  Database,
  StickyNote,
  Plus,
  Edit,
  Save
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

interface AdminNote {
  id: string
  user_id: string
  admin_email: string
  note: string
  created_at: string
  updated_at: string
}

export default function AdminPanel() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userViewDialogOpen, setUserViewDialogOpen] = useState(false)
  const [selectedPaymentProof, setSelectedPaymentProof] = useState<string | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(20)
  const [totalUsers, setTotalUsers] = useState(0)
  const [fetchedUsers, setFetchedUsers] = useState(0)
  const [boysRegistrationEnabled, setBoysRegistrationEnabled] = useState(true)
  const [activeTab, setActiveTab] = useState('users')
  
  // Admin Notes state
  const [adminNotes, setAdminNotes] = useState<AdminNote[]>([])
  const [newNote, setNewNote] = useState('')
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingNoteText, setEditingNoteText] = useState('')

  // Payments pagination
  const [paymentPage, setPaymentPage] = useState(1)
  const paymentsPerPage = 10

  useEffect(() => {
    // Check URL parameters for active tab
    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get('tab')
    if (tabParam && ['users', 'system', 'payments'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
    
    checkAdminAccess()
    fetchData()
  }, [])

  // Update URL when tab changes
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab)
    const url = new URL(window.location.href)
    url.searchParams.set('tab', newTab)
    window.history.replaceState({}, '', url.toString())
  }

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
      // Fetch users data
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      
      console.log('Fetched users data:', data)
      
      setUsers(data.users || [])
      setTotalUsers(data.total || 0)
      setFetchedUsers(data.fetched || 0)

      // Fetch system settings to get current boys registration status
      await fetchSystemSettings()
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSystemSettings = async () => {
    try {
      const response = await fetch('/api/admin/system-settings')
      const data = await response.json()
      
      if (data.success && data.settings) {
        // Find boys registration setting
        const boysRegSetting = data.settings.find((setting: any) => 
          setting.setting_key === 'boys_registration_enabled'
        )
        
        if (boysRegSetting) {
          const isEnabled = boysRegSetting.setting_value === true || boysRegSetting.setting_value === 'true'
          setBoysRegistrationEnabled(isEnabled)
          console.log('Boys registration status from DB:', isEnabled)
        }
      }
    } catch (error) {
      console.error('Error fetching system settings:', error)
      // Fallback to true if unable to fetch
      setBoysRegistrationEnabled(true)
    }
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setUserViewDialogOpen(true)
    fetchAdminNotes(user.id)
  }

  const handleDeleteUser = async (user: User) => {
    try {
      const response = await fetch('/api/admin/users/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })

      const result = await response.json()

      if (result.success) {
        await fetchData()
        alert('User deleted successfully!')
      } else {
        alert(result.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('An error occurred while deleting the user')
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

  // Admin Notes Functions
  const fetchAdminNotes = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/notes?userId=${userId}&adminEmail=${session?.user?.email}`)
      const result = await response.json()
      
      if (response.ok) {
        setAdminNotes(result.notes || [])
      } else {
        console.error('Error fetching notes:', result.error)
      }
    } catch (error) {
      console.error('Error fetching admin notes:', error)
    }
  }

  const addAdminNote = async () => {
    if (!newNote.trim() || !selectedUser) return

    try {
      const response = await fetch('/api/admin/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          adminEmail: session?.user?.email,
          note: newNote.trim()
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setAdminNotes(prev => [result.note, ...prev])
        setNewNote('')
        setIsAddingNote(false)
      } else {
        alert(result.error || 'Failed to add note')
      }
    } catch (error) {
      console.error('Error adding note:', error)
      alert('An error occurred while adding the note')
    }
  }

  const updateAdminNote = async (noteId: string, noteText: string) => {
    try {
      const response = await fetch('/api/admin/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteId,
          adminEmail: session?.user?.email,
          note: noteText
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setAdminNotes(prev => prev.map(note => 
          note.id === noteId ? result.note : note
        ))
        setEditingNoteId(null)
        setEditingNoteText('')
      } else {
        alert(result.error || 'Failed to update note')
      }
    } catch (error) {
      console.error('Error updating note:', error)
      alert('An error occurred while updating the note')
    }
  }

  const deleteAdminNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const response = await fetch(`/api/admin/notes?noteId=${noteId}&adminEmail=${session?.user?.email}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (response.ok) {
        setAdminNotes(prev => prev.filter(note => note.id !== noteId))
      } else {
        alert(result.error || 'Failed to delete note')
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('An error occurred while deleting the note')
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
        // Update UI state immediately
        setBoysRegistrationEnabled(result.new_value)
        
        // Also fetch from database to ensure consistency
        await fetchSystemSettings()
        
        alert(result.message)
        console.log('Boys registration toggled to:', result.new_value)
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
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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

                {(() => {
                  const paymentUsers = users.filter(user => user.gender === 'male' && user.subscription_type)
                  const totalPaymentPages = Math.ceil(paymentUsers.length / paymentsPerPage)
                  const startIndex = (paymentPage - 1) * paymentsPerPage
                  const endIndex = startIndex + paymentsPerPage
                  const currentPaymentUsers = paymentUsers.slice(startIndex, endIndex)

                  return (
                    <>
                      {/* Pagination Info for Payments */}
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                        <div className="text-sm text-slate-400">
                          Showing {startIndex + 1}-{Math.min(endIndex, paymentUsers.length)} of {paymentUsers.length} payment records
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => setPaymentPage(prev => Math.max(prev - 1, 1))}
                            disabled={paymentPage === 1}
                            variant="outline"
                            size="sm"
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Previous
                          </Button>
                          <span className="px-3 py-1 bg-white/10 rounded-lg text-white text-sm">
                            Page {paymentPage} of {totalPaymentPages}
                          </span>
                          <Button
                            onClick={() => setPaymentPage(prev => Math.min(prev + 1, totalPaymentPages))}
                            disabled={paymentPage === totalPaymentPages}
                            variant="outline"
                            size="sm"
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            Next
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                
                      <div className="space-y-4">
                        {currentPaymentUsers.map((user) => (
                          <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.01 }}
                            className="bg-white/5 border border-white/20 rounded-xl p-6 hover:bg-white/10 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <Avatar className="h-16 w-16 border-2 border-purple-500/50">
                                  <AvatarImage src={user.profile_photo} />
                                  <AvatarFallback className="bg-purple-500 text-white text-lg">
                                    {user.full_name?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="space-y-2">
                                  <div className="font-semibold text-white text-xl">
                                    {user.full_name}
                                  </div>
                                  <div className="text-sm text-slate-400">
                                    {user.email}
                                  </div>
                                  <div className="flex items-center space-x-3">
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
                                    <span className="text-xs text-slate-500">
                                      Joined {new Date(user.created_at).toLocaleDateString()}
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
                                  } rounded-full px-4 py-2 text-sm font-medium`}
                                >
                                  {user.payment_confirmed ? (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Confirmed
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="h-4 w-4 mr-1" />
                                      Pending
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
                          </motion.div>
                        ))}
                        
                        {paymentUsers.length === 0 && (
                          <div className="text-center py-12 text-slate-500">
                            <DollarSign className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">No payment records found</p>
                            <p className="text-sm mt-2">No male users with subscriptions found</p>
                          </div>
                        )}
                      </div>
                    </>
                  )
                })()}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* User View Dialog */}
        <Dialog open={userViewDialogOpen} onOpenChange={(open) => {
          setUserViewDialogOpen(open)
          if (!open) {
            // Reset notes state when dialog closes
            setAdminNotes([])
            setNewNote('')
            setIsAddingNote(false)
            setEditingNoteId(null)
            setEditingNoteText('')
          }
        }}>
          <DialogContent className="max-w-6xl bg-slate-900/95 backdrop-blur-xl border border-white/20">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">
                Complete Profile View - {selectedUser?.full_name || 'Unknown User'}
              </DialogTitle>
            </DialogHeader>
            
            {selectedUser && (
              <div className="py-6 max-h-[80vh] overflow-y-auto">
                <div className="flex gap-8">
                  {/* Large Profile Image - Left Side */}
                  <div className="flex-shrink-0">
                    <div className="w-80 h-96 bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                      {selectedUser.profile_photo ? (
                        <img 
                          src={selectedUser.profile_photo} 
                          alt={selectedUser.full_name}
                          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                          onClick={() => {
                            setSelectedPaymentProof(selectedUser.profile_photo)
                            setShowImageModal(true)
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-600/20">
                          <div className="text-center">
                            <User className="h-20 w-20 text-white/50 mx-auto mb-4" />
                            <div className="text-white/70 text-lg font-medium">No Profile Photo</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Profile Details - Right Side */}
                  <div className="flex-1 space-y-6">
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

                {/* Admin Notes Section */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <StickyNote className="h-5 w-5 text-yellow-400" />
                        <span>Admin Notes</span>
                      </div>
                      <Button
                        onClick={() => setIsAddingNote(true)}
                        variant="outline"
                        size="sm"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Note
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Add New Note */}
                    {isAddingNote && (
                      <div className="space-y-3 p-4 bg-white/5 rounded-lg border border-white/10">
                        <textarea
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Add a note about this user..."
                          className="w-full bg-slate-800 border border-white/20 rounded-lg p-3 text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none resize-none"
                          rows={3}
                        />
                        <div className="flex justify-end space-x-2">
                          <Button
                            onClick={() => {
                              setIsAddingNote(false)
                              setNewNote('')
                            }}
                            variant="outline"
                            size="sm"
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={addAdminNote}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={!newNote.trim()}
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Save Note
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Existing Notes */}
                    {adminNotes.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <StickyNote className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No admin notes yet</p>
                        <p className="text-sm mt-1">Add notes to keep track of important information about this user</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {adminNotes.map((note) => (
                          <div key={note.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                            {editingNoteId === note.id ? (
                              <div className="space-y-3">
                                <textarea
                                  value={editingNoteText}
                                  onChange={(e) => setEditingNoteText(e.target.value)}
                                  className="w-full bg-slate-800 border border-white/20 rounded-lg p-3 text-white focus:border-blue-400 focus:outline-none resize-none"
                                  rows={3}
                                />
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    onClick={() => {
                                      setEditingNoteId(null)
                                      setEditingNoteText('')
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="border-white/20 text-white hover:bg-white/10"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() => updateAdminNote(note.id, editingNoteText)}
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    <Save className="h-4 w-4 mr-1" />
                                    Update
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex justify-between items-start mb-2">
                                  <div className="text-sm text-slate-400">
                                    By {note.admin_email} • {new Date(note.created_at).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                  <div className="flex space-x-1">
                                    <Button
                                      onClick={() => {
                                        setEditingNoteId(note.id)
                                        setEditingNoteText(note.note)
                                      }}
                                      variant="outline"
                                      size="sm"
                                      className="border-white/20 text-white hover:bg-white/10 p-1 h-8 w-8"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      onClick={() => deleteAdminNote(note.id)}
                                      variant="outline"
                                      size="sm"
                                      className="border-red-500/20 text-red-400 hover:bg-red-500/10 p-1 h-8 w-8"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="text-white whitespace-pre-wrap">{note.note}</div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                  </div>
                </div>
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
          <DialogContent className="max-w-5xl max-h-[90vh] bg-slate-900/95 backdrop-blur-xl border border-white/20">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white flex items-center space-x-2">
                <Eye className="h-5 w-5 text-blue-400" />
                <span>Payment Proof Verification</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-6 max-h-[70vh] overflow-y-auto">
              {selectedPaymentProof ? (
                <div className="text-center space-y-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <img 
                      src={selectedPaymentProof} 
                      alt="Payment Proof" 
                      className="max-w-full max-h-[60vh] h-auto rounded-xl border border-white/20 shadow-2xl mx-auto cursor-pointer hover:scale-105 transition-transform duration-300"
                      onClick={() => {
                        setShowImageModal(true)
                        setPaymentDialogOpen(false)
                      }}
                    />
                  </div>
                  <p className="text-slate-400 text-sm">
                    Click on the image to view in full size • Review the payment proof and confirm if valid
                  </p>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <AlertTriangle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No payment proof available</p>
                  <p className="text-sm mt-2">The user hasn&apos;t uploaded payment proof yet</p>
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

        {/* Large Image Modal */}
        <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
          <DialogContent className="max-w-4xl bg-slate-900/95 backdrop-blur-xl border border-white/20 p-2">
            <div className="relative">
              <Button
                onClick={() => setShowImageModal(false)}
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 z-10 bg-black/50 border-white/20 text-white hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </Button>
              {selectedPaymentProof && (
                <img 
                  src={selectedPaymentProof} 
                  alt="Large view"
                  className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

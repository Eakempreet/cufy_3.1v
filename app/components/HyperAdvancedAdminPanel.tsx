'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from './ui/textarea'
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
  Filter,
  Download,
  Upload,
  FileText,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Crown,
  Star,
  MessageSquare,
  Camera,
  MapPin,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Maximize2,
  Minimize2,
  Copy,
  Lock,
  Unlock,
  UserCheck,
  Ban,
  AlertCircle,
  Info,
  CheckSquare,
  Square,
  Grid3X3,
  List,
  PieChart,
  LineChart,
  Calendar as CalendarIcon,
  CreditCard,
  Wallet,
  Receipt,
  Building,
  GraduationCap,
  BookOpen,
  Award,
  Flag,
  MapPin as LocationIcon,
  Clock3,
  Timer,
  Hourglass,
  PlayCircle,
  PauseCircle,
  StopCircle,
  SkipForward,
  FastForward,
  Rewind,
  Ruler
} from 'lucide-react'

// Enhanced interfaces with more detailed user data
interface EnhancedUser {
  id: string
  email: string
  full_name: string
  age: number
  gender: 'male' | 'female'
  university: string
  profile_photo: string
  bio: string
  created_at: string
  updated_at: string
  last_active: string
  subscription_type?: 'basic' | 'premium'
  subscription_status?: 'active' | 'expired' | 'pending'
  payment_confirmed?: boolean
  payment_proof_url?: string
  payment_amount?: number
  payment_date?: string
  rounds_count?: number
  matches_count?: number
  reveals_count?: number
  phone_number?: string
  year_of_study?: string
  instagram?: string
  status: 'active' | 'suspended' | 'banned' | 'pending'
  verification_status: 'verified' | 'pending' | 'rejected'
  device_info?: {
    browser?: string
    os?: string
    device_type?: 'mobile' | 'desktop' | 'tablet'
    last_ip?: string
    location?: string
  }
  engagement_metrics?: {
    login_count: number
    profile_views: number
    messages_sent: number
    last_login: string
    session_duration: number
  }
  profile_completion: number
  flags: string[]
  notes_count: number
}

interface AdminNote {
  id: string
  user_id: string
  admin_email: string
  note: string
  type: 'warning' | 'system'
  created_at: string
  updated_at: string
}

interface PaymentRecord {
  id: string
  user_id: string
  amount: number
  currency: 'INR'
  status: 'pending' | 'confirmed' | 'rejected' | 'refunded'
  method: 'upi' | 'card' | 'netbanking'
  transaction_id?: string
  proof_url?: string
  created_at: string
  confirmed_at?: string
  admin_email?: string
}

interface AdminStats {
  total_users: number
  male_users: number
  female_users: number
  verified_users: number
  pending_users: number
  suspended_users: number
  total_payments: number
  confirmed_payments: number
  pending_payments: number
  total_revenue: number
  monthly_signups: number
  daily_active_users: number
  popular_universities: { name: string, count: number }[]
  age_distribution: { range: string, count: number }[]
  subscription_distribution: { type: string, count: number }[]
}

interface FilterOptions {
  gender: 'all' | 'male' | 'female'
  status: 'all' | 'active' | 'suspended' | 'banned' | 'pending'
  verification: 'all' | 'verified' | 'pending' | 'rejected'
  subscription: 'all' | 'basic' | 'premium' | 'none'
  payment: 'all' | 'confirmed' | 'review' | 'none'
  university: string
  age_range: { min: number, max: number }
  date_range: { start: string, end: string }
  sort_by: 'created_at' | 'last_active' | 'full_name' | 'age' | 'matches_count'
  sort_order: 'asc' | 'desc'
}

// Helper function to get payment proof URL
const getPaymentProofUrl = (filename: string | null) => {
  if (!filename) return null
  
  // If it's already a full URL, return as-is
  if (filename.startsWith('http') || filename.startsWith('https')) {
    return filename
  }
  
  // Otherwise, construct the Supabase Storage URL
  const { data } = supabase.storage
    .from('payment-proofs')
    .getPublicUrl(filename)
  
  return data.publicUrl
}

export default function AdminPanel() {
  const { data: session } = useSession()
  const router = useRouter()
  
  // Core state
  const [users, setUsers] = useState<EnhancedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  // Search and filtering
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({
    gender: 'all',
    status: 'all',
    verification: 'all',
    subscription: 'all',
    payment: 'all',
    university: '',
    age_range: { min: 18, max: 30 },
    date_range: { start: '', end: '' },
    sort_by: 'created_at',
    sort_order: 'desc'
  })
  
  // UI state
  const [activeTab, setActiveTab] = useState('users')
  const [selectedUser, setSelectedUser] = useState<EnhancedUser | null>(null)
  const [userDetailDialogOpen, setUserDetailDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false)
  const [selectedPaymentProof, setSelectedPaymentProof] = useState<{ url: string, user: string } | null>(null)
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('table')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedFullPhoto, setSelectedFullPhoto] = useState<{ url: string, name: string } | null>(null)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage, setUsersPerPage] = useState(25)
  const [totalUsers, setTotalUsers] = useState(0)
  
  // Admin notes
  const [adminNotes, setAdminNotes] = useState<AdminNote[]>([])
  const [newNote, setNewNote] = useState('')
  const [newNoteType, setNewNoteType] = useState<'warning' | 'system'>('system')
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingNoteText, setEditingNoteText] = useState('')
  
  // System controls
  const [boysRegistrationEnabled, setBoysRegistrationEnabled] = useState(true)
  const [systemMaintenanceMode, setSystemMaintenanceMode] = useState(false)
  
  // Real-time updates - DISABLED by default to prevent excessive refreshing
  const [realTimeUpdates, setRealTimeUpdates] = useState(false)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<number>(0) // Add caching timestamp
  const [isTabVisible, setIsTabVisible] = useState(true) // Track tab visibility

  const fetchUsers = useCallback(async (forceRefresh = false) => {
    try {
      // Implement caching - don't fetch if data is fresh (less than 2 minutes old)
      const now = Date.now()
      const CACHE_DURATION = 2 * 60 * 1000 // 2 minutes
      
      if (!forceRefresh && lastFetchTime && (now - lastFetchTime) < CACHE_DURATION && users.length > 0) {
        console.log('Using cached data, skipping fetch')
        return
      }
      
      const queryParams = new URLSearchParams()
      queryParams.append('page', currentPage.toString())
      queryParams.append('limit', usersPerPage.toString())
      queryParams.append('search', debouncedSearchTerm)
      
      // Add filter parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (typeof value === 'string' && value) {
          queryParams.append(key, value)
        } else if (typeof value === 'object' && value !== null) {
          queryParams.append(key, JSON.stringify(value))
        }
      })
      
      const response = await fetch(`/api/admin/users?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setTotalUsers(data.total)
        setLastUpdateTime(new Date())
        setLastFetchTime(now) // Update cache timestamp
        console.log('Data fetched successfully at', new Date().toLocaleTimeString())
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }, [currentPage, usersPerPage, debouncedSearchTerm, filters, lastFetchTime, users.length])

  const fetchSystemSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/system-settings')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setBoysRegistrationEnabled(data.settings.boys_registration_enabled)
          setSystemMaintenanceMode(data.settings.maintenance_mode)
        }
      }
    } catch (error) {
      console.error('Error fetching system settings:', error)
    }
  }, [])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await fetchUsers(true) // Force refresh, bypass cache
    } finally {
      setRefreshing(false)
    }
  }, [fetchUsers])

  const initializeAdminPanel = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchUsers(true), // Force initial fetch
        fetchSystemSettings()
      ])
    } catch (error) {
      console.error('Failed to initialize admin panel:', error)
    } finally {
      setLoading(false)
    }
  }, [fetchUsers, fetchSystemSettings])

  // Session check
  useEffect(() => {
    if (!session?.user?.email) {
      router.push('/admin')
      return
    }
    
    // Check if user is admin
    if (session.user.email !== 'cufy.online@gmail.com') {
      router.push('/dashboard')
      return
    }
    
    initializeAdminPanel()
  }, [session, router, initializeAdminPanel])

  // Debounce search term to prevent instant refresh - increased delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1) // Reset to first page when searching
    }, 1200) // Increased delay to 1.2 seconds to further reduce API calls

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch users only when debounced search term changes, not on every keystroke
  useEffect(() => {
    if (!loading) {
      fetchUsers(true) // Force refresh when search changes
    }
  }, [debouncedSearchTerm, currentPage, usersPerPage, filters, fetchUsers, loading])

  const fetchAdminNotes = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/notes?user_id=${userId}`)
      if (response.ok) {
        const notes = await response.json()
        setAdminNotes(notes)
      }
    } catch (error) {
      console.error('Error fetching admin notes:', error)
    }
  }

  // Enhanced user actions
  const handleUserAction = async (userId: string, action: string, data?: any) => {
    try {
      const response = await fetch('/api/admin/user-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, data })
      })
      
      if (response.ok) {
        await fetchUsers()
        return true
      }
      return false
    } catch (error) {
      console.error('Error performing user action:', error)
      return false
    }
  }

  const confirmPayment = async (userId: string, amount: number) => {
    try {
      setPaymentLoading(userId)
      console.log('Confirming payment for user:', userId, 'amount:', amount)
      
      const response = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          action: 'confirm'
        })
      })

      const result = await response.json()
      console.log('Payment confirmation result:', result)
      
      if (response.ok && result.success) {
        alert('Payment confirmed successfully!')
        await fetchUsers() // Refresh the user list
        return true
      } else {
        alert(result.error || 'Failed to confirm payment. Please try again.')
        return false
      }
    } catch (error) {
      console.error('Error confirming payment:', error)
      alert('Error confirming payment. Please try again.')
      return false
    } finally {
      setPaymentLoading(null)
    }
  }

  const suspendUser = async (userId: string, reason: string, duration?: number) => {
    return await handleUserAction(userId, 'suspend', { reason, duration })
  }

  const banUser = async (userId: string, reason: string) => {
    return await handleUserAction(userId, 'ban', { reason })
  }

  const deleteUser = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/users/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      const result = await response.json()

      if (result.success) {
        await fetchUsers()
        alert('User deleted successfully!')
        return true
      } else {
        alert(result.error || 'Failed to delete user')
        return false
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('An error occurred while deleting the user')
      return false
    }
  }

  const editUser = async (userId: string, updates: any) => {
    try {
      const adminEmail = session?.user?.email
      
      if (!adminEmail) {
        alert('Admin authentication required')
        return false
      }

      const response = await fetch('/api/admin/users/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, adminEmail, updates }),
      })

      const result = await response.json()

      if (result.user) {
        await fetchUsers()
        alert('User updated successfully!')
        return true
      } else {
        alert(result.error || 'Failed to update user')
        return false
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('An error occurred while updating the user')
      return false
    }
  }

  // Toggle boys registration setting
  const toggleBoysRegistration = async () => {
    try {
      const response = await fetch('/api/admin/system-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'toggle_boys_registration'
        }),
      })

      const result = await response.json()

      if (result.success) {
        setBoysRegistrationEnabled(result.new_value)
        alert(result.message)
      } else {
        alert(result.error || 'Failed to toggle boys registration')
      }
    } catch (error) {
      console.error('Error toggling boys registration:', error)
      alert('An error occurred while updating the setting')
    }
  }

  const verifyUser = async (userId: string) => {
    return await handleUserAction(userId, 'verify')
  }

  const resetUserPassword = async (userId: string) => {
    return await handleUserAction(userId, 'reset_password')
  }

  // Bulk actions
  const handleBulkAction = async (action: string, userIds: string[], data?: any) => {
    try {
      const response = await fetch('/api/admin/bulk-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userIds: Array.from(userIds), data })
      })
      
      if (response.ok) {
        await fetchUsers()
        setSelectedUsers(new Set())
        return true
      }
      return false
    } catch (error) {
      console.error('Error performing bulk action:', error)
      return false
    }
  }

  // Admin notes functions
  const addAdminNote = async (userId: string, note: string, type: string) => {
    setIsAddingNote(true)
    try {
      const response = await fetch('/api/admin/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, note, type })
      })
      
      if (response.ok) {
        await fetchAdminNotes(userId)
        setNewNote('')
        setNewNoteType('system')
      }
    } catch (error) {
      console.error('Error adding admin note:', error)
    } finally {
      setIsAddingNote(false)
    }
  }

  const updateAdminNote = async (noteId: string, note: string) => {
    try {
      const response = await fetch(`/api/admin/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note })
      })
      
      if (response.ok && selectedUser) {
        await fetchAdminNotes(selectedUser.id)
        setEditingNoteId(null)
        setEditingNoteText('')
      }
    } catch (error) {
      console.error('Error updating admin note:', error)
    }
  }

  const deleteAdminNote = async (noteId: string) => {
    try {
      const response = await fetch(`/api/admin/notes/${noteId}`, {
        method: 'DELETE'
      })
      
      if (response.ok && selectedUser) {
        await fetchAdminNotes(selectedUser.id)
      }
    } catch (error) {
      console.error('Error deleting admin note:', error)
    }
  }

  // Advanced filtering and search
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const searchMatch = 
          user.full_name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.university.toLowerCase().includes(searchLower) ||
          user.phone_number?.toLowerCase().includes(searchLower) ||
          user.instagram?.toLowerCase().includes(searchLower)
        
        if (!searchMatch) return false
      }
      
      // Gender filter
      if (filters.gender !== 'all' && user.gender !== filters.gender) return false
      
      // Status filter
      if (filters.status !== 'all' && user.status !== filters.status) return false
      
      // Verification filter
      if (filters.verification !== 'all' && user.verification_status !== filters.verification) return false
      
      // Subscription filter
      if (filters.subscription !== 'all') {
        if (filters.subscription === 'none' && user.subscription_type) return false
        if (filters.subscription !== 'none' && user.subscription_type !== filters.subscription) return false
      }
      
      // Payment filter
      if (filters.payment !== 'all') {
        if (filters.payment === 'confirmed' && !user.payment_confirmed) return false
        if (filters.payment === 'review' && (!user.payment_proof_url || user.payment_confirmed)) return false
        if (filters.payment === 'none' && (user.payment_confirmed || user.payment_proof_url)) return false
      }
      
      // University filter
      if (filters.university && !user.university.toLowerCase().includes(filters.university.toLowerCase())) return false
      
      // Age range filter
      if (user.age < filters.age_range.min || user.age > filters.age_range.max) return false
      
      return true
    })
  }, [users, searchTerm, filters])

  // Pagination
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * usersPerPage
    return filteredUsers.slice(startIndex, startIndex + usersPerPage)
  }, [filteredUsers, currentPage, usersPerPage])

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

  // Tab visibility detection to prevent unnecessary refreshing
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden)
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Real-time updates effect - much more conservative
  useEffect(() => {
    if (!realTimeUpdates || !isTabVisible) return
    
    const interval = setInterval(() => {
      if (!loading && !refreshing && isTabVisible) {
        setRefreshing(true)
        fetchUsers(true).finally(() => setRefreshing(false)) // Force refresh for real-time updates
      }
    }, 120000) // Update every 2 minutes instead of 30 seconds
    
    return () => clearInterval(interval)
  }, [realTimeUpdates, loading, refreshing, fetchUsers, isTabVisible])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'f':
            e.preventDefault()
            document.getElementById('search-input')?.focus()
            break
          case 'r':
            e.preventDefault()
            handleRefresh()
            break
          case 'a':
            e.preventDefault()
            if (e.shiftKey) {
              setSelectedUsers(new Set(filteredUsers.map(u => u.id)))
            }
            break
        }
      }
      
      if (e.key === 'Escape') {
        setSelectedUsers(new Set())
        setUserDetailDialogOpen(false)
        setPaymentDialogOpen(false)
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [filteredUsers, handleRefresh])

  const handleUserSelect = (userId: string, selected: boolean) => {
    const newSelected = new Set(selectedUsers)
    if (selected) {
      newSelected.add(userId)
    } else {
      newSelected.delete(userId)
    }
    setSelectedUsers(newSelected)
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedUsers(new Set(paginatedUsers.map(u => u.id)))
    } else {
      setSelectedUsers(new Set())
    }
  }

  const openUserDetail = async (user: EnhancedUser) => {
    setSelectedUser(user)
    await fetchAdminNotes(user.id)
    setUserDetailDialogOpen(true)
  }

  const openPaymentDialog = (user: EnhancedUser) => {
    setSelectedUser(user)
    setPaymentDialogOpen(true)
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
          <p className="text-white text-lg font-medium">Loading Admin Panel...</p>
          <p className="text-gray-400 text-sm mt-2">Initializing dashboard components</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-black ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-black/95 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-40 shadow-2xl"
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg border border-gray-700">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                  <p className="text-gray-400 text-sm">Professional user management system</p>
                </div>
              </div>
              
              {lastUpdateTime && (
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Activity className="h-4 w-4" />
                  <span>Last updated: {lastUpdateTime.toLocaleTimeString()}</span>
                  {refreshing && <div className="w-3 h-3 border border-purple-400 border-t-transparent rounded-full animate-spin"></div>}
                </div>
              )}
              
              {/* Cache status indicator */}
              {lastFetchTime && (
                <div className="flex items-center space-x-2 text-sm text-green-400">
                  <Database className="h-4 w-4" />
                  <span>Cache: {Math.round((Date.now() - lastFetchTime) / 1000)}s ago</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setRealTimeUpdates(!realTimeUpdates)}
                variant="outline"
                size="sm"
                className={`border-white/20 text-white hover:bg-white/10 ${realTimeUpdates ? 'bg-green-500/20 border-green-500' : 'bg-gray-500/20 border-gray-500'}`}
              >
                <Activity className="h-4 w-4 mr-2" />
                Real-time {realTimeUpdates ? 'ON' : 'OFF (Performance Mode)'}
              </Button>
              
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button
                onClick={() => setIsFullscreen(!isFullscreen)}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              
              <Button
                onClick={() => signOut({ callbackUrl: '/' })}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Exit Admin
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="px-6 py-6">
        <Tabs value={activeTab === 'dashboard' ? 'users' : activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-black/90 backdrop-blur-xl border border-gray-800 mb-6">
            <TabsTrigger value="users" className="data-[state=active]:bg-gray-800 text-white">
              <Users className="h-4 w-4 mr-2" />
              Users ({totalUsers})
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-gray-800 text-white">
              <CreditCard className="h-4 w-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-gray-800 text-white">
              <Settings className="h-4 w-4 mr-2" />
              System
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-gray-800 text-white">
              <FileText className="h-4 w-4 mr-2" />
              Logs
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          {/* Users Tab */}
          <TabsContent value="users">
            <UsersManagement 
              users={paginatedUsers}
              filteredUsers={filteredUsers}
              totalUsers={totalUsers}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filters={filters}
              setFilters={setFilters}
              selectedUsers={selectedUsers}
              setSelectedUsers={setSelectedUsers}
              viewMode={viewMode}
              setViewMode={setViewMode}
              showAdvancedFilters={showAdvancedFilters}
              setShowAdvancedFilters={setShowAdvancedFilters}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              usersPerPage={usersPerPage}
              setUsersPerPage={setUsersPerPage}
              totalPages={totalPages}
              onUserSelect={handleUserSelect}
              onSelectAll={handleSelectAll}
              onUserDetail={openUserDetail}
              onPaymentDetail={openPaymentDialog}
              onBulkAction={handleBulkAction}
              onDeleteUser={deleteUser}
            />
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <PaymentsManagement users={users} onConfirmPayment={confirmPayment} paymentLoading={paymentLoading} setSelectedPaymentProof={setSelectedPaymentProof} />
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system">
            <SystemManagement 
              boysRegistrationEnabled={boysRegistrationEnabled}
              setBoysRegistrationEnabled={setBoysRegistrationEnabled}
              systemMaintenanceMode={systemMaintenanceMode}
              setSystemMaintenanceMode={setSystemMaintenanceMode}
            />
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs">
            <LogsManagement />
          </TabsContent>
        </Tabs>
      </div>

      {/* Enhanced User Detail Dialog */}
      <UserDetailDialog 
        user={selectedUser}
        open={userDetailDialogOpen}
        onOpenChange={setUserDetailDialogOpen}
        adminNotes={adminNotes}
        newNote={newNote}
        setNewNote={setNewNote}
        newNoteType={newNoteType}
        setNewNoteType={setNewNoteType}
        isAddingNote={isAddingNote}
        editingNoteId={editingNoteId}
        editingNoteText={editingNoteText}
        setEditingNoteId={setEditingNoteId}
        setEditingNoteText={setEditingNoteText}
        onAddNote={addAdminNote}
        onUpdateNote={updateAdminNote}
        onDeleteNote={deleteAdminNote}
        onConfirmPayment={confirmPayment}
        onSuspendUser={suspendUser}
        onBanUser={banUser}
        onDeleteUser={deleteUser}
        onEditUser={editUser}
        onVerifyUser={verifyUser}
        onResetPassword={resetUserPassword}
        setSelectedFullPhoto={setSelectedFullPhoto}
      />

      {/* Enhanced Payment Dialog */}
      <PaymentDetailDialog 
        user={selectedUser}
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        onConfirmPayment={confirmPayment}
      />

      {/* Bulk Action Dialog */}
      <BulkActionDialog 
        open={bulkActionDialogOpen}
        onOpenChange={setBulkActionDialogOpen}
        selectedUsers={selectedUsers}
        onBulkAction={handleBulkAction}
      />

      {/* Payment Proof Modal */}
      <Dialog open={!!selectedPaymentProof} onOpenChange={() => setSelectedPaymentProof(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-gray-900/95 backdrop-blur-xl border border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center space-x-2">
              <Eye className="h-5 w-5 text-blue-400" />
              <span>Payment Proof - {selectedPaymentProof?.user}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center justify-center p-4 bg-black/50 rounded-lg">
            {selectedPaymentProof?.url && (
              <Image
                src={selectedPaymentProof.url}
                alt="Payment Proof"
                width={800}
                height={600}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                style={{ width: 'auto', height: 'auto' }}
              />
            )}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              onClick={() => window.open(selectedPaymentProof?.url, '_blank')}
              variant="outline"
              className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
            <Button
              onClick={() => setSelectedPaymentProof(null)}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Full Photo Modal */}
      <FullPhotoModal 
        photo={selectedFullPhoto} 
        open={!!selectedFullPhoto} 
        onOpenChange={() => setSelectedFullPhoto(null)} 
      />
    </div>
  )
}

// Dashboard Content Component
// Users Management Component
function UsersManagement({ 
  users, 
  filteredUsers,
  totalUsers,
  searchTerm, 
  setSearchTerm, 
  filters, 
  setFilters, 
  selectedUsers, 
  setSelectedUsers,
  viewMode, 
  setViewMode, 
  showAdvancedFilters, 
  setShowAdvancedFilters,
  currentPage, 
  setCurrentPage, 
  usersPerPage, 
  setUsersPerPage, 
  totalPages,
  onUserSelect, 
  onSelectAll, 
  onUserDetail, 
  onPaymentDetail, 
  onBulkAction,
  onDeleteUser
}: any) {
  return (
    <div className="space-y-6">
      {/* Pagination - Moved to Top */}
      <div className="flex items-center justify-between bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg p-4">
        <div className="text-white text-sm">
          Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-white px-3 py-1">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Search and Filters Header */}
      <Card className="bg-black/40 backdrop-blur-xl border-white/10">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search-input"
                  placeholder="Search users by name, email, university..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400"
                />
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
                {showAdvancedFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
              </Button>
              
              <div className="flex items-center space-x-2 border border-white/20 rounded-lg p-1">
                <Button
                  onClick={() => setViewMode('table')}
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => setViewMode('grid')}
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
              
              {selectedUsers.size > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                >
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                  Bulk Actions ({selectedUsers.size})
                </Button>
              )}
            </div>
          </div>
          
          {/* Advanced Filters */}
          <AnimatePresence>
            {showAdvancedFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-6 pt-6 border-t border-white/10"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Gender</label>
                    <Select value={filters.gender} onValueChange={(value) => setFilters({...filters, gender: value})}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Genders</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Status</label>
                    <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="banned">Banned</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Verification</label>
                    <Select value={filters.verification} onValueChange={(value) => setFilters({...filters, verification: value})}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Verification</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Subscription</label>
                    <Select value={filters.subscription} onValueChange={(value) => setFilters({...filters, subscription: value})}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subscriptions</SelectItem>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="none">No Subscription</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Payment Status</label>
                    <Select value={filters.payment} onValueChange={(value) => setFilters({...filters, payment: value})}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Payments</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="review">Under Review</SelectItem>
                        <SelectItem value="none">No Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
      
      {/* Users Table/Grid */}
      <Card className="bg-black/40 backdrop-blur-xl border-white/10">
        <CardContent className="p-0">
          {viewMode === 'table' ? (
            <UsersTable 
              users={users}
              selectedUsers={selectedUsers}
              onUserSelect={onUserSelect}
              onSelectAll={onSelectAll}
              onUserDetail={onUserDetail}
              onPaymentDetail={onPaymentDetail}
              onDeleteUser={onDeleteUser}
            />
          ) : (
            <UsersGrid 
              users={users}
              selectedUsers={selectedUsers}
              onUserSelect={onUserSelect}
              onUserDetail={onUserDetail}
              onPaymentDetail={onPaymentDetail}
              onDeleteUser={onDeleteUser}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Users Table Component
function UsersTable({ users, selectedUsers, onUserSelect, onSelectAll, onUserDetail, onPaymentDetail, onDeleteUser }: any) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-white/5 border-b border-white/10">
          <tr>
            <th className="text-left p-4">
              <input
                type="checkbox"
                checked={users.length > 0 && users.every((u: any) => selectedUsers.has(u.id))}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="rounded border-white/20 bg-white/5 text-gray-400"
              />
            </th>
            <th className="text-left p-4 text-white font-medium">User</th>
            <th className="text-left p-4 text-white font-medium">Status</th>
            <th className="text-left p-4 text-white font-medium">Subscription</th>
            <th className="text-left p-4 text-white font-medium">Payment</th>
            <th className="text-left p-4 text-white font-medium">Joined</th>
            <th className="text-left p-4 text-white font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: EnhancedUser) => (
            <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
              <td className="p-4">
                <input
                  type="checkbox"
                  checked={selectedUsers.has(user.id)}
                  onChange={(e) => onUserSelect(user.id, e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-gray-400"
                />
              </td>
              <td className="p-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.profile_photo} />
                    <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-medium">{user.full_name}</p>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                    <p className="text-gray-400 text-sm">{user.university}</p>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <div className="space-y-1">
                  <Badge 
                    variant="secondary" 
                    className={`${
                      user.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                      user.status === 'suspended' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                      user.status === 'banned' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                      'bg-gray-500/20 text-gray-400 border-gray-500/50'
                    }`}
                  >
                    {user.status}
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className={`${
                      user.verification_status === 'verified' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
                      user.verification_status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                      'bg-red-500/20 text-red-400 border-red-500/50'
                    }`}
                  >
                    {user.verification_status}
                  </Badge>
                </div>
              </td>
              <td className="p-4">
                {user.subscription_type ? (
                  <Badge 
                    variant="secondary" 
                    className="bg-purple-500/20 text-purple-400 border-purple-500/50"
                  >
                    <Crown className="h-3 w-3 mr-1" />
                    {user.subscription_type}
                  </Badge>
                ) : (
                  <span className="text-gray-400">No subscription</span>
                )}
              </td>
              <td className="p-4">
                {user.payment_confirmed ? (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Confirmed
                  </Badge>
                ) : user.payment_proof_url ? (
                  <Button
                    onClick={() => onPaymentDetail(user)}
                    variant="outline"
                    size="sm"
                    className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    Review
                  </Button>
                ) : (
                  <span className="text-gray-400">No payment</span>
                )}
              </td>
              <td className="p-4">
                <p className="text-white text-sm">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
                <p className="text-gray-400 text-xs">
                  {new Date(user.created_at).toLocaleTimeString()}
                </p>
              </td>
              <td className="p-4">
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => onUserDetail(user)}
                    variant="outline"
                    size="sm"
                    className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View Profile
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gray-900 border-gray-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Delete User</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                          Are you sure you want to permanently delete {user.full_name}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onDeleteUser(user.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete User
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Users Grid Component
function UsersGrid({ users, selectedUsers, onUserSelect, onUserDetail, onPaymentDetail, onDeleteUser }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {users.map((user: EnhancedUser) => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-3">
            <input
              type="checkbox"
              checked={selectedUsers.has(user.id)}
              onChange={(e) => onUserSelect(user.id, e.target.checked)}
              className="rounded border-white/20 bg-white/5 text-gray-400"
            />
            <div className="flex space-x-1">
              <Button
                onClick={() => onUserDetail(user)}
                variant="outline"
                size="sm"
                className="border-blue-500 text-blue-400 hover:bg-blue-500/10 h-7 px-2"
              >
                <Eye className="h-3 w-3" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500 text-red-400 hover:bg-red-500/10 h-7 px-2"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-900 border-gray-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Delete User</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400">
                      Are you sure you want to permanently delete {user.full_name}? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onDeleteUser(user.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete User
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          
          <div className="text-center mb-4">
            <Avatar className="h-16 w-16 mx-auto mb-3">
              <AvatarImage src={user.profile_photo} />
              <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <h3 className="text-white font-medium">{user.full_name}</h3>
            <p className="text-gray-400 text-sm">{user.age} years</p>
            <p className="text-gray-400 text-xs">{user.university}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Status:</span>
              <Badge 
                variant="secondary" 
                className={`${
                  user.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                  user.status === 'suspended' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                  user.status === 'banned' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                  'bg-gray-500/20 text-gray-400 border-gray-500/50'
                }`}
              >
                {user.status}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Payment:</span>
              {user.payment_confirmed ? (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-xs">
                  <CheckCircle className="h-2 w-2 mr-1" />
                  Confirmed
                </Badge>
              ) : user.payment_proof_url ? (
                <Button
                  onClick={() => onPaymentDetail(user)}
                  variant="outline"
                  size="sm"
                  className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 text-xs h-6"
                >
                  Review
                </Button>
              ) : (
                <span className="text-gray-400 text-xs">None</span>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Payments Management Component
function PaymentsManagement({ users, onConfirmPayment, paymentLoading, setSelectedPaymentProof }: any) {
  const pendingPayments = users.filter((u: EnhancedUser) => u.payment_proof_url && !u.payment_confirmed)
  const confirmedPayments = users.filter((u: EnhancedUser) => u.payment_confirmed)
  
  // Calculate user type statistics - only count users with CONFIRMED payments
  const basicUsers = users.filter((u: EnhancedUser) => u.subscription_type === 'basic' && u.payment_confirmed)
  const premiumUsers = users.filter((u: EnhancedUser) => u.subscription_type === 'premium' && u.payment_confirmed)
  
  // Debug logging for premium users
  console.log('Total users count:', users.length)
  console.log('Premium users with confirmed payment:', premiumUsers.length)
  console.log('Basic users with confirmed payment:', basicUsers.length)
  console.log('Sample users:', users.slice(0, 5).map((u: EnhancedUser) => ({ 
    email: u.email, 
    subscription_type: u.subscription_type, 
    payment_confirmed: u.payment_confirmed 
  })))
  
  // Calculate total revenue live from confirmed payments
  const totalRevenue = confirmedPayments.reduce((sum: number, u: EnhancedUser) => {
    if (u.subscription_type === 'basic') return sum + 99
    if (u.subscription_type === 'premium') return sum + 249
    return sum
  }, 0)
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="bg-black/40 backdrop-blur-xl border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Pending Reviews</p>
                <p className="text-2xl font-bold text-yellow-400 mt-1">{pendingPayments.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/40 backdrop-blur-xl border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Confirmed Payments</p>
                <p className="text-2xl font-bold text-green-400 mt-1">{confirmedPayments.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/40 backdrop-blur-xl border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Paid Basic Users</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">{basicUsers.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/40 backdrop-blur-xl border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Paid Premium Users</p>
                <p className="text-2xl font-bold text-purple-400 mt-1">{premiumUsers.length}</p>
              </div>
              <Crown className="h-8 w-8 text-purple-400/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/40 backdrop-blur-xl border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                  ₹{totalRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-400/60" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Pending Payments with Inline Payment Proofs */}
      <Card className="bg-black/40 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Pending Payment Reviews ({pendingPayments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {pendingPayments.map((user: EnhancedUser) => (
              <div key={user.id} className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* User Info and Actions */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={user.profile_photo} />
                        <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-white font-medium text-lg">{user.full_name}</h3>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                        <p className="text-gray-400 text-sm">{user.university}</p>
                        <div className="mt-2">
                          <Badge className="bg-purple-500/20 text-purple-400">
                            {user.subscription_type} plan - ₹{user.subscription_type === 'basic' ? '99' : '249'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Button
                        onClick={() => onConfirmPayment(user.id, user.subscription_type === 'basic' ? 99 : 249)}
                        disabled={paymentLoading === user.id}
                        className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {paymentLoading === user.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        {paymentLoading === user.id ? 'Processing...' : 'Confirm Payment'}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Payment Proof */}
                  <div>
                    <h4 className="text-white font-medium mb-3">Payment Proof</h4>
                    {user.payment_proof_url ? (
                      <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                        <Button
                          onClick={() => setSelectedPaymentProof({ 
                            url: user.payment_proof_url ? getPaymentProofUrl(user.payment_proof_url) : null,
                            user: user.full_name 
                          })}
                          variant="outline"
                          className="border-blue-500 text-blue-400 hover:bg-blue-500/10 w-full"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Payment Proof
                        </Button>
                        <p className="text-gray-400 text-xs mt-2">Click to view full proof image</p>
                      </div>
                    ) : (
                      <div className="bg-gray-500/20 border border-gray-500/30 rounded-lg p-6 text-center">
                        <p className="text-gray-400">No payment proof uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {pendingPayments.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
                <p className="text-white font-medium">No pending payment reviews</p>
                <p className="text-gray-400 text-sm">All payments have been processed</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// System Management Component
function SystemManagement({ 
  boysRegistrationEnabled, 
  setBoysRegistrationEnabled, 
  systemMaintenanceMode, 
  setSystemMaintenanceMode 
}: any) {
  return (
    <div className="space-y-6">
      <Card className="bg-black/40 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="text-white">System Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Boys Registration</h3>
              <p className="text-gray-400 text-sm">Control whether new male users can register</p>
            </div>
            <Button
              onClick={async () => {
                try {
                  const response = await fetch('/api/admin/system-settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      action: 'toggle_boys_registration'
                    }),
                  })

                  const result = await response.json()

                  if (result.success) {
                    setBoysRegistrationEnabled(result.new_value)
                    alert(result.message)
                  } else {
                    alert(result.error || 'Failed to toggle boys registration')
                  }
                } catch (error) {
                  console.error('Error toggling boys registration:', error)
                  alert('An error occurred while updating the setting')
                }
              }}
              variant="outline"
              className={`${boysRegistrationEnabled ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}`}
            >
              {boysRegistrationEnabled ? <ToggleRight className="h-4 w-4 mr-2" /> : <ToggleLeft className="h-4 w-4 mr-2" />}
              {boysRegistrationEnabled ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Maintenance Mode</h3>
              <p className="text-gray-400 text-sm">Enable maintenance mode for system updates</p>
            </div>
            <Button
              onClick={() => setSystemMaintenanceMode(!systemMaintenanceMode)}
              variant="outline"
              className={`${systemMaintenanceMode ? 'border-yellow-500 text-yellow-400' : 'border-green-500 text-green-400'}`}
            >
              {systemMaintenanceMode ? <AlertTriangle className="h-4 w-4 mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              {systemMaintenanceMode ? 'Maintenance' : 'Operational'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Logs Management Component
function LogsManagement() {
  return (
    <div className="space-y-6">
      <Card className="bg-black/40 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="text-white">System Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-white">User registration successful</span>
                <span className="text-gray-400 text-sm ml-auto">2 minutes ago</span>
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-white">Payment confirmed for user</span>
                <span className="text-gray-400 text-sm ml-auto">5 minutes ago</span>
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-white">Admin login detected</span>
                <span className="text-gray-400 text-sm ml-auto">10 minutes ago</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// User Detail Dialog Component
function UserDetailDialog({ 
  user, 
  open, 
  onOpenChange, 
  adminNotes,
  newNote, 
  setNewNote, 
  newNoteType, 
  setNewNoteType,
  isAddingNote, 
  editingNoteId, 
  editingNoteText, 
  setEditingNoteId, 
  setEditingNoteText,
  onAddNote, 
  onUpdateNote, 
  onDeleteNote,
  onConfirmPayment, 
  onSuspendUser, 
  onBanUser, 
  onDeleteUser,
  onEditUser,
  onVerifyUser, 
  onResetPassword,
  setSelectedFullPhoto
}: any) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [editData, setEditData] = useState<any>({})
  const [isUpdating, setIsUpdating] = useState(false)

  // Initialize edit data when user changes
  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        college: user.college || '',
        year: user.year || '',
        course: user.course || '',
        branch: user.branch || '',
        age: user.age || '',
        height: user.height || '',
        location: user.location || '',
        interests: user.interests || '',
        relationship_status: user.relationship_status || '',
        instagram: user.instagram || '',
        subscription_type: user.subscription_type || 'basic',
        is_payment_verified: user.is_payment_verified || false,
        points: user.points || 0,
        is_active: user.is_active !== false
      })
    }
  }, [user])

  const handleEditSave = async () => {
    setIsUpdating(true)
    try {
      const success = await onEditUser(user.id, editData)
      if (success) {
        setIsEditMode(false)
      }
    } catch (error) {
      console.error('Error updating user:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleEditCancel = () => {
    setIsEditMode(false)
    // Reset edit data to original values
    setEditData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      college: user.college || '',
      year: user.year || '',
      course: user.course || '',
      branch: user.branch || '',
      age: user.age || '',
      height: user.height || '',
      location: user.location || '',
      interests: user.interests || '',
      relationship_status: user.relationship_status || '',
      instagram: user.instagram || '',
      subscription_type: user.subscription_type || 'basic',
      is_payment_verified: user.is_payment_verified || false,
      points: user.points || 0,
      is_active: user.is_active !== false
    })
  }
  if (!user) return null
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] bg-black/95 backdrop-blur-xl border border-gray-800">
        <DialogHeader className="border-b border-gray-800 pb-4">
          <DialogTitle className="text-2xl font-bold text-white flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <span>User Profile: {user.full_name}</span>
              <p className="text-sm text-gray-400 font-normal">Complete user management and information</p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-6 max-h-[75vh] overflow-y-auto">
          {/* Profile Picture & Basic Info */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900/80 border-gray-800 shadow-2xl">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <Avatar className="h-48 w-48 mx-auto cursor-pointer ring-4 ring-blue-500/20 hover:ring-blue-500/40 transition-all duration-300" onClick={() => user.profile_photo && setSelectedFullPhoto({ url: user.profile_photo, name: user.full_name })}>
                    <AvatarImage src={user.profile_photo} className="object-cover" />
                    <AvatarFallback className="text-6xl bg-gradient-to-br from-gray-700 to-gray-800 text-white">
                      {user.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {user.profile_photo && (
                    <p className="text-gray-400 text-xs mt-3">Click to view full size</p>
                  )}
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold text-white">{user.full_name}</h2>
                  <p className="text-gray-400 text-lg">{user.age} years old • {user.gender}</p>
                  <p className="text-blue-400 font-medium">{user.university}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* User Information & Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Information */}
            <Card className="bg-gray-900/80 border-gray-800 shadow-xl">
              <CardHeader className="border-b border-gray-800">
                <CardTitle className="text-white text-xl flex items-center">
                  <Mail className="h-5 w-5 mr-3 text-blue-400" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="grid grid-cols-1 gap-5">
                  <div className="space-y-2">
                    <label className="text-gray-400 text-sm font-medium">Email Address</label>
                    {isEditMode ? (
                      <Input
                        value={editData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        className="bg-gray-800/50 border-gray-700 text-white"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-blue-400" />
                        <p className="text-white font-medium">{user.email}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-gray-400 text-sm font-medium">Full Name</label>
                    {isEditMode ? (
                      <Input
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="bg-gray-800/50 border-gray-700 text-white"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-blue-400" />
                        <p className="text-white font-medium">{user.name || user.full_name}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-gray-400 text-sm font-medium">College</label>
                    {isEditMode ? (
                      <Input
                        value={editData.college}
                        onChange={(e) => setEditData({ ...editData, college: e.target.value })}
                        className="bg-gray-800/50 border-gray-700 text-white"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="h-4 w-4 text-purple-400" />
                        <p className="text-white font-medium">{user.college || user.university}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-gray-400 text-sm font-medium">Year of Study</label>
                    {isEditMode ? (
                      <Input
                        value={editData.year}
                        onChange={(e) => setEditData({ ...editData, year: e.target.value })}
                        className="bg-gray-800/50 border-gray-700 text-white"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-green-400" />
                        <p className="text-white font-medium">{user.year || user.year_of_study || 'Not specified'}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-gray-400 text-sm font-medium">Phone Number</label>
                    {isEditMode ? (
                      <Input
                        value={editData.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        className="bg-gray-800/50 border-gray-700 text-white"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-orange-400" />
                        <p className="text-white font-medium">{user.phone || user.phone_number || 'Not provided'}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-gray-400 text-sm font-medium">Instagram</label>
                    {isEditMode ? (
                      <Input
                        value={editData.instagram}
                        onChange={(e) => setEditData({ ...editData, instagram: e.target.value })}
                        className="bg-gray-800/50 border-gray-700 text-white"
                        placeholder="@username"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Instagram className="h-4 w-4 text-pink-400" />
                        <p className="text-white font-medium">{user.instagram ? `@${user.instagram}` : 'Not provided'}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-gray-400 text-sm font-medium">Age</label>
                    {isEditMode ? (
                      <Input
                        type="number"
                        value={editData.age}
                        onChange={(e) => setEditData({ ...editData, age: e.target.value })}
                        className="bg-gray-800/50 border-gray-700 text-white"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-yellow-400" />
                        <p className="text-white font-medium">{user.age || 'Not specified'}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-gray-400 text-sm font-medium">Height</label>
                    {isEditMode ? (
                      <Input
                        value={editData.height}
                        onChange={(e) => setEditData({ ...editData, height: e.target.value })}
                        className="bg-gray-800/50 border-gray-700 text-white"
                        placeholder="e.g., 5'8"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Ruler className="h-4 w-4 text-green-400" />
                        <p className="text-white font-medium">{user.height || 'Not specified'}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 pt-4 border-t border-gray-800">
                  <label className="text-gray-400 text-sm font-medium">Bio</label>
                  {isEditMode ? (
                    <Textarea
                      value={editData.interests}
                      onChange={(e) => setEditData({ ...editData, interests: e.target.value })}
                      className="bg-gray-800/50 border-gray-700 text-white min-h-[100px]"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <p className="text-white">{user.bio || user.interests || 'No bio provided'}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Subscription & Payment Info */}
            <Card className="bg-gray-900/80 border-gray-800 shadow-xl">
              <CardHeader className="border-b border-gray-800">
                <CardTitle className="text-white text-xl flex items-center">
                  <CreditCard className="h-5 w-5 mr-3 text-green-400" />
                  Subscription & Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {user.subscription_type ? (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Crown className="h-6 w-6 text-purple-400" />
                        <div>
                          <p className="text-white font-semibold">{user.subscription_type?.toUpperCase() || 'FREE'} Plan</p>
                          <p className="text-gray-400 text-sm">Premium subscription active</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-purple-400 font-bold text-xl">
                          ₹{user.subscription_type === 'basic' ? '99' : '249'}
                        </p>
                        <p className="text-gray-400 text-xs">one-time</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 font-medium">Payment Status</span>
                        {user.payment_confirmed ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/50 px-4 py-2">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            CONFIRMED
                          </Badge>
                        ) : user.payment_proof_url ? (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 px-4 py-2">
                            <Clock className="h-4 w-4 mr-2" />
                            PENDING REVIEW
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50 px-4 py-2">
                            <X className="h-4 w-4 mr-2" />
                            NO PAYMENT
                          </Badge>
                        )}
                      </div>
                      
                      {user.payment_proof_url && (
                        <div className="space-y-3">
                          <label className="text-gray-400 text-sm font-medium">Payment Proof</label>
                          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-white">Payment screenshot uploaded</span>
                              <Button
                                onClick={() => {
                                  const proofUrl = user.payment_proof_url ? getPaymentProofUrl(user.payment_proof_url) : null
                                  if (proofUrl) window.open(proofUrl, '_blank')
                                }}
                                variant="outline"
                                size="sm"
                                className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Proof
                              </Button>
                            </div>
                          </div>
                          
                          {!user.payment_confirmed && (
                            <Button
                              onClick={() => onConfirmPayment(user.id, user.subscription_type === 'basic' ? 99 : 249)}
                              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                            >
                              <CheckCircle className="h-5 w-5 mr-2" />
                              Confirm Payment (₹{user.subscription_type === 'basic' ? '99' : '249'})
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <X className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-400 text-lg">No subscription</p>
                    <p className="text-gray-500 text-sm">User has not subscribed to any plan</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Admin Actions & Notes */}
          <div className="lg:col-span-1 space-y-6">
            {/* Admin Actions */}
            <Card className="bg-gray-900/80 border-gray-800 shadow-xl">
              <CardHeader className="border-b border-gray-800">
                <CardTitle className="text-white text-xl flex items-center">
                  <Settings className="h-5 w-5 mr-3 text-red-400" />
                  Admin Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    onClick={() => setIsEditMode(!isEditMode)}
                    variant="outline"
                    className="border-blue-500 text-blue-400 hover:bg-blue-500/10 justify-start"
                  >
                    <Edit className="h-4 w-4 mr-3" />
                    {isEditMode ? 'Cancel Edit' : 'Edit Profile'}
                  </Button>

                  {isEditMode && (
                    <Button
                      onClick={handleEditSave}
                      disabled={isUpdating}
                      className="bg-green-600 hover:bg-green-700 text-white justify-start"
                    >
                      <Save className="h-4 w-4 mr-3" />
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </Button>
                  )}
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="border-red-500 text-red-400 hover:bg-red-500/10 justify-start"
                      >
                        <Trash2 className="h-4 w-4 mr-3" />
                        Delete User
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gray-900 border-gray-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Delete User</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                          Are you sure you want to permanently delete {user.full_name}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-gray-600 text-gray-400 hover:bg-gray-700">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onDeleteUser(user.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete User
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
            
            {/* Admin Notes */}
            <Card className="bg-gray-900/80 border-gray-800 shadow-xl">
              <CardHeader className="border-b border-gray-800">
                <CardTitle className="text-white text-xl flex items-center">
                  <StickyNote className="h-5 w-5 mr-3 text-yellow-400" />
                  Admin Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Add Note Form */}
                <div className="space-y-4">
                  <Select value={newNoteType} onValueChange={setNewNoteType}>
                    <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="note">Note</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Textarea
                    placeholder="Add a note about this user..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 min-h-[80px]"
                  />
                  
                  <Button
                    onClick={() => onAddNote(user.id, newNote, newNoteType)}
                    disabled={!newNote.trim() || isAddingNote}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isAddingNote ? 'Adding...' : 'Add Note'}
                  </Button>
                </div>
                
                {/* Notes List */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {adminNotes.length > 0 ? (
                    adminNotes.map((note: AdminNote) => (
                      <div key={note.id} className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className={`${
                            note.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                            note.type === 'system' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
                            'bg-gray-500/20 text-gray-400 border-gray-500/50'
                          }`}>
                            {note.type?.toUpperCase() || 'NOTE'}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(note.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{note.note}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-2 border-t border-gray-700">
                          <span>By: {note.admin_email}</span>
                          <span>{new Date(note.created_at).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <StickyNote className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">No admin notes</p>
                      <p className="text-gray-500 text-sm">Add the first note above</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Full Photo Modal Component
function FullPhotoModal({ photo, open, onOpenChange }: { photo: { url: string, name: string } | null, open: boolean, onOpenChange: (open: boolean) => void }) {
  if (!photo) return null
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-black/95 backdrop-blur-xl border border-gray-800 p-0">
        <DialogHeader className="px-6 py-4 border-b border-gray-800">
          <DialogTitle className="text-xl font-bold text-white flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-400" />
            <span>{photo.name} - Profile Photo</span>
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 flex items-center justify-center">
          <div className="relative max-w-full max-h-[70vh] overflow-hidden rounded-lg">
            <Image
              src={photo.url}
              alt={`${photo.name} Profile Photo`}
              width={800}
              height={800}
              className="object-contain max-w-full max-h-full"
              unoptimized
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Payment Detail Dialog Component
function PaymentDetailDialog({ user, open, onOpenChange, onConfirmPayment }: any) {
  const [isProcessing, setIsProcessing] = useState(false)
  
  if (!user?.payment_proof_url) return null
  
  const handleConfirm = async () => {
    setIsProcessing(true)
    try {
      await onConfirmPayment(user.id, user.subscription_type === 'basic' ? 99 : 249)
      onOpenChange(false) // Close dialog on success
    } catch (error) {
      console.error('Error confirming payment:', error)
    } finally {
      setIsProcessing(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-gray-900/95 backdrop-blur-xl border border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-green-400" />
            <span>Payment Verification: {user.full_name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-white font-medium mb-4">Payment Details</h3>
              <div className="space-y-3 bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">User:</span>
                  <span className="text-white">{user.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Plan:</span>
                  <span className="text-white">{user.subscription_type} Plan</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-white">₹{user.subscription_type === 'basic' ? '99' : '249'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Submitted:</span>
                  <span className="text-white">{user.payment_date ? new Date(user.payment_date).toLocaleString() : 'Unknown'}</span>
                </div>
              </div>
              
              <div className="mt-6 flex items-center space-x-3">
                <Button
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Confirming...' : 'Confirm Payment'}
                </Button>
                
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-4">Payment Proof</h3>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <Image 
                  src={(user.payment_proof_url ? getPaymentProofUrl(user.payment_proof_url) : null) || ''}
                  alt="Payment Proof"
                  width={500}
                  height={400}
                  className="w-full h-auto max-h-96 object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Bulk Action Dialog Component
function BulkActionDialog({ open, onOpenChange, selectedUsers, onBulkAction }: any) {
  const [selectedAction, setSelectedAction] = useState('')
  const [reason, setReason] = useState('')
  
  const bulkActions = [
    { value: 'verify', label: 'Verify Users', icon: CheckCircle, color: 'text-blue-400' },
    { value: 'suspend', label: 'Suspend Users', icon: Ban, color: 'text-yellow-400' },
    { value: 'ban', label: 'Ban Users', icon: UserX, color: 'text-red-400' },
    { value: 'delete', label: 'Delete Users', icon: Trash2, color: 'text-red-500' },
    { value: 'export', label: 'Export Data', icon: Download, color: 'text-green-400' },
  ]
  
  const handleBulkAction = () => {
    if (!selectedAction) return
    
    onBulkAction(selectedAction, selectedUsers, { reason })
    onOpenChange(false)
    setSelectedAction('')
    setReason('')
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-gray-900/95 backdrop-blur-xl border border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Bulk Actions ({selectedUsers.size} users)
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Select Action</label>
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <SelectValue placeholder="Choose an action" />
              </SelectTrigger>
              <SelectContent>
                {bulkActions.map((action) => (
                  <SelectItem key={action.value} value={action.value}>
                    <div className="flex items-center space-x-2">
                      <action.icon className={`h-4 w-4 ${action.color}`} />
                      <span>{action.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {(selectedAction === 'suspend' || selectedAction === 'ban' || selectedAction === 'delete') && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">Reason</label>
              <Textarea
                placeholder="Enter reason for this action..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder-gray-400"
              />
            </div>
          )}
          
          <div className="flex items-center space-x-3 pt-4">
            <Button
              onClick={handleBulkAction}
              disabled={!selectedAction || (selectedAction !== 'verify' && selectedAction !== 'export' && !reason.trim())}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white"
            >
              Execute Action
            </Button>
            
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

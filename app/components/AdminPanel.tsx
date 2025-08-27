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
  DollarSign
} from 'lucide-react'
import FloatingShapes from './FloatingShapes'

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
}

interface Payment {
  id: string
  user: User
  amount: number
  payment_method: string
  status: 'pending' | 'confirmed' | 'rejected'
  subscription_type: string
  payment_proof_url: string
  created_at: string
  confirmed_by?: User
}

interface UserRound {
  id: string
  user_id: string
  selected_user_id: string
  selected_user: User
  round_number: number
  created_at: string
}

interface ProfileAssignment {
  id: string
  male_user: User
  female_user: User
  created_at: string
  status: string
  male_revealed: boolean
  female_revealed: boolean
}

interface TemporaryMatch {
  id: string
  male_user: User
  female_user: User
  created_at: string
  expires_at: string
  male_disengaged: boolean
  female_disengaged: boolean
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

      if (response.ok) {
        await fetchData() // Refresh data
      }
    } catch (error) {
      console.error('Error confirming payment:', error)
    }
  }

  const openAssignDialog = async (maleUser: User) => {
    setSelectedMaleUser(maleUser)
    
    try {
      const response = await fetch('/api/admin/available-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maleUserId: maleUser.id }),
      })
      
      const { profiles } = await response.json()
      setAvailableProfiles(profiles || [])
      setAssignDialogOpen(true)
    } catch (error) {
      console.error('Error fetching available profiles:', error)
    }
  }

  const assignProfile = async (femaleUserId: string) => {
    if (!selectedMaleUser) return

    try {
      const response = await fetch('/api/admin/assign-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maleUserId: selectedMaleUser.id,
          femaleUserId: femaleUserId,
        }),
      })

      if (response.ok) {
        await fetchData()
        setAssignDialogOpen(false)
        setSelectedMaleUser(null)
      }
    } catch (error) {
      console.error('Error assigning profile:', error)
    }
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

  const getSelectedMatch = (userId: string) => {
    const revealed = assignments.find(a => a.male_user.id === userId && (a.male_revealed || a.female_revealed))
    return revealed?.female_user.full_name || 'None Selected'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-white text-xl">Loading admin panel...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark relative">
      <FloatingShapes />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="gradient-primary p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Settings className="h-8 w-8 text-white" />
                <div>
                  <h1 className="text-2xl font-bold text-white font-poppins">
                    Admin Panel
                  </h1>
                  <p className="text-white/70">
                    Manage users, assignments, and matches
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  <Users className="h-3 w-3 mr-1" />
                  {users.length} Total Users
                </Badge>
                <Badge variant="outline" className="border-white/30 text-white">
                  <Heart className="h-3 w-3 mr-1" />
                  {permanentMatches.length} Permanent Matches
                </Badge>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Main Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-5 glass backdrop-blur-md mb-8">
            <TabsTrigger value="users" className="data-[state=active]:bg-primary">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="temporary" className="data-[state=active]:bg-primary">
              <Clock className="h-4 w-4 mr-2" />
              Temporary Zone
            </TabsTrigger>
            <TabsTrigger value="permanent" className="data-[state=active]:bg-primary">
              <Heart className="h-4 w-4 mr-2" />
              Permanent Zone
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-primary">
              <DollarSign className="h-4 w-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary">
              <Calendar className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Search and Filter */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
                      <Input
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={genderFilter === 'all' ? 'default' : 'outline'}
                        onClick={() => setGenderFilter('all')}
                        size="sm"
                      >
                        All
                      </Button>
                      <Button
                        variant={genderFilter === 'male' ? 'default' : 'outline'}
                        onClick={() => setGenderFilter('male')}
                        size="sm"
                      >
                        Male
                      </Button>
                      <Button
                        variant={genderFilter === 'female' ? 'default' : 'outline'}
                        onClick={() => setGenderFilter('female')}
                        size="sm"
                      >
                        Female
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Users List */}
              <div className="grid gap-4">
                {filteredUsers.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.profile_photo} />
                              <AvatarFallback>{user.full_name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-base font-semibold text-white">
                                {user.full_name || 'Unknown'}
                              </h3>
                              <p className="text-sm text-white/60">
                                {user.age} • {user.university}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="outline" className="text-xs px-2 py-0">
                                  {user.gender}
                                </Badge>
                                <span className="text-xs text-white/50">
                                  {new Date(user.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            {user.gender === 'male' && (
                              <>
                                <div className="text-right text-xs">
                                  <div className="text-white/70">
                                    Matches: {getCurrentAssignments(user.id)}/3
                                  </div>
                                  <div className="text-white/50">
                                    Selected: {getSelectedMatch(user.id)}
                                  </div>
                                </div>
                                
                                <Button
                                  onClick={() => openAssignDialog(user)}
                                  className="bg-gradient-to-r from-purple-500 to-indigo-500"
                                  disabled={getCurrentAssignments(user.id) >= 3}
                                  size="sm"
                                >
                                  <UserPlus className="h-3 w-3 mr-1" />
                                  Assign
                                </Button>
                              </>
                            )}
                            
                            {user.gender === 'female' && (
                              <div className="text-right text-xs">
                                <div className="text-white/70">
                                  Available for matching
                                </div>
                                <div className="text-white/50">
                                  Profile ready
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* Temporary Matches Tab */}
          <TabsContent value="temporary">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Temporary Matches (48-hour zone)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {temporaryMatches.map((match) => (
                      <div key={match.id} className="border border-white/10 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-4">
                              <span className="text-white font-medium">
                                {match.male_user.full_name} ↔ {match.female_user.full_name}
                              </span>
                              <Badge variant={!match.male_disengaged && !match.female_disengaged ? 'default' : 'secondary'}>
                                {!match.male_disengaged && !match.female_disengaged ? 'Active' : 'Disengaged'}
                              </Badge>
                            </div>
                            <div className="text-sm text-white/60">
                              Created: {new Date(match.created_at).toLocaleString()}
                            </div>
                            <div className="text-sm text-white/60">
                              Expires: {new Date(match.expires_at).toLocaleString()}
                            </div>
                            <div className="flex space-x-4 text-sm">
                              <span className={`${match.male_disengaged ? 'text-red-400' : 'text-green-400'}`}>
                                Male: {match.male_disengaged ? 'Disengaged' : 'Active'}
                              </span>
                              <span className={`${match.female_disengaged ? 'text-red-400' : 'text-green-400'}`}>
                                Female: {match.female_disengaged ? 'Disengaged' : 'Active'}
                              </span>
                            </div>
                          </div>
                          
                          {!match.male_disengaged && !match.female_disengaged && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="border-red-500 text-red-500 hover:bg-red-500/10">
                                  <Ban className="h-4 w-4 mr-2" />
                                  Force Disengage
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Force Disengage Match</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will immediately disengage both users and move them back to the normal pool. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
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
                    ))}
                    
                    {temporaryMatches.length === 0 && (
                      <div className="text-center text-white/60 py-8">
                        No temporary matches at the moment
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Permanent Matches Tab */}
          <TabsContent value="permanent">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5" />
                    <span>Permanent Matches</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {permanentMatches.map((match) => (
                      <div key={match.id} className="border border-white/10 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-4">
                              <span className="text-white font-medium">
                                {match.male_user.full_name} ↔ {match.female_user.full_name}
                              </span>
                              <Badge variant="default">
                                Permanent
                              </Badge>
                              {(!match.male_accepted || !match.female_accepted || !match.is_active) && (
                                <Badge variant="outline">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  {!match.is_active ? 'Inactive' : 'Pending Acceptance'}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-white/60">
                              Matched: {new Date(match.created_at).toLocaleString()}
                            </div>
                            <div className="flex space-x-4 text-sm">
                              <span className={`${!match.male_accepted ? 'text-yellow-400' : 'text-green-400'}`}>
                                Male: {match.male_accepted ? 'Accepted' : 'Pending'}
                              </span>
                              <span className={`${!match.female_accepted ? 'text-yellow-400' : 'text-green-400'}`}>
                                Female: {match.female_accepted ? 'Accepted' : 'Pending'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="border-red-500 text-red-500 hover:bg-red-500/10">
                                  Remove Match
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Permanent Match</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will remove the permanent match and add both users back to the available pool. This action should only be used in exceptional circumstances.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                                    Remove Match
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {permanentMatches.length === 0 && (
                      <div className="text-center text-white/60 py-8">
                        No permanent matches yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Payment Confirmations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {paymentUsers.map((user) => (
                      <div key={user.id} className="bg-gray-800 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-white">{user.full_name}</h4>
                            <p className="text-white/60 text-sm">{user.email}</p>
                            <p className="text-white/60 text-sm">
                              Subscription: {user.subscription_type || 'None'}
                            </p>
                            <p className="text-white/60 text-sm">
                              Rounds: {user.rounds_count || 0}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              onClick={() => handleViewPaymentProof(user)}
                              className="bg-blue-600 hover:bg-blue-500"
                              size="sm"
                            >
                              View Proof
                            </Button>
                            {!user.payment_confirmed && (
                              <Button 
                                onClick={() => confirmPayment(user.id)}
                                className="bg-green-600 hover:bg-green-500"
                                size="sm"
                              >
                                Confirm Payment
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            user.payment_confirmed 
                              ? 'bg-green-900 text-green-100' 
                              : 'bg-yellow-900 text-yellow-100'
                          }`}>
                            {user.payment_confirmed ? 'Payment Confirmed' : 'Pending Confirmation'}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {paymentUsers.length === 0 && (
                      <div className="text-center text-white/60 py-8">
                        No payment confirmations pending
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{users.length}</div>
                  <div className="text-white/60">Total Users</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <UserPlus className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{assignments.length}</div>
                  <div className="text-white/60">Active Assignments</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{temporaryMatches.length}</div>
                  <div className="text-white/60">Temporary Matches</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{permanentMatches.length}</div>
                  <div className="text-white/60">Permanent Matches</div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Assign Dialog */}
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Assign Matches to {selectedMaleUser?.full_name}
              </DialogTitle>
            </DialogHeader>
            
            {/* Compact table format */}
            <div className="space-y-2">
              <div className="grid grid-cols-5 gap-4 text-sm font-medium text-white/70 border-b border-white/20 pb-2">
                <div>Name & Age</div>
                <div>University</div>
                <div>Bio</div>
                <div>Status</div>
                <div>Action</div>
              </div>
              
              {availableProfiles.map((profile) => (
                <div key={profile.id} className="grid grid-cols-5 gap-4 items-center py-3 border-b border-white/10 hover:bg-white/5 rounded">
                  <div className="text-white font-medium">
                    {profile.full_name}, {profile.age}
                  </div>
                  <div className="text-sm text-white/80">
                    {profile.university}
                  </div>
                  <div className="text-sm text-white/70 line-clamp-2 max-w-xs">
                    {profile.bio || 'No bio available'}
                  </div>
                  <div>
                    <Badge variant="outline" className="text-xs">
                      Available
                    </Badge>
                  </div>
                  <div>
                    <Button
                      onClick={() => assignProfile(profile.id)}
                      className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                      size="sm"
                    >
                      Assign
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {availableProfiles.length === 0 && (
              <div className="text-center text-white/60 py-8">
                No available matches for assignment
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Payment Proof Dialog */}
        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Payment Proof</DialogTitle>
            </DialogHeader>
            
            {selectedPaymentProof && (
              <div className="text-center">
                <img 
                  src={selectedPaymentProof} 
                  alt="Payment Proof" 
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            )}
            
            {!selectedPaymentProof && (
              <div className="text-center text-gray-500 py-8">
                No payment proof available
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
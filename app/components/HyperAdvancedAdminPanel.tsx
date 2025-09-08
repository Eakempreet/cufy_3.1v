'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  CreditCard, 
  CheckCircle, 
  X, 
  Eye,
  RefreshCw,
  User,
  Clock,
  Calendar,
  DollarSign
} from 'lucide-react'

interface User {
  id: string
  email: string
  full_name: string
  age: number
  gender: string
  university: string
  profile_photo: string
  bio: string
  created_at: string
  subscription_type: string
  subscription_status: string
  payment_confirmed: boolean
  payment_proof_url: string
  rounds_count: number
}

export default function HyperAdvancedAdminPanel() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedProof, setSelectedProof] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/payments')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else {
        console.error('Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const confirmPayment = async (userId: string) => {
    try {
      setActionLoading(userId)
      const response = await fetch('/api/admin/payments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, action: 'confirm' })
      })

      if (response.ok) {
        // Refresh the users list
        await fetchUsers()
      } else {
        console.error('Failed to confirm payment')
      }
    } catch (error) {
      console.error('Error confirming payment:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const getPaymentProofUrl = (proofUrl: string | null) => {
    if (!proofUrl) return null
    
    // If it's already a full URL, return it
    if (proofUrl.startsWith('http')) return proofUrl
    
    // If it's a Supabase storage path, construct the full URL
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/payment-proofs/${proofUrl}`
  }

  // Check if user is admin - moved after all hooks
  if (!session?.user?.email || session.user.email !== 'cufy.online@gmail.com') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
            <p className="text-gray-600">You don&apos;t have permission to access this admin panel.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const pendingPayments = users.filter(user => !user.payment_confirmed && user.payment_proof_url)
  const confirmedPayments = users.filter(user => user.payment_confirmed)
  const noProofUsers = users.filter(user => !user.payment_proof_url)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-white/70">Manage payments and user verifications</p>
          <Button 
            onClick={fetchUsers}
            className="mt-4 bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh Data
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-white/70">Pending Payments</p>
                  <p className="text-2xl font-bold text-white">{pendingPayments.length}</p>
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
                  <p className="text-2xl font-bold text-white">{confirmedPayments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-white/70">Total Users</p>
                  <p className="text-2xl font-bold text-white">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-purple-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-white/70">Revenue (Confirmed)</p>
                  <p className="text-2xl font-bold text-white">
                    ₹{confirmedPayments.reduce((sum, user) => 
                      sum + (user.subscription_type === 'premium' ? 249 : 99), 0
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Management Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/10">
            <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-600">
              Pending ({pendingPayments.length})
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="data-[state=active]:bg-green-600">
              Confirmed ({confirmedPayments.length})
            </TabsTrigger>
            <TabsTrigger value="no-proof" className="data-[state=active]:bg-gray-600">
              No Proof ({noProofUsers.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending Payments */}
          <TabsContent value="pending" className="space-y-4">
            {pendingPayments.length === 0 ? (
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-6 text-center">
                  <Clock className="h-12 w-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/70">No pending payments to review</p>
                </CardContent>
              </Card>
            ) : (
              pendingPayments.map(user => (
                <Card key={user.id} className="bg-white/10 border-white/20">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      {/* User Info */}
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.profile_photo} />
                          <AvatarFallback>
                            <User className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-white font-semibold">{user.full_name}</h3>
                          <p className="text-white/70 text-sm">{user.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={`${
                              user.subscription_type === 'premium' 
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' 
                                : 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                            }`}>
                              {user.subscription_type} - ₹{user.subscription_type === 'premium' ? '249' : '99'}
                            </Badge>
                            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50">
                              Pending Review
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Payment Proof & Actions */}
                      <div className="flex items-center space-x-4">
                        {user.payment_proof_url && (
                          <Button
                            onClick={() => setSelectedProof(getPaymentProofUrl(user.payment_proof_url))}
                            variant="outline"
                            size="sm"
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Proof
                          </Button>
                        )}
                        <Button
                          onClick={() => confirmPayment(user.id)}
                          disabled={actionLoading === user.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {actionLoading === user.id ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Confirm Payment
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Confirmed Payments */}
          <TabsContent value="confirmed" className="space-y-4">
            {confirmedPayments.length === 0 ? (
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/70">No confirmed payments yet</p>
                </CardContent>
              </Card>
            ) : (
              confirmedPayments.map(user => (
                <Card key={user.id} className="bg-white/10 border-white/20">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.profile_photo} />
                          <AvatarFallback>
                            <User className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-white font-semibold">{user.full_name}</h3>
                          <p className="text-white/70 text-sm">{user.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={`${
                              user.subscription_type === 'premium' 
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' 
                                : 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                            }`}>
                              {user.subscription_type} - ₹{user.subscription_type === 'premium' ? '249' : '99'}
                            </Badge>
                            <Badge className="bg-green-500/20 text-green-300 border-green-500/50">
                              Confirmed
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {user.payment_proof_url && (
                        <Button
                          onClick={() => setSelectedProof(getPaymentProofUrl(user.payment_proof_url))}
                          variant="outline"
                          size="sm"
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Proof
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* No Proof Users */}
          <TabsContent value="no-proof" className="space-y-4">
            {noProofUsers.length === 0 ? (
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-6 text-center">
                  <CreditCard className="h-12 w-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/70">All users have uploaded payment proof</p>
                </CardContent>
              </Card>
            ) : (
              noProofUsers.map(user => (
                <Card key={user.id} className="bg-white/10 border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.profile_photo} />
                        <AvatarFallback>
                          <User className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-white font-semibold">{user.full_name}</h3>
                        <p className="text-white/70 text-sm">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={`${
                            user.subscription_type === 'premium' 
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' 
                              : 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                          }`}>
                            {user.subscription_type} - ₹{user.subscription_type === 'premium' ? '249' : '99'}
                          </Badge>
                          <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/50">
                            No Payment Proof
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Proof Modal */}
      {selectedProof && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedProof(null)}
        >
          <div className="bg-white rounded-lg p-4 max-w-2xl max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Payment Proof</h3>
              <Button
                onClick={() => setSelectedProof(null)}
                variant="outline"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <img 
              src={selectedProof} 
              alt="Payment Proof" 
              className="w-full h-auto rounded-lg"
              style={{ maxHeight: '60vh', objectFit: 'contain' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
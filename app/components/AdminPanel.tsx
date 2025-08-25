'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { 
  Users, 
  Heart, 
  MessageCircle, 
  CreditCard,
  Search,
  Settings,
  Crown,
  Check,
  X,
  Edit,
  Trash2
} from 'lucide-react'

const mockUsers = [
  {
    id: 1,
    name: 'Alex Johnson',
    email: 'alex@example.com',
    age: 23,
    university: 'IIT Delhi',
    isPaid: true,
    currentRound: 1,
    totalMatches: 3,
    joinDate: '2024-01-15',
  },
  {
    id: 2,
    name: 'Sarah Wilson',
    email: 'sarah@example.com', 
    age: 22,
    university: 'Delhi University',
    isPaid: false,
    currentRound: 0,
    totalMatches: 0,
    joinDate: '2024-01-20',
  },
]

const mockMatches = [
  {
    id: 1,
    user1: 'Alex Johnson',
    user2: 'Sarah Wilson',
    round: 1,
    status: 'active',
    createdAt: '2024-01-25',
  },
  {
    id: 2,
    user1: 'John Doe',
    user2: 'Jane Smith',
    round: 2,
    status: 'pending',
    createdAt: '2024-01-26',
  },
]

const mockQuestions = [
  {
    id: 1,
    user: 'Alex Johnson',
    question: 'What are the best conversation starters?',
    answer: 'Start with genuine curiosity about their interests...',
    status: 'answered',
    timestamp: '2024-01-25 10:30 AM',
  },
  {
    id: 2,
    user: 'Sarah Wilson',
    question: 'How do I plan a great first date?',
    answer: '',
    status: 'pending',
    timestamp: '2024-01-26 2:15 PM',
  },
]

export default function AdminPanel() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-dark">
      <div className="container mx-auto px-4 py-8">
        {/* Admin Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="gradient-premium p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white font-poppins">
                  Admin Dashboard
                </h1>
                <p className="text-white/80 mt-2">
                  Manage users, matches, and platform operations
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-white/20 text-white">
                  <Crown className="h-3 w-3 mr-1" />
                  Admin Access
                </Badge>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Admin Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4 glass backdrop-blur-md mb-8">
            <TabsTrigger value="users" className="data-[state=active]:bg-primary">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="matches" className="data-[state=active]:bg-primary">
              <Heart className="h-4 w-4 mr-2" />
              Matches
            </TabsTrigger>
            <TabsTrigger value="questions" className="data-[state=active]:bg-primary">
              <MessageCircle className="h-4 w-4 mr-2" />
              Questions
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-primary">
              <CreditCard className="h-4 w-4 mr-2" />
              Payments
            </TabsTrigger>
          </TabsList>

          {/* Users Management */}
          <TabsContent value="users">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Search Bar */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                      <Input
                        placeholder="Search users by name, email, or university..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button variant="outline">
                      Filter
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Users Table */}
              <Card>
                <CardHeader>
                  <CardTitle>All Users ({mockUsers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockUsers.map((user) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass p-4 rounded-lg border border-white/10"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-white font-semibold">
                                {user.name}
                              </h3>
                              <p className="text-white/60 text-sm">
                                {user.email}
                              </p>
                              <p className="text-white/60 text-sm">
                                {user.university} • Age {user.age}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="flex items-center space-x-2 mb-1">
                                <Badge 
                                  className={user.isPaid ? 'bg-green-500' : 'bg-gray-500'}
                                >
                                  {user.isPaid ? 'Paid' : 'Free'}
                                </Badge>
                                <Badge variant="outline" className="border-white/30 text-white">
                                  Round {user.currentRound}
                                </Badge>
                              </div>
                              <p className="text-white/60 text-sm">
                                {user.totalMatches} matches
                              </p>
                            </div>

                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className={user.isPaid ? 'text-red-400' : 'text-green-400'}
                              >
                                {user.isPaid ? (
                                  <X className="h-3 w-3" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Matches Management */}
          <TabsContent value="matches">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Active Matches */}
                <Card>
                  <CardHeader>
                    <CardTitle>Active Matches</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockMatches.map((match) => (
                        <div key={match.id} className="glass p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="text-white font-medium">
                                {match.user1} ↔ {match.user2}
                              </p>
                              <p className="text-white/60 text-sm">
                                Round {match.round} • {match.createdAt}
                              </p>
                            </div>
                            <Badge 
                              className={match.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}
                            >
                              {match.status}
                            </Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-400">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Create Match */}
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Match</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        User 1
                      </label>
                      <select className="w-full h-12 rounded-lg glass backdrop-blur-md px-4 py-2 text-white bg-transparent border border-white/20">
                        <option value="" disabled>Select user</option>
                        {mockUsers.map(user => (
                          <option key={user.id} value={user.id} className="bg-gray-800">
                            {user.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        User 2
                      </label>
                      <select className="w-full h-12 rounded-lg glass backdrop-blur-md px-4 py-2 text-white bg-transparent border border-white/20">
                        <option value="" disabled>Select user</option>
                        {mockUsers.map(user => (
                          <option key={user.id} value={user.id} className="bg-gray-800">
                            {user.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Round
                      </label>
                      <select className="w-full h-12 rounded-lg glass backdrop-blur-md px-4 py-2 text-white bg-transparent border border-white/20">
                        <option value="1" className="bg-gray-800">Round 1</option>
                        <option value="2" className="bg-gray-800">Round 2</option>
                      </select>
                    </div>

                    <Button className="w-full gradient-primary">
                      Create Match
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </TabsContent>

          {/* Questions Management */}
          <TabsContent value="questions">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {mockQuestions.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {item.question}
                          </h3>
                          <Badge 
                            className={item.status === 'answered' ? 'bg-green-500' : 'bg-yellow-500'}
                          >
                            {item.status}
                          </Badge>
                        </div>
                        <p className="text-white/60 text-sm">
                          Asked by {item.user} • {item.timestamp}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Type your answer here..."
                        value={item.answer}
                        className="min-h-[100px]"
                      />
                      <div className="flex space-x-2">
                        <Button className="gradient-primary">
                          {item.status === 'answered' ? 'Update Answer' : 'Send Answer'}
                        </Button>
                        {item.status === 'answered' && (
                          <Button variant="outline" className="text-red-400">
                            Delete Answer
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </TabsContent>

          {/* Payment Management */}
          <TabsContent value="payments">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Payment Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div className="glass p-4 rounded-lg text-center">
                      <h3 className="text-2xl font-bold text-green-400">₹2,450</h3>
                      <p className="text-white/60">Total Revenue</p>
                    </div>
                    <div className="glass p-4 rounded-lg text-center">
                      <h3 className="text-2xl font-bold text-blue-400">15</h3>
                      <p className="text-white/60">Paid Users</p>
                    </div>
                    <div className="glass p-4 rounded-lg text-center">
                      <h3 className="text-2xl font-bold text-purple-400">8</h3>
                      <p className="text-white/60">Free Users</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {mockUsers.map((user) => (
                      <div key={user.id} className="glass p-4 rounded-lg flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-semibold">{user.name}</h3>
                          <p className="text-white/60 text-sm">{user.email}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge 
                            className={user.isPaid ? 'bg-green-500' : 'bg-gray-500'}
                          >
                            {user.isPaid ? 'Premium' : 'Free'}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className={user.isPaid ? 'text-red-400' : 'text-green-400'}
                          >
                            {user.isPaid ? 'Revoke' : 'Grant'} Premium
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
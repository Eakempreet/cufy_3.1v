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
  User, 
  Heart, 
  MessageCircle, 
  Settings, 
  Crown,
  Camera,
  Send,
  Star
} from 'lucide-react'
import FloatingShapes from './FloatingShapes'

const mockMatches = [
  {
    id: 1,
    name: 'Sarah',
    age: 22,
    university: 'Delhi University',
    bio: 'Love coffee and deep conversations ☕',
    photo: '/api/placeholder/300/400',
    compatibility: 92,
  },
  {
    id: 2,
    name: 'Priya',
    age: 21,
    university: 'Mumbai University', 
    bio: 'Adventure seeker and book lover 📚',
    photo: '/api/placeholder/300/400',
    compatibility: 88,
  },
]

const mockQuestions = [
  {
    id: 1,
    question: "What are the best conversation starters?",
    answer: "Start with genuine curiosity about their interests, ask about their passion projects, or comment on something from their profile that genuinely interests you.",
    timestamp: "2 hours ago",
    status: 'answered'
  },
  {
    id: 2,
    question: "How do I plan a great first date?",
    answer: null,
    timestamp: "1 day ago", 
    status: 'pending'
  }
]

export default function Dashboard() {
  const [newQuestion, setNewQuestion] = useState('')
  
  return (
    <div className="min-h-screen bg-dark relative">
      <FloatingShapes />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="gradient-primary p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white font-poppins">
                  Welcome back, Alex!
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium Plan
                  </Badge>
                  <Badge variant="outline" className="border-white/30 text-white">
                    5 matches remaining
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Main Tabs */}
        <Tabs defaultValue="matches" className="w-full">
          <TabsList className="grid w-full grid-cols-3 glass backdrop-blur-md mb-8">
            <TabsTrigger value="matches" className="data-[state=active]:bg-primary">
              <Heart className="h-4 w-4 mr-2" />
              Matches
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary">
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile  
            </TabsTrigger>
            <TabsTrigger value="questions" className="data-[state=active]:bg-primary">
              <MessageCircle className="h-4 w-4 mr-2" />
              Questions
            </TabsTrigger>
          </TabsList>

          {/* Matches Tab */}
          <TabsContent value="matches">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {mockMatches.map((match) => (
                <motion.div
                  key={match.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="overflow-hidden">
                    <div className="relative">
                      <div className="w-full h-64 bg-gradient-to-br from-primary to-secondary rounded-t-lg" />
                      <Badge 
                        className="absolute top-4 right-4 bg-green-500"
                      >
                        {match.compatibility}% match
                      </Badge>
                    </div>
                    
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-white">
                          {match.name}, {match.age}
                        </h3>
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      </div>
                      
                      <p className="text-sm text-white/60 mb-2">
                        {match.university}
                      </p>
                      
                      <p className="text-white/80 mb-4 line-clamp-2">
                        {match.bio}
                      </p>
                      
                      <Button className="w-full gradient-primary">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Start Chat
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {/* Upgrade Banner for Non-Premium */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="glass border-2 border-dashed border-primary/50 flex items-center justify-center p-8">
                  <div className="text-center">
                    <Crown className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Unlock More Matches
                    </h3>
                    <p className="text-white/60 mb-4">
                      Upgrade to premium to see more potential matches
                    </p>
                    <Button className="gradient-premium">
                      Upgrade Now
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Edit Profile</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Photo */}
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <Camera className="h-12 w-12 text-white" />
                    </div>
                    <Button variant="outline">
                      Change Photo
                    </Button>
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Full Name
                      </label>
                      <Input placeholder="Alex Johnson" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Age
                      </label>
                      <Input placeholder="23" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      University
                    </label>
                    <Input placeholder="IIT Delhi" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Bio
                    </label>
                    <Textarea 
                      placeholder="Tell us something interesting about yourself..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <Button className="w-full gradient-primary">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              {/* Ask New Question */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5" />
                    <span>Ask a Question</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4">
                    <Input
                      placeholder="What would you like to ask our experts?"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      className="flex-1"
                    />
                    <Button className="gradient-primary">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Questions List */}
              <div className="space-y-6">
                {mockQuestions.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: item.id * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-lg font-semibold text-white">
                            {item.question}
                          </h3>
                          <Badge 
                            variant={item.status === 'answered' ? 'default' : 'secondary'}
                            className={item.status === 'answered' ? 'bg-green-500' : 'bg-yellow-500'}
                          >
                            {item.status}
                          </Badge>
                        </div>
                        
                        {item.answer ? (
                          <div className="glass p-4 rounded-lg">
                            <p className="text-white/90">{item.answer}</p>
                          </div>
                        ) : (
                          <div className="glass p-4 rounded-lg border-2 border-dashed border-yellow-500/30">
                            <p className="text-white/60 italic">
                              Our experts are working on your answer...
                            </p>
                          </div>
                        )}
                        
                        <p className="text-sm text-white/50 mt-4">
                          Asked {item.timestamp}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
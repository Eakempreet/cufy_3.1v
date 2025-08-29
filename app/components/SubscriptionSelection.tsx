'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, Star, Users, Clock, Headphones, AlertTriangle, X } from 'lucide-react'

interface SubscriptionPlan {
  id: string
  name: string
  type: 'basic' | 'premium'
  price: number
  duration_days: number
  features: {
    profiles_per_round: number
    max_rounds: number
    support: string
    advanced_filters?: boolean
    choice: boolean
  }
}

interface SubscriptionSelectionProps {
  onSelect?: (type: 'basic' | 'premium') => void
  showSkip?: boolean
}

export default function SubscriptionSelection({ onSelect, showSkip = false }: SubscriptionSelectionProps = {}) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showSkipWarning, setShowSkipWarning] = useState(false)
  const router = useRouter()

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic Plan',
      type: 'basic',
      price: 99,
      duration_days: 30,
      features: {
        profiles_per_round: 1,
        max_rounds: 2,
        support: 'email',
        choice: false
      }
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      type: 'premium', 
      price: 249,
      duration_days: 30,
      features: {
        profiles_per_round: 3,
        max_rounds: 2,
        support: 'priority',
        advanced_filters: true,
        choice: true
      }
    }
  ]

  const handleSelectPlan = async () => {
    if (!selectedPlan) return

    // If onSelect prop is provided, use it instead of internal logic
    if (onSelect) {
      setSubmitting(true)
      try {
        console.log('Using parent onSelect handler for:', selectedPlan)
        await onSelect(selectedPlan as 'basic' | 'premium')
      } catch (error) {
        console.error('Error in onSelect:', error)
      } finally {
        setSubmitting(false)
      }
      return
    }

    // Internal logic (only used when no onSelect prop is provided)
    setSubmitting(true)
    try {
      console.log('Using internal handler, submitting subscription plan:', selectedPlan)
      
      const response = await fetch('/api/user/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription_type: selectedPlan,
        }),
      })

      const data = await response.json()
      console.log('Subscription API response:', data)

      if (response.ok) {
        console.log('Subscription successful, redirecting to payment page...')
        console.log('Current selectedPlan:', selectedPlan)
        
        // Use window.location.href for more reliable navigation
        const paymentUrl = `/payment?plan=${selectedPlan}`
        console.log('Navigating to:', paymentUrl)
        
        // Try both methods to ensure navigation works
        window.location.href = paymentUrl
        
        // Also try router.push as backup
        setTimeout(() => {
          router.push(paymentUrl)
        }, 100)
      } else {
        console.error('Failed to select subscription:', data)
        alert(data.error || 'Failed to select subscription. Please try again.')
      }
    } catch (error) {
      console.error('Error selecting subscription:', error)
      alert('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSkip = () => {
    setShowSkipWarning(true)
  }

  const confirmSkip = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Select a subscription plan to start discovering meaningful connections. 
            Your profile is complete, now choose how you want to connect!
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {subscriptionPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`relative overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
                  selectedPlan === plan.type
                    ? 'border-pink-500 bg-white/10 shadow-2xl scale-105' 
                    : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40'
                }`}
                onClick={() => setSelectedPlan(plan.type)}
              >
                {plan.type === 'premium' && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold">
                      <Crown className="w-3 h-3 mr-1" />
                      POPULAR
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-6">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
                    {plan.type === 'premium' ? (
                      <Star className="w-8 h-8 text-white" />
                    ) : (
                      <Users className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <CardTitle className="text-2xl font-bold text-white">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    {plan.type === 'premium' ? 'Maximum choice and flexibility' : 'Simple and affordable'}
                  </CardDescription>
                  <div className="text-center">
                    <span className="text-4xl font-bold text-white">₹{plan.price}</span>
                    <span className="text-white/60 ml-2">/{plan.duration_days} days</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center text-white">
                      <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      <span>
                        {plan.features.profiles_per_round} girl profile{plan.features.profiles_per_round > 1 ? 's' : ''} per round
                      </span>
                    </div>
                    <div className="flex items-center text-white">
                      <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      <span>{plan.features.max_rounds} rounds total</span>
                    </div>
                    
                    {plan.type === 'basic' ? (
                      <div className="flex items-start text-white">
                        <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>No choice</strong> - We assign the perfect match for you
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-start text-white">
                        <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>You choose</strong> - Select 1 from 3 profiles to reveal
                        </span>
                      </div>
                    )}
                    
                    {plan.type === 'premium' && (
                      <div className="flex items-start text-white">
                        <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                        <span>
                          Other 2 profiles get reassigned to others
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-white">
                      <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      <span className="flex items-center">
                        <Headphones className="w-4 h-4 mr-1" />
                        {plan.features.support === 'priority' ? 'Priority' : 'Email'} support
                      </span>
                    </div>
                    
                    <div className="flex items-center text-white">
                      <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {plan.duration_days} days validity
                      </span>
                    </div>
                  </div>

                  {selectedPlan === plan.type && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="pt-4 border-t border-white/20"
                    >
                      <div className="text-center text-sm text-green-400 font-medium">
                        ✓ Selected Plan
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-4"
        >
          <Button
            onClick={handleSelectPlan}
            disabled={!selectedPlan || submitting}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 px-8 text-lg disabled:opacity-50"
            size="lg"
          >
            {submitting ? 'Processing...' : 'Continue to Payment'}
          </Button>
          
          {showSkip && (
            <div>
              <Button
                onClick={handleSkip}
                variant="outline"
                className="border-white/30 text-white/70 hover:bg-white/10"
              >
                Skip for now
              </Button>
            </div>
          )}
          
          <p className="text-white/60 mt-4 text-sm">
            Secure payment • No hidden charges • Cancel anytime
          </p>
        </motion.div>

        {/* Skip Warning Modal */}
        {showSkipWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSkipWarning(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-800 rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
                <h3 className="text-lg font-semibold text-white">Hold up! 🚫</h3>
              </div>
              <p className="text-white/80 mb-6">
                Without a subscription, you won't receive any matches! 
                Choose a plan to start connecting with amazing people.
              </p>
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowSkipWarning(false)}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600"
                >
                  Choose Plan
                </Button>
                <Button
                  onClick={confirmSkip}
                  variant="outline"
                  className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10"
                >
                  Skip Anyway
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

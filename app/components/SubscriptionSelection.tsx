'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, Star, Users, Clock, Headphones } from 'lucide-react'

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
  }
}

interface SubscriptionSelectionProps {
  onSelect?: (type: 'basic' | 'premium') => void
}

export default function SubscriptionSelection({ onSelect }: SubscriptionSelectionProps = {}) {
  const [subscriptions, setSubscriptions] = useState<SubscriptionPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/subscriptions')
      const data = await response.json()
      setSubscriptions(data.subscriptions || [])
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPlan = async () => {
    if (!selectedPlan) return

    // If onSelect prop is provided, use it instead of internal logic
    if (onSelect) {
      onSelect(selectedPlan as 'basic' | 'premium')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/user/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription_type: selectedPlan,
        }),
      })

      if (response.ok) {
        // Redirect to payment page
        router.push(`/payment?plan=${selectedPlan}`)
      } else {
        console.error('Failed to select subscription')
      }
    } catch (error) {
      console.error('Error selecting subscription:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading subscription plans...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Select a subscription plan to start discovering meaningful connections. 
            Your profile is complete, now choose how you want to connect!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {subscriptions.map((plan) => (
            <Card 
              key={plan.id} 
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
                  {plan.type === 'premium' ? 'Best value for serious connections' : 'Perfect to get started'}
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
                    <span>{plan.features.profiles_per_round} profiles per round</span>
                  </div>
                  <div className="flex items-center text-white">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span>Up to {plan.features.max_rounds} rounds</span>
                  </div>
                  <div className="flex items-center text-white">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="flex items-center">
                      <Headphones className="w-4 h-4 mr-1" />
                      {plan.features.support === 'priority' ? 'Priority' : 'Email'} support
                    </span>
                  </div>
                  {plan.features.advanced_filters && (
                    <div className="flex items-center text-white">
                      <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      <span>Advanced matching filters</span>
                    </div>
                  )}
                  <div className="flex items-center text-white">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {plan.duration_days} days validity
                    </span>
                  </div>
                </div>

                {selectedPlan === plan.type && (
                  <div className="pt-4 border-t border-white/20">
                    <div className="text-center text-sm text-green-400 font-medium">
                      ✓ Selected Plan
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button
            onClick={handleSelectPlan}
            disabled={!selectedPlan || submitting}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 px-8 text-lg disabled:opacity-50"
            size="lg"
          >
            {submitting ? 'Processing...' : 'Continue to Payment'}
          </Button>
          
          <p className="text-white/60 mt-4 text-sm">
            Secure payment • No hidden charges • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Clock, QrCode, Upload, CheckCircle2, AlertCircle, Copy } from 'lucide-react'
import ImageUpload from './ImageUpload'

interface PaymentPageProps {
  subscriptionType?: 'basic' | 'premium'
  onPaymentProofUploaded?: () => void
}

export default function PaymentPage({ subscriptionType, onPaymentProofUploaded }: PaymentPageProps = {}) {
  const [timeLeft, setTimeLeft] = useState(8 * 60) // 8 minutes in seconds
  const [planDetails, setPlanDetails] = useState<any>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [paymentProof, setPaymentProof] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [existingProof, setExistingProof] = useState<string | null>(null)
  const [userPaymentStatus, setUserPaymentStatus] = useState<any>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = subscriptionType || searchParams.get('plan')

  console.log('PaymentPage component loaded, plan:', plan)

  // UPI ID for payment (you can replace this with your actual UPI ID)
  const upiId = "cufy@paytm" // Replace with your actual UPI ID
  const upiLink = `upi://pay?pa=${upiId}&pn=Cufy Dating&cu=INR`

  useEffect(() => {
    console.log('PaymentPage useEffect running, plan:', plan)
    if (!plan) {
      console.log('No plan found, redirecting to subscription-selection')
      router.push('/subscription-selection')
      return
    }
    fetchPlanDetails()
    checkExistingPayment()
  }, [plan])

  useEffect(() => {
    if (timeLeft > 0 && !submitted && !userPaymentStatus?.payment_confirmed) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft, submitted, userPaymentStatus])

  const checkExistingPayment = async () => {
    try {
      console.log('Checking existing payment...')
      const response = await fetch('/api/user/check')
      const data = await response.json()
      console.log('User check response:', data)
      
      if (data.exists && data.user) {
        setUserPaymentStatus(data.user)
        if (data.user.payment_proof_url) {
          setExistingProof(data.user.payment_proof_url)
          setPaymentProof(data.user.payment_proof_url)
        }
      }
    } catch (error) {
      console.error('Error checking existing payment:', error)
    }
  }

  const fetchPlanDetails = async () => {
    try {
      console.log('Fetching plan details for:', plan)
      // Since we don't have a subscriptions API, let's use static plan details
      const planData = {
        basic: { price: 99, name: 'Basic Plan' },
        premium: { price: 249, name: 'Premium Plan' }
      }
      
      setPlanDetails(planData[plan as keyof typeof planData] || planData.basic)
      console.log('Plan details set:', planData[plan as keyof typeof planData])
    } catch (error) {
      console.error('Error fetching plan details:', error)
      // Set default plan details
      setPlanDetails({ price: plan === 'premium' ? 249 : 99, name: `${plan?.toUpperCase()} Plan` })
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId)
  }

  const handleProofUploaded = (url: string) => {
    setPaymentProof(url)
  }

  const submitPaymentProof = async () => {
    if (!paymentProof || !planDetails) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/user/payment-proof', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_proof_url: paymentProof,
        }),
      })

      if (response.ok) {
        setSubmitted(true)
        if (onPaymentProofUploaded) {
          onPaymentProofUploaded()
        } else {
          // Redirect to dashboard after successful submission
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        }
      } else {
        console.error('Failed to submit payment proof')
      }
    } catch (error) {
      console.error('Error submitting payment proof:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (!planDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-white">Loading payment details...</div>
      </div>
    )
  }

  // Show success screen after submission
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
        <Card className="bg-white/10 border-white/20 max-w-md mx-auto">
          <CardContent className="text-center p-8">
            <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Payment Proof Submitted!</h2>
            <p className="text-white/80 mb-6">
              Thank you! Your payment proof has been submitted successfully. 
              Our team will review it shortly and confirm your payment.
            </p>
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-6">
              <p className="text-blue-400 text-sm">
                You will receive confirmation within 24 hours. Redirecting to dashboard...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-pink-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Complete Your Payment</h1>
          <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
            {plan?.toUpperCase()} PLAN
          </Badge>
        </div>

        {/* Timer Alert */}
        <div className="mb-8">
          <Alert className="bg-orange-500/20 border-orange-500/50">
            <Clock className="h-4 w-4" />
            <AlertDescription className="text-white">
              <strong>Time Remaining: {formatTime(timeLeft)}</strong> - Complete your payment before the session expires
            </AlertDescription>
          </Alert>
          {timeLeft === 0 && (
            <p className="text-red-400 mt-2 font-semibold">Payment session expired. Please refresh to try again.</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* QR Code and Payment Details */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="text-center">
              <CardTitle className="text-white text-xl">Scan QR Code to Pay</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              {/* QR Code Placeholder - You'll replace this with actual QR code */}
              <div className="bg-white p-4 rounded-lg mx-auto w-64 h-64 flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="w-32 h-32 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-600 text-sm">QR Code</p>
                  <p className="text-gray-800 font-semibold">₹{planDetails.price}</p>
                </div>
              </div>

              {/* Payment Instructions */}
              <div className="space-y-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">Payment Details</h3>
                  <div className="space-y-2 text-sm text-white/80">
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-semibold">₹{planDetails.price}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>UPI ID:</span>
                      <div className="flex items-center">
                        <span className="font-mono">{upiId}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={copyUpiId}
                          className="ml-2 h-6 w-6 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button 
                    onClick={() => window.open(upiLink)}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                  >
                    Pay with UPI App
                  </Button>
                  <p className="text-xs text-white/60">
                    Click to open your UPI app directly
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Section */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-xl">
                {existingProof ? 'Payment Proof Status' : 'Upload Payment Proof'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Show existing payment status */}
              {userPaymentStatus?.payment_confirmed ? (
                <div className="text-center">
                  <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-6 mb-4">
                    <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-green-400 font-semibold text-lg mb-2">Payment Confirmed!</h3>
                    <p className="text-white/80">
                      Your payment has been confirmed by our team. You can now access all features.
                    </p>
                  </div>
                  <Button 
                    onClick={() => router.push('/dashboard')}
                    className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              ) : existingProof ? (
                <div className="text-center">
                  <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-6 mb-4">
                    <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-yellow-400 font-semibold text-lg mb-2">Payment Proof Uploaded</h3>
                    <p className="text-white/80 mb-4">
                      Your payment proof has been uploaded and is under review. You can re-upload if needed.
                    </p>
                    {existingProof && (
                      <div className="bg-white/5 rounded-lg p-4 mb-4">
                        <img 
                          src={existingProof} 
                          alt="Current payment proof" 
                          className="max-w-full h-48 object-cover rounded mx-auto"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <Button 
                      onClick={() => setShowUpload(!showUpload)}
                      variant="outline"
                      className="w-full border-white/30 text-white hover:bg-white/10"
                    >
                      {showUpload ? 'Cancel Re-upload' : 'Re-upload Payment Proof'}
                    </Button>
                    
                    <Button 
                      onClick={() => router.push('/dashboard')}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                </div>
              ) : !showUpload ? (
                <div className="text-center">
                  <div className="bg-white/5 rounded-lg p-8 mb-4">
                    <Upload className="w-12 h-12 text-white/60 mx-auto mb-4" />
                    <p className="text-white/80 mb-4">
                      After completing the payment, click below to upload your payment screenshot or receipt.
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowUpload(true)}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                    disabled={timeLeft === 0}
                  >
                    I have completed the payment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-white font-semibold">
                    {existingProof ? 'Re-upload Payment Screenshot' : 'Upload Payment Screenshot'}
                  </h3>
                  <div className="bg-white/5 rounded-lg p-4">
                    <ImageUpload
                      onImageUploaded={handleProofUploaded}
                      currentImage={existingProof || undefined}
                      className="w-full"
                    />
                  </div>
                  
                  {paymentProof && (
                    <div className="space-y-4">
                      <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                        <div className="flex items-center text-green-400">
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          <span>
                            {existingProof ? 'New payment proof ready to submit!' : 'Payment proof uploaded successfully!'}
                          </span>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={submitPaymentProof}
                        disabled={submitting}
                        className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                      >
                        {submitting ? 'Submitting...' : existingProof ? 'Update Payment Proof' : 'Submit Payment Proof'}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8 text-white/60 text-sm">
          <p>Having trouble? Contact support at support@cufy.com</p>
        </div>
      </div>
    </div>
  )
}
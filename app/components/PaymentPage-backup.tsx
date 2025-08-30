'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import QRCode from 'qrcode'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  QrCode, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Smartphone,
  CreditCard,
  Shield,
  Clock,
  ArrowLeft,
  Camera,
  Star,
  Crown,
  Zap,
  Heart,
  Users,
  Timer,
  Gift
} from 'lucide-react'
import FloatingShapes from './FloatingShapes'

interface PaymentPageProps {
  subscriptionType?: 'basic' | 'premium'
  onPaymentProofUploaded?: () => void
}

export default function PaymentPage({ subscriptionType, onPaymentProofUploaded }: PaymentPageProps = {}) {
  const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 minutes
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
  const [paymentProof, setPaymentProof] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const plan = subscriptionType || searchParams.get('plan') as 'basic' | 'premium'
  const planAmount = plan === 'basic' ? 99 : 249
  const upiId = "9211660455@fam"
  const recipientName = "Eakempreet Singh"

  // Generate QR code on mount using the provided UPI QR image
  useEffect(() => {
    const generateQR = async () => {
      try {
        const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(recipientName)}&am=${planAmount}.0`
        const qrData = await QRCode.toDataURL(upiUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: '#1f2937',
            light: '#ffffff'
          }
        })
        setQrCodeDataUrl(qrData)
      } catch (error) {
        console.error('QR code generation failed:', error)
      }
    }

    if (plan) {
      generateQR()
    }
  }, [plan, planAmount, upiId, recipientName])

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Copy to clipboard
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(label)
      setTimeout(() => setCopiedText(null), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  // Open UPI app
  const openUpiApp = (appUrl: string) => {
    const amount = planAmount
    const baseUrl = `${appUrl}?pa=${upiId}&pn=${encodeURIComponent(recipientName)}&am=${amount}.0`
    window.location.href = baseUrl
  }

  // Handle payment proof upload
  const handleProofUpload = async (file: File) => {
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('proof', file)
      formData.append('plan', plan || 'basic')
      
      const response = await fetch('/api/user/payment-proof', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        setSubmitted(true)
        setCurrentStep(3)
        onPaymentProofUploaded?.()
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const planFeatures = {
    basic: [
      { icon: Heart, text: "1 girl profile per round", highlight: false },
      { icon: Timer, text: "2 rounds total", highlight: false },
      { icon: Users, text: "Admin assigned profiles", highlight: false },
      { icon: Shield, text: "Secure matching", highlight: false }
    ],
    premium: [
      { icon: Crown, text: "3 girl profiles per round", highlight: true },
      { icon: Timer, text: "2 rounds total", highlight: false },
      { icon: Star, text: "Choose 1 profile to reveal", highlight: true },
      { icon: Zap, text: "Priority matching", highlight: true },
      { icon: Gift, text: "Exclusive features", highlight: true }
    ]
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <FloatingShapes />
      
      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-xl rounded-full px-4 py-2">
              <Clock className="h-4 w-4 text-white" />
              <span className="text-white font-mono">{formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4 mb-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    currentStep >= step 
                      ? 'bg-blue-500 border-blue-500 text-white' 
                      : 'border-white/30 text-white/30'
                  }`}>
                    {step === 3 && submitted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      step
                    )}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-0.5 ml-4 ${
                      currentStep > step ? 'bg-blue-500' : 'bg-white/30'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center text-white/70 text-sm">
              {currentStep === 1 && "Choose Payment Method"}
              {currentStep === 2 && "Upload Payment Proof"}
              {currentStep === 3 && "Payment Submitted"}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid lg:grid-cols-2 gap-8"
              >
                {/* Plan Summary */}
                <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-3">
                      {plan === 'premium' ? (
                        <Crown className="h-6 w-6 text-yellow-400" />
                      ) : (
                        <Heart className="h-6 w-6 text-pink-400" />
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="capitalize">{plan} Plan</span>
                          {plan === 'premium' && (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <div className="text-3xl font-bold text-white mt-2">
                          ₹{planAmount}
                          <span className="text-lg font-normal text-white/60">/plan</span>
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {planFeatures[plan].map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <feature.icon className={`h-5 w-5 ${
                            feature.highlight ? 'text-yellow-400' : 'text-green-400'
                          }`} />
                          <span className={`${
                            feature.highlight ? 'text-white font-medium' : 'text-white/80'
                          }`}>
                            {feature.text}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Total Amount</span>
                        <span className="text-white font-bold text-xl">₹{planAmount}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Methods */}
                <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <CreditCard className="h-5 w-5" />
                      <span>Payment Methods</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* QR Code Payment - Using the provided UPI QR image */}
                    <div className="bg-white p-6 rounded-xl">
                      <div className="text-center space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Scan QR Code to Pay
                        </h3>
                        
                        <div className="flex justify-center">
                          <img 
                            src="https://xdhtrwaghahigmbojotu.supabase.co/storage/v1/object/public/website%20stuff/Screenshot%20From%202025-08-29%2018-05-40.png"
                            alt="UPI Payment QR Code"
                            className="w-48 h-48 rounded-lg shadow-lg object-contain"
                          />
                        </div>
                        
                        <p className="text-sm text-gray-600">
                          Scan with any UPI app to pay ₹{planAmount}
                        </p>
                      </div>
                    </div>

                    {/* UPI Details */}
                    <div className="space-y-3">
                      <h4 className="text-white font-semibold">UPI Payment Details</h4>
                      
                      <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white/60 text-sm">UPI ID</p>
                            <p className="text-white font-mono">{upiId}</p>
                          </div>
                          <Button
                            onClick={() => copyToClipboard(upiId, 'UPI ID')}
                            variant="outline"
                            size="sm"
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            {copiedText === 'UPI ID' ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white/60 text-sm">Name</p>
                            <p className="text-white font-semibold">{recipientName}</p>
                          </div>
                          <Button
                            onClick={() => copyToClipboard(recipientName, 'Name')}
                            variant="outline"
                            size="sm"
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            {copiedText === 'Name' ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white/60 text-sm">Amount</p>
                            <p className="text-white font-bold text-xl">₹{planAmount}</p>
                          </div>
                          <Button
                            onClick={() => copyToClipboard(planAmount.toString(), 'Amount')}
                            variant="outline"
                            size="sm"
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            {copiedText === 'Amount' ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Quick Pay Buttons */}
                    <div className="space-y-3">
                      <h4 className="text-white font-semibold">Quick Pay</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { name: 'PhonePe', url: 'phonepe://pay', color: 'bg-purple-600' },
                          { name: 'Google Pay', url: 'tez://upi/pay', color: 'bg-blue-600' },
                          { name: 'Paytm', url: 'paytmmp://pay', color: 'bg-indigo-600' },
                          { name: 'Any UPI App', url: 'upi://pay', color: 'bg-green-600' }
                        ].map((app) => (
                          <Button
                            key={app.name}
                            onClick={() => openUpiApp(app.url)}
                            className={`${app.color} hover:opacity-80 text-white text-sm py-3`}
                          >
                            <Smartphone className="h-4 w-4 mr-2" />
                            {app.name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={() => setCurrentStep(2)}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3"
                    >
                      I've Made the Payment
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto"
              >
                <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Upload className="h-5 w-5" />
                      <span>Upload Payment Proof</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Alert className="bg-blue-500/20 border-blue-500/50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-white">
                        Please upload a clear screenshot of your payment confirmation. 
                        This helps us verify your payment quickly.
                      </AlertDescription>
                    </Alert>

                    <div className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center">
                      <Camera className="h-12 w-12 text-white/50 mx-auto mb-4" />
                      <h3 className="text-white text-lg font-semibold mb-2">
                        Upload Payment Screenshot
                      </h3>
                      <p className="text-white/70 mb-6">
                        Take a screenshot of your payment confirmation and upload it here
                      </p>
                      
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleProofUpload(file)
                        }}
                        className="hidden"
                        id="payment-proof"
                        disabled={submitting}
                      />
                      <label
                        htmlFor="payment-proof"
                        className={`inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer transition-colors ${
                          submitting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {submitting ? 'Uploading...' : 'Choose File'}
                      </label>
                    </div>

                    <div className="flex space-x-4">
                      <Button
                        onClick={() => setCurrentStep(1)}
                        variant="outline"
                        className="flex-1 border-white/20 text-white hover:bg-white/10"
                      >
                        Back
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto text-center"
              >
                <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                  <CardContent className="p-8">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">
                      Payment Submitted!
                    </h2>
                    <p className="text-white/70 mb-6">
                      Your payment proof has been uploaded successfully. 
                      We'll verify it within 24 hours and activate your account.
                    </p>
                    <Button
                      onClick={() => router.push('/dashboard')}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
                    >
                      Go to Dashboard
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Clock, 
  QrCode, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Shield,
  CreditCard,
  Smartphone,
  ArrowLeft,
  Wifi,
  Zap,
  Camera,
  Check
} from 'lucide-react'
import ImageUpload from './ImageUpload'
import QRCode from 'qrcode'

interface PaymentPageProps {
  subscriptionType?: 'basic' | 'premium'
  onPaymentProofUploaded?: () => void
}

export default function PaymentPage({ subscriptionType, onPaymentProofUploaded }: PaymentPageProps = {}) {
  const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 minutes in seconds
  const [planDetails, setPlanDetails] = useState<any>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [paymentProof, setPaymentProof] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [existingProof, setExistingProof] = useState<string | null>(null)
  const [userPaymentStatus, setUserPaymentStatus] = useState<any>(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = subscriptionType || searchParams.get('plan')

  // Updated UPI details
  const upiId = "eakempreet55-1@okhdfcbank"
  const recipientName = "Eakempreet Singh"
  const planAmount = plan === 'basic' ? 99 : plan === 'premium' ? 249 : 500
  const upiLink = "upi://pay?pa=eakempreet55-1@okhdfcbank&pn=Eakempreet%20Singh&aid=uGICAgODUm9LWVw"

  // Generate QR code
  useEffect(() => {
    const generateQR = async () => {
      try {
        const qrData = await QRCode.toDataURL(upiLink, {
          width: 280,
          margin: 2,
          color: {
            dark: '#1a1a1a',
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
  }, [plan, upiLink])

  useEffect(() => {
    if (!plan) {
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
    const upiUrl = "upi://pay?pa=eakempreet55-1@okhdfcbank&pn=Eakempreet%20Singh&aid=uGICAgODUm9LWVw"
    window.location.href = upiUrl
  }

  const checkExistingPayment = async () => {
    try {
      const response = await fetch('/api/user/check')
      const data = await response.json()
      
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
      // Use static plan details since we don't have subscriptions API
      const planData = {
        basic: { price: 99, name: 'Basic Plan' },
        premium: { price: 249, name: 'Premium Plan' }
      }
      
      setPlanDetails(planData[plan as keyof typeof planData] || { price: planAmount, name: `${plan?.toUpperCase()} Plan` })
    } catch (error) {
      console.error('Error fetching plan details:', error)
      setPlanDetails({ price: planAmount, name: `${plan?.toUpperCase()} Plan` })
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading payment details...</div>
      </div>
    )
  }

  // Show success screen after submission
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="bg-white border shadow-lg max-w-md mx-auto">
          <CardContent className="text-center p-8">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you! Your payment proof has been submitted successfully. 
              Our team will review it shortly and confirm your payment.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                You will receive confirmation within 24 hours. Redirecting to dashboard...
              </p>
            </div>
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Secure Payment</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-red-50 px-3 py-1 rounded-full">
              <Clock className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-600">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Left Column - Order Summary */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card className="bg-white border shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{plan} Plan</p>
                    <p className="text-sm text-gray-500">1 month subscription</p>
                  </div>
                  <p className="font-semibold text-gray-900">₹{planAmount}</p>
                </div>
                
                <div className="space-y-2 py-3 border-b">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">₹{planAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Processing Fee</span>
                    <span className="text-green-600">Free</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-3">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gray-900">₹{planAmount}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Payment Methods */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            {currentStep === 1 && (
              <Card className="bg-white border shadow-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                    <CreditCard className="h-5 w-5 mr-3 text-blue-600" />
                    Choose Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* UPI Payment - Featured */}
                  <div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <Smartphone className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">UPI Payment</h3>
                          <p className="text-sm text-gray-600">Instant payment via UPI apps</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-200">Recommended</Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* QR Code */}
                      <div className="bg-white rounded-lg p-4 md:p-6 border text-center">
                        <h4 className="font-medium text-gray-900 mb-4">Scan QR Code</h4>
                        <div className="w-40 h-40 sm:w-48 sm:h-48 mx-auto bg-white rounded-lg border-2 border-gray-200 flex items-center justify-center mb-4">
                          {qrCodeDataUrl ? (
                            <img 
                              src={qrCodeDataUrl} 
                              alt="UPI QR Code"
                              className="w-full h-full object-contain rounded-lg"
                            />
                          ) : (
                            <QrCode className="h-16 w-16 sm:h-20 sm:w-20 text-gray-400" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">Open any UPI app and scan this code</p>
                      </div>

                      {/* UPI Details */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Payment Details</h4>
                        
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">UPI ID</p>
                              <p className="font-mono text-gray-900">{upiId}</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(upiId, 'UPI ID')}
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              {copiedText === 'UPI ID' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Name</p>
                              <p className="font-medium text-gray-900">{recipientName}</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(recipientName, 'Name')}
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              {copiedText === 'Name' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t">
                            <div>
                              <p className="text-sm text-gray-600">Amount</p>
                              <p className="text-lg font-bold text-gray-900">₹{planAmount}</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(planAmount.toString(), 'Amount')}
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              {copiedText === 'Amount' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        {/* Quick Pay Buttons */}
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-gray-700">Quick Pay</p>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { name: 'PhonePe', url: 'phonepe://pay', color: 'bg-purple-600 hover:bg-purple-700' },
                              { name: 'Google Pay', url: 'tez://upi/pay', color: 'bg-blue-600 hover:bg-blue-700' },
                              { name: 'Paytm', url: 'paytmmp://pay', color: 'bg-indigo-600 hover:bg-indigo-700' },
                              { name: 'BHIM UPI', url: 'upi://pay', color: 'bg-green-600 hover:bg-green-700' }
                            ].map((app) => (
                              <Button
                                key={app.name}
                                onClick={() => openUpiApp(app.url)}
                                className={`${app.color} text-white`}
                              >
                                <Smartphone className="h-4 w-4 mr-2" />
                                {app.name}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t">
                      <Button 
                        onClick={() => setCurrentStep(2)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
                      >
                        I've completed the payment
                      </Button>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Your payment is secure</p>
                        <p className="text-xs text-gray-600 mt-1">
                          We use industry-standard encryption to protect your data. Your card details are never stored on our servers.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card className="bg-white border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                    <Upload className="h-5 w-5 mr-3 text-blue-600" />
                    Upload Payment Proof
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      Please upload a clear screenshot of your payment confirmation to verify your transaction quickly.
                    </AlertDescription>
                  </Alert>

                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 md:p-8 text-center hover:border-blue-400 transition-colors">
                    <Camera className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Screenshot</h3>
                    <p className="text-gray-600 mb-6 text-sm md:text-base">
                      Take a screenshot of your payment confirmation and upload it here
                    </p>
                    
                    <ImageUpload
                      onImageUploaded={(url) => setPaymentProof(url)}
                      currentImage={paymentProof || undefined}
                      className="w-full"
                    />
                  </div>

                  {paymentProof && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-900">Payment proof uploaded!</p>
                          <p className="text-sm text-green-700">Click submit to complete your order</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Payment
                    </Button>
                    <Button
                      onClick={submitPaymentProof}
                      disabled={!paymentProof || submitting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {submitting ? 'Submitting...' : 'Submit Payment Proof'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center space-x-2">
              <Wifi className="h-4 w-4" />
              <span>Secure Connection</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Instant Processing</span>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-3">
            Need help? Contact us at support@cufy.com or +91 9876543210
          </p>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import OnboardingStep from './OnboardingStep'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { Textarea } from './ui/textarea'
import { Card } from './ui/Card'
import { Heart, Camera, Sparkles } from 'lucide-react'
import ImageUpload from './ImageUpload'

interface OnboardingData {
  fullName: string
  phoneNumber: string
  age: string
  university: string
  yearOfStudy: string
  profilePhoto: string | null
  bio: string
  instagram: string
  energyStyle: string
  groupSetting: string
  idealWeekend: string[]
  communicationStyle: string
  bestTrait: string
  relationshipValues: string[]
  loveLanguage: string
  connectionStatement: string
  lookingFor: string
  story: string
}

export default function GirlsOnboarding() {
  const { data: session } = useSession()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    fullName: '',
    phoneNumber: '',
    age: '',
    university: '',
    yearOfStudy: '',
    profilePhoto: null,
    bio: '',
    instagram: '',
    energyStyle: '',
    groupSetting: '',
    idealWeekend: [],
    communicationStyle: '',
    bestTrait: '',
    relationshipValues: [],
    loveLanguage: '',
    connectionStatement: '',
    lookingFor: '',
    story: '',
  })

  const totalSteps = 16

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!session?.user?.email) {
      router.push('/')
      return
    }

    setIsSubmitting(true)
    
    try {
      const userData = {
        email: session.user.email,
        full_name: data.fullName,
        phone_number: data.phoneNumber,
        age: parseInt(data.age),
        university: data.university,
        year_of_study: data.yearOfStudy,
        profile_photo: data.profilePhoto,
        bio: data.bio,
        energy_style: data.energyStyle,
        group_setting: data.groupSetting,
        ideal_weekend: data.idealWeekend,
        communication_style: data.communicationStyle,
        best_trait: data.bestTrait,
        relationship_values: data.relationshipValues,
        love_language: data.loveLanguage,
        connection_statement: data.connectionStatement,
        gender: 'female' as const,
        // Include Instagram if provided
        ...(data.instagram && { instagram: data.instagram }),
      }

      const response = await fetch('/api/user/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        console.error('Failed to create user profile')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canGoNext = () => {
    switch (currentStep) {
      case 1: return data.fullName.trim() !== ''
      case 2: return data.phoneNumber.trim() !== '' && data.phoneNumber.length === 10
      case 3: return data.age !== ''
      case 4: return data.university.trim() !== ''
      case 5: return data.yearOfStudy !== ''
      case 6: return data.profilePhoto !== null
      case 7: return data.bio.trim() !== ''
      case 8: return data.instagram.trim() !== '' // Instagram is required
      case 9: return data.energyStyle !== ''
      case 10: return data.groupSetting !== ''
      case 11: return data.idealWeekend.length === 2
      case 12: return data.communicationStyle !== ''
      case 13: return data.bestTrait !== ''
      case 14: return data.relationshipValues.length === 3
      case 15: return data.loveLanguage !== ''
      case 16: return data.connectionStatement.trim() !== ''
      default: return true
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <OnboardingStep
            step={currentStep}
            totalSteps={totalSteps}
            title="What's your name?"
            onNext={() => setCurrentStep(2)}
            onBack={() => setCurrentStep(1)}
            canGoNext={canGoNext()}
            isFirst
            theme="pink"
          >
            <Input
              placeholder="Enter your full name"
              value={data.fullName}
              onChange={(e) => updateData('fullName', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && data.fullName.trim() !== '') {
                  e.preventDefault()
                  setCurrentStep(2)
                }
              }}
              className="text-center text-xl"
            />
          </OnboardingStep>
        )

      case 2:
        return (
          <OnboardingStep
            step={currentStep}
            totalSteps={totalSteps}
            title="Your phone number?"
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
            canGoNext={canGoNext()}
            theme="pink"
          >
            <Input
              type="tel"
              placeholder="9876543210 (10 digits)"
              value={data.phoneNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                updateData('phoneNumber', value)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && data.phoneNumber.length === 10) {
                  e.preventDefault()
                  setCurrentStep(3)
                }
              }}
              className="text-center text-xl"
            />
            <p className="text-sm text-white/60 mt-2">
              {data.phoneNumber.length}/10 digits
            </p>
          </OnboardingStep>
        )

      case 3:
        return (
          <OnboardingStep
            step={currentStep}
            totalSteps={totalSteps}
            title="How old are you?"
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
            canGoNext={canGoNext()}
            theme="pink"
          >
            <select
              className="w-full h-12 rounded-lg glass backdrop-blur-md px-4 py-2 text-white bg-transparent border border-white/20"
              value={data.age}
              onChange={(e) => updateData('age', e.target.value)}
            >
              <option value="" disabled>Select your age</option>
              {Array.from({ length: 8 }, (_, i) => i + 18).map(age => (
                <option key={age} value={age.toString()} className="bg-gray-800">
                  {age}
                </option>
              ))}
            </select>
          </OnboardingStep>
        )

      case 4:
        return (
          <OnboardingStep
            step={currentStep}
            totalSteps={totalSteps}
            title="Which university?"
            onNext={() => setCurrentStep(5)}
            onBack={() => setCurrentStep(3)}
            canGoNext={canGoNext()}
            theme="pink"
          >
            <Input
              placeholder="e.g., Delhi University"
              value={data.university}
              onChange={(e) => updateData('university', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && data.university.trim() !== '') {
                  e.preventDefault()
                  setCurrentStep(5)
                }
              }}
              className="text-center text-xl"
            />
          </OnboardingStep>
        )

      case 5:
        return (
          <OnboardingStep
            step={currentStep}
            totalSteps={totalSteps}
            title="Year of study?"
            onNext={() => setCurrentStep(6)}
            onBack={() => setCurrentStep(4)}
            canGoNext={canGoNext()}
            theme="pink"
          >
            <div className="grid grid-cols-2 gap-4">
              {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate'].map((year) => (
                <Card
                  key={year}
                  className={`p-4 cursor-pointer transition-all hover:scale-105 ${
                    data.yearOfStudy === year
                      ? 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 border-pink-500'
                      : 'hover:border-white/30'
                  }`}
                  onClick={() => updateData('yearOfStudy', year)}
                >
                  <p className="text-center font-medium">{year}</p>
                </Card>
              ))}
            </div>
          </OnboardingStep>
        )

      case 6:
        return (
          <OnboardingStep
            step={currentStep}
            totalSteps={totalSteps}
            title="Add your best photo"
            onNext={() => setCurrentStep(7)}
            onBack={() => setCurrentStep(5)}
            canGoNext={canGoNext()}
            theme="pink"
          >
            <div className="text-center">
              <ImageUpload
                onImageUploaded={(url) => updateData('profilePhoto', url)}
                currentImage={data.profilePhoto || undefined}
                className="mx-auto"
              />
              <p className="text-sm text-white/60 mt-4">
                Show your personality! This helps others get to know you.
              </p>
            </div>
          </OnboardingStep>
        )

      case 7:
        return (
          <OnboardingStep
            step={currentStep}
            totalSteps={totalSteps}
            title="Write a fun bio"
            onNext={() => setCurrentStep(8)}
            onBack={() => setCurrentStep(6)}
            canGoNext={canGoNext()}
            theme="pink"
          >
            <Textarea
              placeholder="Tell us something interesting about yourself in one line..."
              value={data.bio}
              onChange={(e) => updateData('bio', e.target.value)}
              className="glass backdrop-blur-md border border-white/20 min-h-[100px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && data.bio.trim() !== '') {
                  e.preventDefault()
                  setCurrentStep(8)
                }
              }}
            />
            <p className="text-sm text-white/60 mt-2">
              {data.bio.length}/200 characters
            </p>
          </OnboardingStep>
        )

      case 8:
        return (
          <OnboardingStep
            step={currentStep}
            totalSteps={totalSteps}
            title="Your Instagram username"
            onNext={() => setCurrentStep(9)}
            onBack={() => setCurrentStep(7)}
            canGoNext={canGoNext()}
            theme="pink"
          >
            <div className="space-y-4">
              <Input
                placeholder="@yourhandle (without @)"
                value={data.instagram}
                onChange={(e) => {
                  const value = e.target.value.replace('@', '')
                  updateData('instagram', value)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    setCurrentStep(9)
                  }
                }}
                className="text-center text-xl"
              />
              <p className="text-sm text-white/60 text-center">
                This helps matches connect with you easily!
              </p>
            </div>
          </OnboardingStep>
        )

      case 9:
        return (
          <OnboardingStep
            step={currentStep}
            totalSteps={totalSteps}
            title="Your energy style?"
            onNext={() => setCurrentStep(10)}
            onBack={() => setCurrentStep(8)}
            canGoNext={canGoNext()}
            theme="pink"
          >
            <div className="space-y-4">
              {[
                { value: 'high-energy', label: 'High Energy', desc: 'Always ready for adventure!' },
                { value: 'thoughtful', label: 'Thoughtful', desc: 'I prefer meaningful conversations' },
                { value: 'balanced', label: 'Balanced', desc: 'Mix of both depending on mood' }
              ].map((option) => (
                <Card
                  key={option.value}
                  className={`p-4 cursor-pointer transition-all hover:scale-105 ${
                    data.energyStyle === option.value
                      ? 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 border-pink-500'
                      : 'hover:border-white/30'
                  }`}
                  onClick={() => updateData('energyStyle', option.value)}
                >
                  <h3 className="font-semibold text-lg">{option.label}</h3>
                  <p className="text-sm text-white/70">{option.desc}</p>
                </Card>
              ))}
            </div>
          </OnboardingStep>
        )

      case 10:
        return (
          <OnboardingStep
            step={currentStep}
            totalSteps={totalSteps}
            title="In group settings, you typically:"
            onNext={() => setCurrentStep(11)}
            onBack={() => setCurrentStep(9)}
            canGoNext={canGoNext()}
            theme="pink"
          >
            <div className="space-y-4">
              {[
                'Lead conversations',
                'Listen and contribute thoughtfully', 
                'Prefer one-on-one connections'
              ].map((option) => (
                <Card
                  key={option}
                  className={`p-4 cursor-pointer transition-all hover:scale-105 ${
                    data.groupSetting === option
                      ? 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 border-pink-500'
                      : 'hover:border-white/30'
                  }`}
                  onClick={() => updateData('groupSetting', option)}
                >
                  <p className="text-center font-medium">{option}</p>
                </Card>
              ))}
            </div>
          </OnboardingStep>
        )

      case 11:
        return (
          <OnboardingStep
            step={currentStep}
            totalSteps={totalSteps}
            title="Your ideal weekend includes: (select top 2)"
            onNext={() => setCurrentStep(12)}
            onBack={() => setCurrentStep(10)}
            canGoNext={canGoNext()}
            theme="pink"
          >
            <div className="grid grid-cols-2 gap-4">
              {[
                'Adventure',
                'Learning',
                'Relaxing',
                'Socializing',
                'Creating',
                'Exercising'
              ].map((option) => (
                <Card
                  key={option}
                  className={`p-4 cursor-pointer transition-all hover:scale-105 ${
                    data.idealWeekend.includes(option)
                      ? 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 border-pink-500'
                      : 'hover:border-white/30'
                  }`}
                  onClick={() => {
                    const currentSelection = data.idealWeekend
                    if (currentSelection.includes(option)) {
                      updateData('idealWeekend', currentSelection.filter(item => item !== option))
                    } else if (currentSelection.length < 2) {
                      updateData('idealWeekend', [...currentSelection, option])
                    }
                  }}
                >
                  <p className="text-center font-medium">{option}</p>
                </Card>
              ))}
            </div>
            <p className="text-sm text-white/60 mt-4 text-center">
              Selected: {data.idealWeekend.length}/2
            </p>
          </OnboardingStep>
        )

      case 12:
        return (
          <OnboardingStep
            step={currentStep}
            totalSteps={totalSteps}
            title="You communicate through: (primary style)"
            onNext={() => setCurrentStep(13)}
            onBack={() => setCurrentStep(11)}
            canGoNext={canGoNext()}
            theme="pink"
          >
            <div className="space-y-4">
              {[
                'Words and deep talks',
                'Actions and gestures',
                'Shared experiences',
                'Humor and playfulness'
              ].map((option) => (
                <Card
                  key={option}
                  className={`p-4 cursor-pointer transition-all hover:scale-105 ${
                    data.communicationStyle === option
                      ? 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 border-pink-500'
                      : 'hover:border-white/30'
                  }`}
                  onClick={() => updateData('communicationStyle', option)}
                >
                  <p className="text-center font-medium">{option}</p>
                </Card>
              ))}
            </div>
          </OnboardingStep>
        )

      case 13:
        return (
          <OnboardingStep
            step={currentStep}
            totalSteps={totalSteps}
            title="Your friends would say your best trait is:"
            onNext={() => setCurrentStep(14)}
            onBack={() => setCurrentStep(12)}
            canGoNext={canGoNext()}
            theme="pink"
          >
            <div className="grid grid-cols-2 gap-4">
              {[
                'Loyalty',
                'Humor',
                'Intelligence',
                'Kindness',
                'Ambition',
                'Creativity',
                'Reliability'
              ].map((option) => (
                <Card
                  key={option}
                  className={`p-4 cursor-pointer transition-all hover:scale-105 ${
                    data.bestTrait === option
                      ? 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 border-pink-500'
                      : 'hover:border-white/30'
                  }`}
                  onClick={() => updateData('bestTrait', option)}
                >
                  <p className="text-center font-medium">{option}</p>
                </Card>
              ))}
            </div>
          </OnboardingStep>
        )

      case 14:
        return (
          <OnboardingStep
            step={currentStep}
            totalSteps={totalSteps}
            title="In relationships, you value most: (rank top 3)"
            onNext={() => setCurrentStep(15)}
            onBack={() => setCurrentStep(13)}
            canGoNext={canGoNext()}
            theme="pink"
          >
            <div className="space-y-4">
              {[
                'Growth together',
                'Fun & laughter',
                'Deep connection',
                'Shared goals',
                'Independence with closeness'
              ].map((option) => (
                <Card
                  key={option}
                  className={`p-4 cursor-pointer transition-all hover:scale-105 ${
                    data.relationshipValues.includes(option)
                      ? 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 border-pink-500'
                      : 'hover:border-white/30'
                  }`}
                  onClick={() => {
                    const currentSelection = data.relationshipValues
                    if (currentSelection.includes(option)) {
                      updateData('relationshipValues', currentSelection.filter(item => item !== option))
                    } else if (currentSelection.length < 3) {
                      updateData('relationshipValues', [...currentSelection, option])
                    }
                  }}
                >
                  <p className="text-center font-medium">{option}</p>
                  {data.relationshipValues.includes(option) && (
                    <p className="text-center text-sm text-pink-400 mt-1">
                      #{data.relationshipValues.indexOf(option) + 1}
                    </p>
                  )}
                </Card>
              ))}
            </div>
            <p className="text-sm text-white/60 mt-4 text-center">
              Selected: {data.relationshipValues.length}/3
            </p>
          </OnboardingStep>
        )

      case 15:
        return (
          <OnboardingStep
            step={currentStep}
            totalSteps={totalSteps}
            title="Your love language is: (select primary)"
            onNext={() => setCurrentStep(16)}
            onBack={() => setCurrentStep(14)}
            canGoNext={canGoNext()}
            theme="pink"
          >
            <div className="space-y-4">
              {[
                'Quality time',
                'Words of affirmation',
                'Physical touch',
                'Acts of service',
                'Gifts'
              ].map((option) => (
                <Card
                  key={option}
                  className={`p-4 cursor-pointer transition-all hover:scale-105 ${
                    data.loveLanguage === option
                      ? 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 border-pink-500'
                      : 'hover:border-white/30'
                  }`}
                  onClick={() => updateData('loveLanguage', option)}
                >
                  <p className="text-center font-medium">{option}</p>
                </Card>
              ))}
            </div>
          </OnboardingStep>
        )

      case 16:
        return (
          <OnboardingStep
            step={currentStep}
            totalSteps={totalSteps}
            title='Complete this: "I feel most connected to someone when..."'
            onNext={handleSubmit}
            onBack={() => setCurrentStep(15)}
            canGoNext={canGoNext()}
            isLast
            theme="pink"
          >
            <Textarea
              placeholder="I feel most connected to someone when..."
              value={data.connectionStatement}
              onChange={(e) => updateData('connectionStatement', e.target.value)}
              className="glass backdrop-blur-md border border-white/20 min-h-[120px]"
            />
            <p className="text-sm text-white/60 mt-2">
              {data.connectionStatement.length}/300 characters
            </p>
            <div className="text-center mt-8">
              <Heart className="h-16 w-16 text-pink-500 mx-auto mb-4 fill-current" />
              <h2 className="text-2xl font-bold mb-4">Welcome to Cufy!</h2>
              <p className="text-white/70">
                Your profile is complete. Get ready to meet amazing people!
              </p>
              {isSubmitting && (
                <p className="text-pink-400 mt-4">Saving your profile...</p>
              )}
            </div>
          </OnboardingStep>
        )
    }
  }

  return (
    <div className="bg-dark min-h-screen">
      {renderStep()}
    </div>
  )
}
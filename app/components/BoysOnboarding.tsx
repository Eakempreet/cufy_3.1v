'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import OnboardingStep from './OnboardingStep'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { Textarea } from './ui/textarea'
import { Card } from './ui/Card'
import { Sparkles, Camera, Crown } from 'lucide-react'

interface OnboardingData {
  fullName: string
  phoneNumber: string
  age: string
  university: string
  yearOfStudy: string
  profilePhoto: string | null
  bio: string
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

export default function BoysOnboarding() {
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<OnboardingData>({
    fullName: '',
    phoneNumber: '',
    age: '',
    university: '',
    yearOfStudy: '',
    profilePhoto: null,
    bio: '',
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

  const canGoNext = () => {
    switch (currentStep) {
      case 1: return data.fullName.trim() !== ''
      case 2: return data.phoneNumber.trim() !== ''
      case 3: return data.age !== ''
      case 4: return data.university.trim() !== ''
      case 5: return data.yearOfStudy !== ''
      case 6: return data.profilePhoto !== null
      case 7: return data.bio.trim() !== ''
      case 8: return data.energyStyle !== ''
      case 9: return data.groupSetting !== ''
      case 10: return data.idealWeekend.length > 0
      case 11: return data.communicationStyle !== ''
      case 12: return data.bestTrait !== ''
      case 13: return data.relationshipValues.length >= 3
      case 14: return data.loveLanguage !== ''
      case 15: return data.connectionStatement.trim() !== ''
      case 16: return data.lookingFor !== ''
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
            theme="purple"
          >
            <Input
              placeholder="Enter your full name"
              value={data.fullName}
              onChange={(e) => updateData('fullName', e.target.value)}
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
            theme="purple"
          >
            <Input
              type="tel"
              placeholder="+91 9876543210"
              value={data.phoneNumber}
              onChange={(e) => updateData('phoneNumber', e.target.value)}
              className="text-center text-xl"
            />
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
            theme="purple"
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
            theme="purple"
          >
            <Input
              placeholder="e.g., IIT Delhi"
              value={data.university}
              onChange={(e) => updateData('university', e.target.value)}
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
            theme="purple"
          >
            <div className="grid grid-cols-2 gap-4">
              {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate'].map((year) => (
                <Card
                  key={year}
                  className={`p-4 cursor-pointer transition-all hover:scale-105 ${
                    data.yearOfStudy === year
                      ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border-purple-500'
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
            theme="purple"
          >
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full border-2 border-dashed border-purple-500 flex items-center justify-center">
                <Camera className="h-12 w-12 text-purple-500" />
              </div>
              <Button 
                onClick={() => updateData('profilePhoto', 'uploaded')}
                className="bg-gradient-to-r from-purple-500 to-indigo-500"
              >
                <Camera className="mr-2 h-4 w-4" />
                Upload Photo
              </Button>
              <p className="text-sm text-white/60 mt-4">
                First impressions matter! Upload your best photo.
              </p>
            </div>
          </OnboardingStep>
        )

      default:
        return (
          <OnboardingStep
            step={16}
            totalSteps={totalSteps}
            title="Welcome aboard! 🚀"
            onNext={() => {}}
            onBack={() => setCurrentStep(15)}
            canGoNext={true}
            isLast
            theme="purple"
          >
            <div className="text-center">
              <Crown className="h-16 w-16 text-primary mx-auto mb-4 fill-current" />
              <h2 className="text-2xl font-bold mb-4">Ready to Connect!</h2>
              <p className="text-white/70">
                Your profile is set up. Time to find meaningful connections!
              </p>
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
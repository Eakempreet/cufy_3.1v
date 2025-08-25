'use client'

import { motion } from 'framer-motion'
import { Button } from './ui/Button'
import { Progress } from './ui/progress'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Card } from './ui/Card'

interface OnboardingStepProps {
  step: number
  totalSteps: number
  title: string
  children: React.ReactNode
  onNext: () => void
  onBack: () => void
  canGoNext: boolean
  isFirst?: boolean
  isLast?: boolean
  theme?: 'pink' | 'purple'
}

export default function OnboardingStep({
  step,
  totalSteps,
  title,
  children,
  onNext,
  onBack,
  canGoNext,
  isFirst,
  isLast,
  theme = 'purple'
}: OnboardingStepProps) {
  const progress = (step / totalSteps) * 100
  const themeColors = theme === 'pink' 
    ? 'from-pink-500 to-rose-500' 
    : 'from-purple-500 to-indigo-500'

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white/60">
              Step {step} of {totalSteps}
            </span>
            <span className="text-sm text-white/60">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full bg-gradient-to-r ${themeColors}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Main Card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-white mb-8 text-center font-poppins"
            >
              {title}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              {children}
            </motion.div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={onBack}
                disabled={isFirst}
                className="disabled:opacity-50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              <Button
                onClick={onNext}
                disabled={!canGoNext}
                className={`bg-gradient-to-r ${themeColors} disabled:opacity-50`}
              >
                {isLast ? 'Complete' : 'Next'}
                {!isLast && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
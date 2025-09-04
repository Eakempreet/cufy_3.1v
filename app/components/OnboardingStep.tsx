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
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-dark-subtle"></div>
      <div className="absolute inset-0 bg-cyber-grid opacity-5"></div>
      
      {/* Content Container */}
      <div className="w-full max-w-2xl relative z-10">
        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <motion.span 
              className="text-sm text-white/70 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Step {step} of {totalSteps}
            </motion.span>
            <motion.span 
              className="text-sm text-white/70 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {Math.round(progress)}% Complete
            </motion.span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-3 backdrop-blur-sm border border-white/10 shadow-lg">
            <motion.div
              className={`h-3 rounded-full bg-gradient-to-r ${themeColors} shadow-lg glow-effect`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Main Card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 100, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -100, scale: 0.95 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="glass-card-dark p-10 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-xl">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl font-bold text-white mb-10 text-center font-poppins bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent"
            >
              {title}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mb-10 space-y-6"
            >
              {children}
            </motion.div>

            {/* Navigation Buttons */}
            <motion.div 
              className="flex justify-between items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Button
                variant="ghost"
                onClick={onBack}
                disabled={isFirst}
                className="disabled:opacity-30 glass-button text-white/80 hover:text-white border border-white/20 hover:border-white/40 transition-all duration-300"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              <Button
                onClick={onNext}
                disabled={!canGoNext}
                className={`btn-primary-gradient ${themeColors} disabled:opacity-30 px-8 py-3 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300`}
              >
                {isLast ? 'Complete' : 'Next'}
                {!isLast && <ArrowRight className="ml-2 h-5 w-5" />}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
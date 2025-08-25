'use client'

import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="glass border-t border-white/10 backdrop-blur-md mt-20"
    >
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-primary fill-current" />
            <span className="text-lg font-bold font-poppins text-white">
              Cufy
            </span>
          </div>
          
          <div className="flex flex-wrap justify-center space-x-6 text-sm text-white/60">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
          
          <p className="text-center text-sm text-white/40">
            © 2024 Cufy. Matches are meant to meet.
          </p>
        </div>
      </div>
    </motion.footer>
  )
}
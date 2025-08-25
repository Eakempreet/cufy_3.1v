'use client'

import { motion } from 'framer-motion'
import { Button } from './ui/Button'
import { Heart } from 'lucide-react'
import Link from 'next/link'

export default function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 glass backdrop-blur-md border-b border-white/10"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-gradient fill-current" />
            <span className="text-2xl font-bold font-poppins text-gradient">
              Cufy
            </span>
          </Link>

          <Button variant="glass" className="hover:glow">
            Sign in with Google
          </Button>
        </div>
      </div>
    </motion.nav>
  )
}
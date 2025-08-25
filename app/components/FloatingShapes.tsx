'use client'

import { motion } from 'framer-motion'

export default function FloatingShapes() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Floating Shape 1 */}
      <motion.div
        className="absolute w-64 h-64 rounded-full gradient-primary opacity-20 blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -100, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          top: '20%',
          left: '10%',
        }}
      />

      {/* Floating Shape 2 */}
      <motion.div
        className="absolute w-48 h-48 rounded-full bg-secondary/30 blur-2xl"
        animate={{
          x: [0, -80, 0],
          y: [0, 120, 0],
          scale: [1.2, 1, 1.2],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        style={{
          top: '60%',
          right: '15%',
        }}
      />

      {/* Floating Shape 3 */}
      <motion.div
        className="absolute w-32 h-32 rounded-full gradient-premium opacity-30 blur-xl"
        animate={{
          x: [0, 60, 0],
          y: [0, -60, 0],
          rotate: [0, 360],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
        style={{
          bottom: '20%',
          left: '20%',
        }}
      />

      {/* Additional smaller shapes */}
      <motion.div
        className="absolute w-20 h-20 rounded-full bg-primary/20 blur-lg"
        animate={{
          y: [0, -30, 0],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          top: '80%',
          right: '30%',
        }}
      />

      <motion.div
        className="absolute w-24 h-24 rounded-full bg-secondary/25 blur-xl"
        animate={{
          x: [0, 40, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
        style={{
          top: '40%',
          left: '70%',
        }}
      />
    </div>
  )
}
'use client'

import { motion } from 'framer-motion'
import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function FadeIn({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}

export function ScaleIn({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}

export function HeroSection({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className={cn('text-center py-16', className)}
    >
      {children}
    </motion.section>
  )
}

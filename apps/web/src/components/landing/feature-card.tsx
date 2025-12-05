'use client'

import type { LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'

interface FeatureCardProps {
  title: string
  description: string
  icon: LucideIcon
  isReversed?: boolean
  index: number
}

export default function FeatureCard({
  title,
  description,
  icon: Icon,
  isReversed = false,
  index
}: FeatureCardProps) {
  return (
    <motion.div
      className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12"
      initial={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true, margin: '-100px' }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {/* Icon Section */}
      <div
        className={`flex items-center justify-center ${isReversed ? 'md:order-2' : 'md:order-1'}`}
      >
        <div className="flex size-24 items-center justify-center rounded-2xl bg-primary/10 text-primary md:size-32 dark:bg-primary/20">
          <Icon className="size-12 md:size-16" />
        </div>
      </div>

      {/* Content Section */}
      <div
        className={`space-y-4 text-center md:text-left ${isReversed ? 'md:order-1' : 'md:order-2'}`}
      >
        <h3 className="font-semibold text-2xl text-neutral-900 md:text-3xl dark:text-neutral-100">
          {title}
        </h3>
        <p className="text-base text-neutral-600 md:text-lg dark:text-neutral-400">
          {description}
        </p>
      </div>
    </motion.div>
  )
}

'use client'

import { WithLoveFooter } from '@rov/ui/components/blocks/with-love-footer'
import { AuroraBackground } from '@rov/ui/components/ui/aurora-background'
import { RainbowButton } from '@rov/ui/components/ui/rainbow-button'
import { motion } from 'motion/react'

export default function AuroraBackgroundDemo() {
  return (
    <AuroraBackground>
      <motion.div
        className="relative flex flex-col items-center justify-center gap-4 px-4"
        initial={{ opacity: 0.0, y: 40 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: 'easeInOut'
        }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <div className="text-center font-bold text-3xl md:text-7xl dark:text-white">
          👋 Bro, I'm Rovierr
        </div>
        <div className="max-w-2xl py-4 text-center font-extralight text-base md:text-4xl dark:text-neutral-200">
          Rovierr unifies essential tools into a single platform—designed for
          students, driven by simplicity, and built to scale with you.
        </div>
        <RainbowButton className="rounded-full">Get Started</RainbowButton>
      </motion.div>
      <WithLoveFooter className="mt-40" />
    </AuroraBackground>
  )
}

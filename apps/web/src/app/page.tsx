'use client'

import { AuroraBackground } from '@rov/ui/components/aurora-background'
import { PlaceholdersAndVanishInput } from '@rov/ui/components/placeholder-vanish-input'
import { RainbowButton } from '@rov/ui/components/rainbow-button'
import { SparklesText } from '@rov/ui/components/text-animations/sparkles'
import { AnimatedThemeToggler } from '@rov/ui/components/theme-toggle'
import { motion } from 'motion/react'
import Link from 'next/link'

export default function RovierrLandingPage() {
  return (
    <div>
      <AuroraBackground />
      <div className="mx-auto max-w-6xl">
        <div className="sticky top-0 z-50 flex w-full items-center justify-between border-b bg-background/10 px-4 py-2 shadow-md dark:border-neutral-700 dark:bg-neutral-900/10">
          <SparklesText className="text-4xl" sparklesCount={3}>
            Rovierr
          </SparklesText>

          <div className="flex items-center gap-2">
            <AnimatedThemeToggler />
            <Link href="/login">
              <RainbowButton className="rounded-full">
                Get Started
              </RainbowButton>
            </Link>
          </div>
        </div>
        <motion.div
          className="relative mt-32 flex flex-col items-center justify-center gap-4 px-4"
          initial={{ opacity: 0.0, y: 40 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: 'easeInOut'
          }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className="text-center font-bold text-3xl md:text-6xl dark:text-white">
            Global Student Ecosystem
          </div>
          <div className="max-w-2xl py-4 text-center font-extralight text-base md:text-4xl dark:text-neutral-200">
            Rovierr unifies essential tools into a single platform—designed for
            students, driven by simplicity, and built to scale with you.
          </div>

          <div className="mt-20 flex items-center gap-2">
            <p className="text-muted-foreground">Search</p>

            <PlaceholdersAndVanishInput
              onChange={() => {
                // todo
              }}
              onSubmit={() => {
                // todo
              }}
              placeholders={[
                'kahoot games and quizzes',
                'Create a form for survey',
                'Quickly create realtime quiz',
                'Plan your next project',
                'Manage your expenses',
                'EventBrite: Send Out event registration form'
              ]}
            />
          </div>
        </motion.div>
        {/* <WithLoveFooter className="mt-40" /> */}
      </div>
    </div>
  )
}

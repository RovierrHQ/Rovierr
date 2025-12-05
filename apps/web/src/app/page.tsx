'use client'

import { AuroraBackground } from '@rov/ui/components/aurora-background'
import { Button } from '@rov/ui/components/button'
import { AnimatedShinyText } from '@rov/ui/components/text-animations/animated-shiny'
import { cn } from '@rov/ui/lib/utils'
import { ArrowRightIcon } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'
import FeaturesSection from '@/components/landing/features-section'
import Footer from '@/components/layout/footer'
import Topnav from '@/components/layout/top-nav'

export default function RovierrLandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AuroraBackground />
      <Topnav />
      <div className="container mx-auto flex-1">
        <motion.div
          className="relative mt-32 flex flex-col items-center justify-center gap-4 px-4 pb-20"
          initial={{ opacity: 0.0, y: 40 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: 'easeInOut'
          }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div
            className={cn(
              'group rounded-full border border-black/5 bg-neutral-50 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-800 dark:hover:bg-neutral-700'
            )}
          >
            <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
              <span>✨ Introducing Campus Societies</span>
              <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
            </AnimatedShinyText>
          </div>
          <div className="text-center font-bold text-3xl text-primary md:text-6xl">
            Global Student Ecosystem
          </div>
          <div className="max-w-2xl py-4 text-center font-extralight text-base md:text-4xl">
            Rovierr unifies essential tools into a single platform—designed for
            students, driven by simplicity, and built to scale with you.
          </div>

          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            transition={{
              delay: 0.5,
              duration: 0.6,
              ease: 'easeInOut'
            }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <Link href="/login">
              <Button
                className="transition-transform hover:scale-105"
                size="lg"
              >
                Get Started
                <ArrowRightIcon className="ml-2 size-4" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
      <FeaturesSection />
      <Footer />
    </div>
  )
}

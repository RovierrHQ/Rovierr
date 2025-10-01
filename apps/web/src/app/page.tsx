'use client'

import { AuroraBackground } from '@rov/ui/components/aurora-background'
import { PlaceholdersAndVanishInput } from '@rov/ui/components/placeholder-vanish-input'
import { AnimatedShinyText } from '@rov/ui/components/text-animations/animated-shiny'
import { cn } from '@rov/ui/lib/utils'
import { ArrowRightIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { redirect } from 'next/navigation'
import InstallPrompt from '@/components/install-prompt'
import ToolList from '@/components/tool-list'
import Topnav from '@/components/top-nav'
import { authClient } from '@/lib/auth-client'

export default function RovierrLandingPage() {
  const { data: session } = authClient.useSession()
  if (session) {
    return redirect('/dashboard')
  }
  return (
    <div>
      <AuroraBackground />
      <Topnav />
      <div className="container mx-auto">
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
          <div
            className={cn(
              'group rounded-full border border-black/5 bg-neutral-50 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-800 dark:hover:bg-neutral-700'
            )}
          >
            <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
              <span>✨ Introducing Quera</span>
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

          <InstallPrompt />
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
        <ToolList />
      </div>
    </div>
  )
}

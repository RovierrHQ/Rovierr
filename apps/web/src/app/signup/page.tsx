'use client'

import SignupForm from '@rov/ui/blocks/signup-form'
import AnimatedGridPattern from '@rov/ui/components/backgrounds/AnimatedGridPattern'
import { cn } from '@rov/ui/lib/utils'
import { toast } from 'sonner'
import Topnav from '@/components/layout/top-nav'
import { authClient } from '@/lib/auth-client'

export default function SignupPage() {
  const handleEmailSignup = async (
    name: string,
    email: string,
    password: string
  ) => {
    try {
      const result = await authClient.signUp.email({
        name,
        email,
        password
      })

      if (result.error) {
        toast.error(result.error.message || 'Failed to create account')
      } else {
        toast.success('Account created successfully!')
        // Redirect to profile page after successful signup
        window.location.href = '/profile'
      }
    } catch (_error) {
      toast.error('An error occurred during sign up')
    }
  }

  return (
    <div className="relative isolate h-svh overflow-hidden bg-muted">
      <Topnav loginButton={false} />
      <div className="flex h-full items-center justify-center border">
        <SignupForm
          handleEmailSignup={handleEmailSignup}
          handleGoogleSignup={() =>
            authClient.signIn.social({
              provider: 'google',
              callbackURL: `${window.origin}/profile`
            })
          }
        />
      </div>
      <AnimatedGridPattern
        className={cn(
          '[mask-image:radial-gradient(1500px_circle_at_center,white,transparent)]',
          '-z-1 inset-x-0 inset-y-[-30%] h-[200%] skew-y-12'
        )}
        duration={3}
        maxOpacity={0.1}
        numSquares={30}
        repeatDelay={1}
      />
    </div>
  )
}

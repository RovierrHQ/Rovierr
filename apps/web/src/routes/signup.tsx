// UI Components

import { cn } from '@rov/ui/lib/utils'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import SignupForm from '@web/components/auth/signup-form'
import AnimatedGridPattern from '@web/components/backgrounds/AnimatedGridPattern'
import Topnav from '@web/components/layout/top-nav'
import { authClient } from '@web/lib/auth-client'
import { toast } from 'sonner'

//
export const Route = createFileRoute('/signup')({
  component: SignupPage
})

function SignupPage() {
  const router = useRouter()

  const handleEmailSignup = async (
    name: string,
    email: string,
    password: string
  ) => {
    const loadingToast = toast.loading('Creating account...')

    try {
      const result = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: '/profile'
      })

      if (result.error) {
        toast.dismiss(loadingToast)
        toast.error(result.error.message || 'Failed to create account')
      } else {
        toast.dismiss(loadingToast)
        toast.success('Account created successfully!')
        router.navigate({ to: '/profile' })
      }
    } catch (_error) {
      toast.dismiss(loadingToast)
      toast.error('An error occurred during sign up')
    }
  }

  const handleGoogleSignup = async () => {
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: `${window.location.origin}/profile`
      })
    } catch (error) {
      toast.error('Failed to start Google signup')
    }
  }

  return (
    <div className="relative isolate h-svh overflow-hidden bg-muted">
      <Topnav loginButton={false} />
      <div className="flex h-full items-center justify-center border">
        <SignupForm
          handleEmailSignup={handleEmailSignup}
          handleGoogleSignup={handleGoogleSignup}
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

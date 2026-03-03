'use client'

import LoginForm from '@rov/ui/blocks/login-form'
import AnimatedGridPattern from '@rov/ui/components/backgrounds/AnimatedGridPattern'
import { cn } from '@rov/ui/lib/utils'
import Topnav from '@web/components/layout/top-nav'
import { authClient } from '@web/lib/auth-client'
import { redirect } from 'next/navigation'
import { toast } from 'sonner'

export default function LoginPage() {
  const { data: session } = authClient.useSession()

  if (session) {
    redirect('/spaces/societies')
  }

  const handleEmailLogin = async (email: string, password: string) => {
    try {
      const result = await authClient.signIn.email({
        email,
        password,
        callbackURL: `${window.origin}/spaces/societies`
      })

      if (result.error) {
        toast.error(result.error.message || 'Failed to sign in')
      }
    } catch (error) {
      toast.error('An error occurred during sign in')
      console.error('Login error:', error)
    }
  }

  return (
    <div className="relative isolate h-svh overflow-hidden bg-muted">
      <Topnav loginButton={false} />
      <div className="flex h-full items-center justify-center border">
        <LoginForm
          handleEmailLogin={handleEmailLogin}
          handleGoogleLogin={() =>
            authClient.signIn.social({
              provider: 'google',
              callbackURL: `${window.origin}/spaces/societies`
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

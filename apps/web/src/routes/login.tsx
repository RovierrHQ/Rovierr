import AnimatedGridPattern from '@rov/ui/components/backgrounds/AnimatedGridPattern'
import { cn } from '@rov/ui/lib/utils'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import LoginForm from '@web/components/auth/login-form'
import Topnav from '@web/components/layout/top-nav'
import { authClient } from '@web/lib/auth-client'
import { useEffect } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/login')({
  component: LoginPage
})

function LoginPage() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    if (!isPending && session) {
      router.navigate({ to: '/spaces/societies' })
    }
  }, [session, isPending, router])

  const handleEmailLogin = async (email: string, password: string) => {
    const loadingToast = toast.loading('Signing in...')

    try {
      const result = await authClient.signIn.email({
        email,
        password,

        callbackURL: `${window.location.origin}/spaces/societies`
      })

      if (result.error) {
        toast.dismiss(loadingToast)
        toast.error(result.error.message || 'Failed to sign in')
        return
      }

      toast.dismiss(loadingToast)
      toast.success('Login successful')
      router.navigate({ to: '/spaces/societies' })
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error('An error occurred during sign in')
      console.error('Login error:', error)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: `${window.location.origin}/spaces/societies`
      })
    } catch {
      toast.error('Failed to start Google login')
    }
  }

  return (
    <div className="relative isolate h-svh overflow-hidden bg-muted">
      <Topnav loginButton={false} />
      <div className="flex h-[calc(100svh-80px)] items-center justify-center px-4">
        <LoginForm
          handleEmailLogin={handleEmailLogin}
          handleGoogleLogin={handleGoogleLogin}
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

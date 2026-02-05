import { Button } from '@rov/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'
import { createFileRoute, useRouter, useSearch } from '@tanstack/react-router'
import { authClient } from '@web/lib/auth-client'
import { extractRedirectURL } from '@web/lib/util'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/login')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: (search.redirect as string) || '/'
    }
  }
})

function RouteComponent() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { redirect } = useSearch({ from: '/login' })
  const { data: session } = authClient.useSession()
  const isAuthenticated = !!session?.user

  useEffect(() => {
    if (isAuthenticated) {
      router.navigate({ to: redirect || '/' })
    }
  }, [isAuthenticated, redirect, router])

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      const callbackURL = extractRedirectURL(redirect)
      const { error } = await authClient.signIn.social({
        provider: 'google',
        callbackURL
      })
      if (error) throw new Error(error.message)
      // signIn.social redirects to Google; no need to navigate
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      console.error('[Login] Error:', err)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
          <CardDescription>
            Sign in with your Google account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full"
            disabled={isLoading}
            onClick={handleGoogleSignIn}
            size="lg"
            type="button"
            variant="outline"
          >
            {isLoading ? 'Please wait…' : 'Sign in with Google'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

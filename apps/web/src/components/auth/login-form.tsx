'use client'

import { Button } from '@rov/ui/components/button'
import { Card, CardContent } from '@rov/ui/components/card'
import { Input } from '@rov/ui/components/input'
import { Label } from '@rov/ui/components/label'
import { cn } from '@rov/ui/lib/utils'
import { useState } from 'react'

export default function LoginForm({
  className,
  handleGoogleLogin,
  handleEmailLogin,
  ...props
}: React.ComponentProps<'div'> & {
  handleGoogleLogin: () => void
  handleEmailLogin: (email: string, password: string) => Promise<void>
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await handleEmailLogin(email, password)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className={cn('w-full max-w-lg flex flex-col gap-6', className)}
      {...props}
    >
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={onSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex h-24 items-center justify-center">
                <div
                  aria-label="logo"
                  className="bg-center bg-no-repeat bg-contain"
                  role="img"
                  style={{
                    backgroundImage:
                      "url('/rovierr-logo-3dgradient-initial.png')",
                    width: 64,
                    height: 64
                  }}
                />
              </div>
              <div className="flex flex-col items-center text-center">
                <h1 className="font-bold text-2xl">Welcome back</h1>
                <p className="text-balance text-muted-foreground">
                  Login to your Rovierr account
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    disabled={isLoading}
                    id="email"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    type="email"
                    value={email}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    disabled={isLoading}
                    id="password"
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    type="password"
                    value={password}
                  />
                </div>
                <Button className="w-full" disabled={isLoading} type="submit">
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  disabled={isLoading}
                  onClick={handleGoogleLogin}
                  type="button"
                  variant="outline"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>Google logo</title>
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span>Login with Google</span>
                </Button>
              </div>

              <div className="text-center text-sm">
                Don&apos;t have an account?{' '}
                <a
                  className="font-medium underline underline-offset-4 hover:text-primary"
                  href="/signup"
                >
                  Sign up
                </a>
              </div>
            </div>
          </form>
          <div className="relative hidden bg-muted/80 md:block">
            <div
              aria-label="logo background"
              className="absolute inset-0 object-cover grayscale dark:brightness-[0.2] bg-center bg-no-repeat bg-cover"
              role="img"
              style={{
                backgroundImage: "url('/placeholder.svg')",
                width: '100%',
                height: '100%',
                minHeight: 200 // Ensures layout stability
              }}
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-muted-foreground text-xs *:[a]:underline *:[a]:underline-offset-4 *:[a]:hover:text-primary">
        By clicking continue, you agree to our{' '}
        <a href="/terms-and-service">Terms of Service</a> and{' '}
        <a href="/privacy-policy">Privacy Policy</a>.
      </div>
    </div>
  )
}

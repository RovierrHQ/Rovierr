'use client'

import { Button } from '@rov/ui/components/button'
import { Card, CardContent } from '@rov/ui/components/card'
import { Input } from '@rov/ui/components/input'
import { Label } from '@rov/ui/components/label'
import { cn } from '@rov/ui/lib/utils'
import { useState } from 'react'

export default function SignupForm({
  className,
  handleGoogleSignup,
  handleEmailSignup,
  ...props
}: React.ComponentProps<'div'> & {
  handleGoogleSignup: () => void
  handleEmailSignup: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)
    try {
      await handleEmailSignup(name, email, password)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={onSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex h-24 items-center justify-center">
                <img
                  alt="logo"
                  className="size-16"
                  src="/rovierr-logo-3dgradient-initial.png"
                />
              </div>
              <div className="flex flex-col items-center text-center">
                <h1 className="font-bold text-2xl">Create an account</h1>
                <p className="text-balance text-muted-foreground">
                  Join Rovierr and connect with students
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    disabled={isLoading}
                    id="name"
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    type="text"
                    value={name}
                  />
                </div>
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
                    placeholder="At least 8 characters"
                    required
                    type="password"
                    value={password}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    disabled={isLoading}
                    id="confirmPassword"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    required
                    type="password"
                    value={confirmPassword}
                  />
                </div>

                {error && (
                  <p className="font-medium text-destructive text-sm">
                    {error}
                  </p>
                )}

                <Button className="w-full" disabled={isLoading} type="submit">
                  {isLoading ? 'Creating account...' : 'Create account'}
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
                  onClick={handleGoogleSignup}
                  type="button"
                  variant="outline"
                >
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="">Sign up with Google</span>
                </Button>
              </div>

              <div className="text-center text-sm">
                Already have an account?{' '}
                <a
                  className="font-medium underline underline-offset-4 hover:text-primary"
                  href="/login"
                >
                  Sign in
                </a>
              </div>
            </div>
          </form>
          <div className="relative hidden bg-muted/80 md:block">
            <img
              alt="logo"
              className="absolute inset-0 h-full w-full object-cover grayscale dark:brightness-[0.2]"
              src="/placeholder.svg"
              srcSet="/rovierr-logo-3dgradient-initial.png"
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

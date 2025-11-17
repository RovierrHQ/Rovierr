'use client'

import { Card, CardContent } from '@rov/ui/components/card'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import EmailVerificationFlow from '@/components/verify/email-verification-flow'
import { orpc } from '@/utils/orpc'

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from')
  const displayName = searchParams.get('name')
  const welcomeHeading = displayName ? `Welcome ${displayName}` : 'Welcome'

  const { data, isLoading } = useQuery(
    orpc.user.onboarding.getStatus.queryOptions({ refetchOnMount: 'always' })
  )

  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    if (!data?.isVerified) return

    if (from === 'profile') {
      setShowWelcome(true)
      const timer = setTimeout(() => {
        router.push('/spaces')
      }, 3000)

      return () => clearTimeout(timer)
    }

    router.push('/profile/complete')
  }, [data?.isVerified, from, router])

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (showWelcome) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center px-4">
        <Card className="w-full max-w-sm shadow-md">
          <CardContent className="flex flex-col gap-2 py-8 text-center">
            <p className="text-muted-foreground">Account Created 🎉</p>
            <h1 className="font-semibold text-2xl">{welcomeHeading}</h1>
            <p className="font-semibold text-muted-foreground">
              Redirecting you to your Club Societies...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <EmailVerificationFlow />
}

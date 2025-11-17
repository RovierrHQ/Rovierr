'use client'

import { Card, CardContent } from '@rov/ui/components/card'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import GetVerificationOTP from '@/components/verify/get-verification-otp'
import OtpVerification from '@/components/verify/otp-verification'
import { orpc } from '@/utils/orpc'

export default function VerifyPage() {
  const router = useRouter()

  const { data, isLoading, refetch } = useQuery(
    orpc.user.onboarding.getStatus.queryOptions({ refetchOnMount: 'always' })
  )

  const [step, setStep] = useState<'get-email' | 'otp'>('get-email')
  const [userEmail, setUserEmail] = useState('')
  const [showWelcome, setShowWelcome] = useState(false)

  const { mutateAsync } = useMutation(
    orpc.user.onboarding.verifyEmail.mutationOptions()
  )

  useEffect(() => {
    if (data && !data.hasUniversityEmail) {
      router.push('/profile/complete')
    }
  }, [data, router])

  useEffect(() => {
    if (data?.hasUniversityEmail && userEmail) setStep('otp')
    else setStep('get-email')
  }, [data?.hasUniversityEmail, userEmail])

  useEffect(() => {
    if (data?.isVerified) {
      setShowWelcome(true)
      const timer = setTimeout(() => {
        router.push('/spaces')
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [data?.isVerified, router])

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
          <CardContent className="py-8 text-center">
            <h2 className="font-semibold text-xl">🎉 Profile Completed!</h2>
            <p className="mt-2 text-muted-foreground">
              Redirecting you to your spaces...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center px-4">
      <div className="w-full max-w-md">
        {step === 'get-email' && (
          <GetVerificationOTP
            onSuccess={(email) => {
              setUserEmail(email)
              toast(`A verification code was sent to ${email}`)
            }}
          />
        )}

        {step === 'otp' && (
          <OtpVerification
            email={userEmail}
            onResend={() => {
              toast(`A verification code was sent to ${userEmail}`)
            }}
            onVerify={async (code) => {
              try {
                await mutateAsync({ otp: code })
                toast.success('Email verified successfully!')
                refetch()
              } catch {
                toast.error('Invalid OTP. Please try again.')
              }
            }}
          />
        )}
      </div>
    </div>
  )
}

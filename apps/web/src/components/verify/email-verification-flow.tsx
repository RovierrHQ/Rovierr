'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { orpc } from '@/utils/orpc'
import GetVerificationOTP from './get-verification-otp'
import OtpVerification from './otp-verification'

export default function EmailVerificationFlow() {
  const [step, setStep] = useState<'get-email' | 'otp'>('get-email')
  const [userEmail, setUserEmail] = useState('')

  const { data, isLoading, refetch } = useQuery(
    orpc.user.onboarding.getStatus.queryOptions()
  )

  const { mutateAsync } = useMutation(
    orpc.user.onboarding.verifyEmail.mutationOptions()
  )

  useEffect(() => {
    if (data?.hasUniversityEmail && userEmail) return setStep('otp')

    return setStep('get-email')
  }, [data?.hasUniversityEmail, userEmail])

  if (isLoading)
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )

  if (data?.isVerified) return null

  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center px-4">
      <div className="w-full max-w-md">
        {step === 'get-email' && (
          <GetVerificationOTP
            onSuccess={(email) => {
              setUserEmail(email)
              setStep('otp')
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

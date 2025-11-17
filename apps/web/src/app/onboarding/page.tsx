'use client'

import { onboardingSubmitInput } from '@rov/orpc-contracts/user/onboarding'
import { Button } from '@rov/ui/components/button'
import { useAppForm } from '@rov/ui/components/form/index'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot
} from '@rov/ui/components/input-otp'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type z from 'zod'
import { client, orpc } from '@/utils/orpc'

export default function OnboardingPage() {
  const router = useRouter()
  const [showOTPInput, setShowOTPInput] = useState(false)
  const [otp, setOtp] = useState('')
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const { mutateAsync: handleVerifyOTP, isPending: isVerifying } = useMutation(
    orpc.user.onboarding.verifyEmail.mutationOptions({
      onSuccess: () => router.push('/spaces')
    })
  )

  const { mutateAsync: handleResendOTP, isPending: isResending } = useMutation(
    orpc.user.onboarding.resendVerification.mutationOptions()
  )

  // Cooldown timer effect
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds(cooldownSeconds - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldownSeconds])

  const startCooldown = () => {
    setCooldownSeconds(60)
  }

  const form = useAppForm({
    validators: { onSubmit: onboardingSubmitInput },
    defaultValues: {
      displayName: '',
      profileImageUrl: null,
      major: '',
      yearOfStudy: '1',
      interests: []
    } as z.infer<typeof onboardingSubmitInput>,
    onSubmit: async ({ value }) => {
      try {
        await client.user.onboarding.submit(value)

        toast.success('Verification code sent to your email!')
        setShowOTPInput(true)
        startCooldown()
        localStorage.setItem('profile_completed', 'true')
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to submit onboarding'
        toast.error(errorMessage)
      }
    }
  })

  // Check if user already completed profile
  useEffect(() => {
    const profileCompleted = localStorage.getItem('profile_completed')
    if (profileCompleted === 'true') {
      // Check verification status
      router.replace('/spaces')
    }
  }, [router])

  if (showOTPInput) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 font-bold text-3xl text-gray-900">
              Verify Your Email
            </h1>
            <p className="text-gray-600">
              We sent a 6-digit code to your university email
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label
                className="mb-2 block font-medium text-gray-700 text-sm"
                htmlFor="otp"
              >
                Verification Code
              </label>
              <InputOTP
                id="otp"
                maxLength={6}
                onChange={(v) => setOtp(v)}
                value={otp}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <button
              className="w-full rounded-lg bg-purple-600 px-4 py-3 font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isVerifying || otp.length !== 6}
              onClick={() => handleVerifyOTP({ otp })}
              type="button"
            >
              {isVerifying ? 'Verifying...' : 'Verify Email'}
            </button>

            <button
              className="w-full rounded-lg px-4 py-2 font-medium text-purple-600 transition-colors hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isResending || cooldownSeconds > 0}
              onClick={async () => {
                await handleResendOTP({})
                toast.success('Verification code resent!')
                startCooldown()
              }}
              type="button"
            >
              {(() => {
                if (cooldownSeconds > 0)
                  return `Resend Code (${cooldownSeconds}s)`
                if (isResending) return 'Sending...'
                return 'Resend Code'
              })()}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const isSubmitting = form.state.isSubmitting

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8">
          <h1 className="mb-2 font-bold text-3xl text-gray-900">
            Welcome to Rovierr! 🎓
          </h1>
          <p className="text-gray-600">
            Let's set up your student profile to get started
          </p>
        </div>

        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          {/* Display Name */}
          <form.AppField
            children={(field) => (
              <field.Text label="Displayname" placeholder="" />
            )}
            name="displayName"
          />

          {/* Profile Image URL */}
          {/* <div>
            <label
              className="mb-2 block font-medium text-gray-700 text-sm"
              htmlFor="profileImageUrl"
            >
              Profile Image URL (optional)
            </label>
            <input
              id="profileImageUrl"
              type="url"
              {...register('profileImageUrl')}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
              placeholder="https://example.com/image.jpg"
            />
            {errors.profileImageUrl && (
              <p className="mt-1 text-red-600 text-sm">
                {errors.profileImageUrl.message}
              </p>
            )}
          </div> */}

          {/* Major */}

          <form.AppField
            children={(field) => (
              <field.Text label="Major" placeholder="Computer Science" />
            )}
            name="major"
          />

          {/* Year of Study */}

          <form.AppField
            children={(field) => (
              <field.Select
                label="Year of Study"
                options={[
                  { label: '1st Year', value: '1' },
                  { label: '2nd Year', value: '2' },
                  { label: '3rd Year', value: '3' },
                  { label: '4th Year', value: '4' },
                  { label: 'Graduate', value: 'graduate' },
                  { label: 'PhD', value: 'phd' }
                ]}
                placeholder="Select your year"
              />
            )}
            name="yearOfStudy"
          />

          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Submitting...' : 'Continue'}
          </Button>
        </form>
      </div>
    </div>
  )
}

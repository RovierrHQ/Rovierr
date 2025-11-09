'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { client } from '@/utils/orpc'

interface VerificationPendingProps {
  onVerified?: () => void
  dismissible?: boolean
  onDismiss?: () => void
}

export function VerificationPending({
  onVerified,
  dismissible = false,
  onDismiss
}: VerificationPendingProps) {
  const [otp, setOtp] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit code')
      return
    }

    setIsVerifying(true)

    try {
      await client.user.onboarding.verifyEmail({ otp })
      toast.success('Email verified successfully!')
      onVerified?.()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Invalid or expired code'
      toast.error(errorMessage)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendOTP = async () => {
    setIsResending(true)

    try {
      await client.user.onboarding.resendVerification({})
      toast.success('New verification code sent!')
      setOtp('')
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to resend code'
      toast.error(errorMessage)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="relative rounded-lg border border-yellow-200 bg-yellow-50 p-6">
      {dismissible && (
        <button
          aria-label="Dismiss"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={onDismiss}
          type="button"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M6 18L18 6M6 6l12 12"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </button>
      )}

      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </div>

        <div className="flex-1">
          <h3 className="mb-2 font-medium text-sm text-yellow-800">
            Verify Your University Email
          </h3>
          <p className="mb-4 text-sm text-yellow-700">
            Check your university email for a 6-digit verification code to
            access student features.
          </p>

          <div className="space-y-3">
            <div>
              <label
                className="mb-1 block font-medium text-xs text-yellow-800"
                htmlFor="verification-otp"
              >
                Verification Code
              </label>
              <input
                className="w-full rounded-md border border-yellow-300 bg-white px-3 py-2 text-center font-mono text-lg tracking-widest focus:border-transparent focus:ring-2 focus:ring-yellow-500"
                id="verification-otp"
                maxLength={6}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                type="text"
                value={otp}
              />
            </div>

            <div className="flex space-x-2">
              <button
                className="flex-1 rounded-md bg-yellow-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-yellow-700 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isVerifying || otp.length !== 6}
                onClick={handleVerifyOTP}
                type="button"
              >
                {isVerifying ? 'Verifying...' : 'Verify'}
              </button>

              <button
                className="flex-1 rounded-md border border-yellow-300 bg-white px-4 py-2 font-medium text-sm text-yellow-700 transition-colors hover:bg-yellow-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isResending}
                onClick={handleResendOTP}
                type="button"
              >
                {isResending ? 'Sending...' : 'Resend Code'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import GetVerificationOTP from './get-verification-otp'
import OtpVerification from './otp-verification'
import { useEmailVerification } from './use-email-verification'

export default function EmailVerificationFlow() {
  const {
    step,
    userEmail,
    status,
    isLoading,
    handleOtpVerify,
    handleEmailSuccess,
    handleResend
  } = useEmailVerification()

  if (isLoading)
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )

  if (status?.isVerified) return null

  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center px-4">
      <div className="w-full max-w-md">
        {step === 'get-email' && (
          <GetVerificationOTP
            onSuccess={(email) => {
              handleEmailSuccess(email)
            }}
          />
        )}

        {step === 'otp' && (
          <OtpVerification
            email={userEmail}
            onResend={() => {
              handleResend()
            }}
            onVerify={async (code) => {
              await handleOtpVerify(code)
            }}
          />
        )}
      </div>
    </div>
  )
}

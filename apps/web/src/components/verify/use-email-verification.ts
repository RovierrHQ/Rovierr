import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { orpc } from '@/utils/orpc'

type Step = 'get-email' | 'otp'
const EMAIL_STORAGE_KEY = 'verify:userEmail'

export const useEmailVerification = () => {
  const [step, setStep] = useState<Step>('get-email')
  const [userEmail, setUserEmailState] = useState('')
  const hasHydrated = useRef(false)

  const {
    data: status,
    isLoading,
    refetch
  } = useQuery(
    orpc.user.onboarding.getStatus.queryOptions({ refetchOnMount: 'always' })
  )

  const { mutateAsync } = useMutation(
    orpc.user.onboarding.verifyEmail.mutationOptions()
  )

  const { mutateAsync: resendMutateAsync } = useMutation(
    orpc.user.onboarding.resendVerification.mutationOptions()
  )

  useEffect(() => {
    if (status?.hasUniversityEmail && userEmail) {
      setStep('otp')
      return
    }

    setStep('get-email')
  }, [status?.hasUniversityEmail, userEmail])

  useEffect(() => {
    if (hasHydrated.current) return
    if (typeof window === 'undefined') return
    const storedEmail = window.sessionStorage.getItem(EMAIL_STORAGE_KEY)
    if (storedEmail) setUserEmailState(storedEmail)
    hasHydrated.current = true
  }, [])

  const setUserEmail = (email: string) => {
    setUserEmailState(email)
    if (typeof window === 'undefined') return
    if (email) {
      window.sessionStorage.setItem(EMAIL_STORAGE_KEY, email)
    } else {
      window.sessionStorage.removeItem(EMAIL_STORAGE_KEY)
    }
  }

  const handleOtpVerify = async (code: string) => {
    try {
      await mutateAsync({ otp: code })
      toast.success('Email verified successfully!')
      setUserEmail('')
      await refetch()
    } catch {
      toast.error('Invalid OTP. Please try again.')
    }
  }

  const handleEmailSuccess = (email: string) => {
    setUserEmail(email)
    toast(`A verification code was sent to ${email}`)
    refetch().catch(() => {
      toast.error('Failed to refresh verification status. Please try again.')
    })
  }

  const handleResend = async () => {
    if (!userEmail) return

    try {
      await resendMutateAsync({})
      toast(`A verification code was sent to ${userEmail}`)
    } catch {
      toast.error('Failed to resend verification code. Please try again.')
    }
  }

  return {
    step,
    userEmail,
    status,
    isLoading,
    handleOtpVerify,
    handleEmailSuccess,
    handleResend
  }
}

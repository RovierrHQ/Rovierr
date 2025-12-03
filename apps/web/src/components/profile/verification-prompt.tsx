'use client'

import { Alert, AlertDescription } from '@rov/ui/components/alert'
import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from '@rov/ui/components/input-group'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from '@rov/ui/components/input-otp'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@rov/ui/components/select'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2, Loader2, Mail } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import { orpc } from '@/utils/orpc'

export function VerificationPrompt() {
  const queryClient = useQueryClient()
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [emailLocalPart, setEmailLocalPart] = useState('')
  const [otp, setOtp] = useState('')
  const [selectedUniversityId, setSelectedUniversityId] = useState<string>('')
  const [selectedDomain, setSelectedDomain] = useState<string>('')

  // Fetch universities from database
  const { data: universitiesData } = useQuery(
    orpc.university.list.queryOptions()
  )

  const universities = universitiesData?.universities ?? []
  const selectedUniversity = universities.find(
    (uni) => uni.id === selectedUniversityId
  )

  // Set default university when data loads
  useEffect(() => {
    if (universities.length > 0 && !selectedUniversityId) {
      setSelectedUniversityId(universities[0]?.id ?? '')
    }
  }, [universities, selectedUniversityId])

  // Set default domain when university changes
  useEffect(() => {
    if (selectedUniversity?.validEmailDomains.length) {
      setSelectedDomain(selectedUniversity.validEmailDomains[0])
    }
  }, [selectedUniversity])

  const sendOTPMutation = useMutation(
    orpc.user.profile.verifyStudent.sendVerificationOTP.mutationOptions({
      onSuccess: () => {
        setStep('otp')
        toast.success('Verification code sent to your email')
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to send verification code')
      }
    })
  )

  const verifyOTPMutation = useMutation(
    orpc.user.profile.verifyStudent.verifyOTP.mutationOptions({
      onSuccess: async () => {
        // Invalidate and refetch all relevant queries
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['user', 'profile'] }),
          queryClient.invalidateQueries({
            queryKey: ['better-auth', 'session']
          }),
          await authClient.getSession({ query: { disableCookieCache: true } })
        ])

        toast.success('Student status verified successfully!')

        // Reset form
        setStep('email')
        setEmailLocalPart('')
        setOtp('')

        window.location.reload()
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to verify code')
      }
    })
  )

  const resendOTPMutation = useMutation(
    orpc.user.profile.verifyStudent.resendOTP.mutationOptions({
      onSuccess: () => {
        toast.success('Verification code resent')
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to resend code')
      }
    })
  )

  const handleSendOTP = async () => {
    if (!emailLocalPart.trim()) {
      toast.error('Please enter your email username')
      return
    }

    if (!selectedUniversity) {
      toast.error('Please select a university')
      return
    }

    // Construct full email with selected domain (add @ since validEmailDomains doesn't include it)
    const email = `${emailLocalPart.trim()}@${selectedDomain}`

    try {
      await sendOTPMutation.mutateAsync({
        email,
        universityId: selectedUniversityId
      })
    } catch {
      // Error handled by mutation
    }
  }

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit code')
      return
    }

    try {
      await verifyOTPMutation.mutateAsync({ otp })
    } catch {
      // Error handled by mutation
    }
  }

  const handleOTPChange = (value: string) => {
    setOtp(value)
  }

  const handleResendOTP = async () => {
    try {
      await resendOTPMutation.mutateAsync({})
    } catch {
      // Error handled by mutation
    }
  }

  const loading =
    sendOTPMutation.isPending ||
    verifyOTPMutation.isPending ||
    resendOTPMutation.isPending

  return (
    <Card className="space-y-6 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5 p-6 backdrop-blur">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/20">
          <AlertCircle className="h-5 w-5 text-amber-500" />
        </div>
        <div className="flex-1">
          <h3 className="mb-1 font-semibold text-lg">
            Verify Your Student Status
          </h3>
          <p className="text-muted-foreground text-sm">
            {step === 'email' &&
              'Verify your university email to unlock full access'}
            {step === 'otp' && 'Enter the verification code sent to your email'}
          </p>
        </div>
      </div>

      {step === 'email' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="university-select">
              Select Your University
            </label>
            <select
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              id="university-select"
              onChange={(e) => setSelectedUniversityId(e.target.value)}
              value={selectedUniversityId}
            >
              {universities.map((uni) => (
                <option key={uni.id} value={uni.id}>
                  {uni.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="university-email">
              University Email Address
            </label>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <Mail className="h-4 w-4" />
              </InputGroupAddon>
              <InputGroupInput
                id="university-email"
                onChange={(e) => {
                  // Remove @ if user tries to add it
                  const value = e.target.value.replace('@', '')
                  setEmailLocalPart(value)
                }}
                placeholder="your.name"
                type="text"
                value={emailLocalPart}
              />
              <InputGroupAddon align="inline-end">
                {selectedUniversity &&
                selectedUniversity.validEmailDomains.length > 0 ? (
                  <Select
                    disabled={selectedUniversity.validEmailDomains.length === 1}
                    onValueChange={setSelectedDomain}
                    value={selectedDomain}
                  >
                    <SelectTrigger className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0">
                      <SelectValue>
                        {selectedDomain ? `@${selectedDomain}` : ''}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {selectedUniversity.validEmailDomains.map((domain) => (
                        <SelectItem key={domain} value={domain}>
                          @{domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  '@university.edu'
                )}
              </InputGroupAddon>
            </InputGroup>
          </div>

          <Button
            className="w-full"
            disabled={loading || !emailLocalPart.trim()}
            onClick={handleSendOTP}
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Code'
            )}
          </Button>
        </div>
      )}
      {step === 'otp' && (
        <div className="space-y-4">
          <Alert className="border-primary/30 bg-primary/5">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              We've sent a 6-digit code to{' '}
              <strong>
                {emailLocalPart}
                {selectedDomain ? `@${selectedDomain}` : '@university.edu'}
              </strong>
            </AlertDescription>
          </Alert>

          <div className="flex flex-col items-center justify-center gap-2">
            <label className="font-medium text-sm" htmlFor="otp-input">
              Enter Verification Code
            </label>
            <InputOTP
              id="otp-input"
              maxLength={6}
              onChange={handleOTPChange}
              value={otp}
            >
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: okay for otp
                  <InputOTPSlot index={index} key={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => setStep('email')}
                variant="outline"
              >
                Change Email
              </Button>
              <Button
                className="flex-1"
                disabled={loading || otp.length !== 6}
                onClick={handleVerifyOTP}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify'
                )}
              </Button>
            </div>

            <button
              className="w-full text-center text-primary text-sm hover:underline"
              disabled={loading}
              onClick={handleResendOTP}
              type="button"
            >
              Didn't receive the code? Resend
            </button>
          </div>
        </div>
      )}
    </Card>
  )
}

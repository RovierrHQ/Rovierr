'use client'

import { verificationSettingsSchema } from '@rov/orpc-contracts/user/profile-schemas'
import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import { useAppForm } from '@rov/ui/components/form/index'

import { Label } from '@rov/ui/components/label'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Shield, XCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { z } from 'zod'
import { orpc } from '@/utils/orpc'

export function VerificationSettings() {
  const queryClient = useQueryClient()
  const { data: profileInfo } = useQuery(orpc.user.profile.info.queryOptions())
  const { data: universities } = useQuery(orpc.university.list.queryOptions())

  const [codeSent, setCodeSent] = useState(false)

  const studentVerified = profileInfo?.studentStatusVerified

  const form = useAppForm({
    validators: { onSubmit: verificationSettingsSchema },
    defaultValues: {
      universityId: '',
      universityEmail: '',
      startDate: '',
      verificationCode: ''
    } as z.infer<typeof verificationSettingsSchema>,
    onSubmit: () => {
      // This form doesn't submit directly, handled by buttons
    }
  })

  const submitOnboardingMutation = useMutation(
    orpc.user.onboarding.submit.mutationOptions({
      onSuccess: () => {
        setCodeSent(true)
        toast.success('Verification code sent to your university email')
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to send verification code')
      }
    })
  )

  const verifyEmailMutation = useMutation(
    orpc.user.onboarding.verifyEmail.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
        queryClient.invalidateQueries({ queryKey: ['user', 'onboarding'] })
        setCodeSent(false)
        form.reset()
        toast.success('Student status verified successfully!')
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Invalid verification code')
      }
    })
  )

  const resendMutation = useMutation(
    orpc.user.onboarding.resendVerification.mutationOptions({
      onSuccess: () => {
        toast.success('Verification code resent')
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to resend code')
      }
    })
  )

  const handleSendCode = () => {
    const universityId = form.state.values.universityId
    const universityEmail = form.state.values.universityEmail

    if (!(universityId && universityEmail)) {
      toast.error('Please fill in all required fields')
      return
    }

    submitOnboardingMutation.mutate({
      universityId,
      universityEmail,
      displayName: '', // Will use existing name
      profileImageUrl: '', // Will use existing image
      major: '',
      yearOfStudy: '1' as '1' | '2' | '3' | '4' | 'graduate' | 'phd',
      interests: []
    })
  }

  const handleVerify = () => {
    const verificationCode = form.state.values.verificationCode

    if (!verificationCode) {
      toast.error('Please enter the verification code')
      return
    }

    verifyEmailMutation.mutate({
      otp: verificationCode
    })
  }

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-sm">Student Verification</h3>
          <p className="text-muted-foreground text-xs">
            Verify your student status to access exclusive features
          </p>
        </div>
        {studentVerified ? (
          <Badge className="gap-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Verified
          </Badge>
        ) : (
          <Badge className="gap-1.5" variant="secondary">
            <XCircle className="h-3.5 w-3.5" />
            Not Verified
          </Badge>
        )}
      </div>

      {!(studentVerified || codeSent) && (
        <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Shield className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg">Verify Your Student Status</h3>
          <p className="max-w-md text-muted-foreground text-sm">
            Get access to student exclusive features and benefits by verifying
            your enrollment
          </p>
        </div>
      )}

      {!studentVerified && (
        <div className="space-y-4">
          {codeSent ? (
            <div className="space-y-4">
              <form.AppField
                children={(field) => (
                  <div className="space-y-2">
                    <Label>Enter Verification Code</Label>
                    <p className="text-muted-foreground text-sm">
                      We sent a code to {form.state.values.universityEmail}
                    </p>
                    <field.Text placeholder="123456" />
                  </div>
                )}
                name="verificationCode"
              />
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  className="flex-1"
                  disabled={verifyEmailMutation.isPending}
                  onClick={handleVerify}
                  type="button"
                >
                  {verifyEmailMutation.isPending ? 'Verifying...' : 'Verify'}
                </Button>
                <Button
                  className="sm:w-auto"
                  disabled={resendMutation.isPending}
                  onClick={() => resendMutation.mutate({} as never)}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  Resend Code
                </Button>
              </div>
            </div>
          ) : (
            <>
              <form.AppField
                children={(field) => (
                  <field.Select
                    label="University"
                    options={
                      universities?.universities?.map(
                        (uni: { id: string; name: string }) => ({
                          label: uni.name,
                          value: uni.id
                        })
                      ) ?? []
                    }
                    placeholder="Select your university"
                  />
                )}
                name="universityId"
              />

              <form.AppField
                children={(field) => (
                  <field.Text label="Start Date" type="date" />
                )}
                name="startDate"
              />

              <form.AppField
                children={(field) => (
                  <field.Text
                    label="University Email"
                    placeholder="student@university.edu"
                    type="email"
                  />
                )}
                name="universityEmail"
              />

              <Button
                className="w-full"
                disabled={submitOnboardingMutation.isPending}
                onClick={handleSendCode}
                type="button"
              >
                {submitOnboardingMutation.isPending
                  ? 'Sending...'
                  : 'Send Verification Code'}
              </Button>
            </>
          )}
        </div>
      )}

      {studentVerified && (
        <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
          <div className="mb-4 rounded-full bg-green-500/10 p-4">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="font-semibold text-lg">Student Status Verified</h3>
          <p className="text-muted-foreground text-sm">
            You now have access to all student benefits and features
          </p>
        </div>
      )}
    </div>
  )
}

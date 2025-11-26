'use client'

import { profileUpdateSchema } from '@rov/orpc-contracts/user/profile-schemas'
import { Button } from '@rov/ui/components/button'
import { useAppForm } from '@rov/ui/components/form/index'
import { Input } from '@rov/ui/components/input'
import { Label } from '@rov/ui/components/label'
import { Separator } from '@rov/ui/components/separator'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { z } from 'zod'
import { authClient } from '@/lib/auth-client'
import { orpc } from '@/utils/orpc'

export function ProfileSettings() {
  const queryClient = useQueryClient()
  const { data: profileDetails } = useQuery(
    orpc.user.profile.details.queryOptions()
  )

  const [phoneVerification, setPhoneVerification] = useState({
    codeSent: false,
    code: '',
    phoneNumber: ''
  })

  const form = useAppForm({
    validators: { onSubmit: profileUpdateSchema },
    defaultValues: {
      name: '',
      username: '',
      bio: '',
      website: ''
    } as z.infer<typeof profileUpdateSchema>,
    onSubmit: async ({ value }) => {
      try {
        await orpc.user.profile.update.call(value)
        queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
        toast.success('Profile updated successfully')
      } catch (error) {
        toast.error((error as Error).message || 'Failed to update profile')
      }
    }
  })

  // Update form when profile data loads
  useEffect(() => {
    if (profileDetails) {
      form.setFieldValue('name', profileDetails.name)
      form.setFieldValue('username', profileDetails.username ?? '')
      form.setFieldValue('bio', profileDetails.bio ?? '')
      form.setFieldValue('website', profileDetails.website ?? '')
      setPhoneVerification((prev) => ({
        ...prev,
        phoneNumber: profileDetails.phoneNumber ?? ''
      }))
    }
  }, [profileDetails, form])

  const sendOtpMutation = useMutation({
    mutationFn: (phoneNumber: string) =>
      authClient.phoneNumber.sendOtp({ phoneNumber }),
    onSuccess: () => {
      setPhoneVerification((prev) => ({ ...prev, codeSent: true }))
      toast.success('Verification code sent to your phone')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send verification code')
    }
  })

  const verifyPhoneMutation = useMutation({
    mutationFn: ({
      phoneNumber,
      code
    }: {
      phoneNumber: string
      code: string
    }) =>
      authClient.phoneNumber.verify({
        phoneNumber,
        code,
        updatePhoneNumber: true
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
      setPhoneVerification({ codeSent: false, code: '', phoneNumber: '' })
      toast.success('Phone number verified successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Invalid verification code')
    }
  })

  const handleSendCode = () => {
    if (!phoneVerification.phoneNumber) {
      toast.error('Please enter a phone number')
      return
    }
    sendOtpMutation.mutate(phoneVerification.phoneNumber)
  }

  const handleVerifyPhone = () => {
    if (!phoneVerification.code) {
      toast.error('Please enter the verification code')
      return
    }
    verifyPhoneMutation.mutate({
      phoneNumber: phoneVerification.phoneNumber,
      code: phoneVerification.code
    })
  }

  return (
    <form
      className="space-y-6 pt-4"
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      {/* Basic Information */}
      <div className="space-y-4">
        <form.AppField
          children={(field) => (
            <field.Text label="Full Name" placeholder="John Doe" />
          )}
          name="name"
        />

        <form.AppField
          children={(field) => (
            <field.Text
              description="Your unique username for the platform"
              label="Username"
              placeholder="johndoe"
            />
          )}
          name="username"
        />

        <form.AppField
          children={(field) => (
            <field.TextArea
              description={`${field.state.value?.length || 0}/500 characters`}
              label="Bio"
              placeholder="Tell us about yourself..."
              rows={4}
            />
          )}
          name="bio"
        />

        <form.AppField
          children={(field) => (
            <field.Text
              label="Website"
              placeholder="https://yourwebsite.com"
              type="url"
            />
          )}
          name="website"
        />
      </div>

      <Separator />

      {/* Phone Number Verification */}
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-sm">Phone Number</h3>
          <p className="text-muted-foreground text-xs">
            Add and verify your phone number for additional security
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            disabled={profileDetails?.phoneNumberVerified}
            id="phone"
            onChange={(e) =>
              setPhoneVerification((prev) => ({
                ...prev,
                phoneNumber: e.target.value
              }))
            }
            placeholder="+1 (555) 000-0000"
            type="tel"
            value={phoneVerification.phoneNumber}
          />
          {profileDetails?.phoneNumberVerified && (
            <p className="text-green-600 text-xs">✓ Verified</p>
          )}
        </div>

        {!profileDetails?.phoneNumberVerified && (
          <>
            <Button
              disabled={
                sendOtpMutation.isPending || !phoneVerification.phoneNumber
              }
              onClick={handleSendCode}
              type="button"
              variant="outline"
            >
              {sendOtpMutation.isPending
                ? 'Sending...'
                : 'Send Verification Code'}
            </Button>

            {phoneVerification.codeSent && (
              <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Enter Verification Code</Label>
                  <p className="text-muted-foreground text-sm">
                    We sent a code to {phoneVerification.phoneNumber}
                  </p>
                  <Input
                    id="code"
                    maxLength={6}
                    onChange={(e) =>
                      setPhoneVerification((prev) => ({
                        ...prev,
                        code: e.target.value
                      }))
                    }
                    placeholder="123456"
                    value={phoneVerification.code}
                  />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    className="flex-1 sm:flex-initial"
                    disabled={verifyPhoneMutation.isPending}
                    onClick={handleVerifyPhone}
                    size="sm"
                    type="button"
                  >
                    {verifyPhoneMutation.isPending ? 'Verifying...' : 'Verify'}
                  </Button>
                  <Button
                    className="flex-1 sm:flex-initial"
                    disabled={sendOtpMutation.isPending}
                    onClick={handleSendCode}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    Resend Code
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Separator />

      {/* Save Button */}
      <div className="flex justify-end">
        <Button disabled={form.state.isSubmitting} type="submit">
          <Save className="mr-2 h-4 w-4" />
          {form.state.isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}

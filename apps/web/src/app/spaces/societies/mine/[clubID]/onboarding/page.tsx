'use client'

import type { societySchema } from '@rov/orpc-contracts'
import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import { Progress } from '@rov/ui/components/progress'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Check, Loader2, Save } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import type { z } from 'zod'
import { orpc } from '@/utils/orpc'

type Society = z.infer<typeof societySchema>
type OnboardingStep = 1 | 2 | 3

const OnboardingWizard = () => {
  const params = useParams()
  const router = useRouter()
  const societyId = params.clubID as string

  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch society data
  const { data: society, isLoading } = useQuery(
    orpc.society.getById.queryOptions({ input: { id: societyId } })
  )

  const totalSteps = 3
  const progress = (currentStep / totalSteps) * 100

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => (prev + 1) as OnboardingStep)
    } else {
      // Complete onboarding
      await handleComplete()
    }
  }

  const handleSkip = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => (prev + 1) as OnboardingStep)
    } else {
      handleFinishLater()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as OnboardingStep)
    }
  }

  const handleFinishLater = () => {
    router.push(`/spaces/societies/mine/${societyId}`)
  }

  const handleComplete = async () => {
    try {
      setIsSaving(true)
      await orpc.society.completeOnboarding.call({ organizationId: societyId })
      toast.success('Onboarding completed!')
      router.push(`/spaces/societies/mine/${societyId}`)
    } catch (_error) {
      toast.error('Failed to complete onboarding')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!society) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Society not found</p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          onClick={() => router.push(`/spaces/societies/mine/${societyId}`)}
          size="sm"
          variant="ghost"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="font-semibold text-2xl">Complete Your Profile</h1>
          <span className="text-muted-foreground text-sm">
            Step {currentStep} of {totalSteps}
          </span>
        </div>
        <Progress className="h-2" value={progress} />
      </div>

      {/* Step Content */}
      <Card className="p-6">
        {currentStep === 1 && <Step1VisualBranding society={society} />}
        {currentStep === 2 && <Step2ContactInfo society={society} />}
        {currentStep === 3 && <Step3AdditionalDetails society={society} />}
      </Card>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          disabled={currentStep === 1 || isSaving}
          onClick={handleBack}
          variant="outline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex gap-3">
          <Button disabled={isSaving} onClick={handleSkip} variant="ghost">
            Skip
          </Button>

          <Button
            disabled={isSaving}
            onClick={handleFinishLater}
            variant="outline"
          >
            <Save className="mr-2 h-4 w-4" />
            Finish Later
          </Button>

          <Button disabled={isSaving} onClick={handleNext}>
            {isSaving && (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            )}
            {!isSaving && currentStep === totalSteps && (
              <>
                <Check className="mr-2 h-4 w-4" />
                Complete
              </>
            )}
            {!isSaving && currentStep !== totalSteps && (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Step 1: Visual Branding
const Step1VisualBranding = ({ society: _society }: { society: Society }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 font-semibold text-xl">Visual Branding</h2>
        <p className="text-muted-foreground text-sm">
          Add your logo, banner, and brand colors to make your society stand out
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block font-medium text-sm" htmlFor="logo">
            Logo
          </label>
          <p className="text-muted-foreground text-sm">
            Upload a square logo (minimum 200x200px, max 5MB)
          </p>
          {/* TODO: Implement image upload component */}
          <div className="mt-2 flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed">
            <span className="text-muted-foreground text-sm">Upload Logo</span>
          </div>
        </div>

        <div>
          <label className="mb-2 block font-medium text-sm" htmlFor="banner">
            Banner
          </label>
          <p className="text-muted-foreground text-sm">
            Upload a banner image (minimum 1200x400px, max 10MB)
          </p>
          {/* TODO: Implement image upload component */}
          <div className="mt-2 flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed">
            <span className="text-muted-foreground text-sm">Upload Banner</span>
          </div>
        </div>

        <div>
          <label
            className="mb-2 block font-medium text-sm"
            htmlFor="primaryColor"
          >
            Primary Color
          </label>
          <p className="text-muted-foreground text-sm">
            Choose a color that represents your society
          </p>
          {/* TODO: Implement color picker */}
          <input className="mt-2 h-10 w-20" id="primaryColor" type="color" />
        </div>
      </div>
    </div>
  )
}

// Step 2: Contact Information
const Step2ContactInfo = ({ society }: { society: Society }) => {
  const [formData, setFormData] = useState({
    instagram: society?.instagram || '',
    facebook: society?.facebook || '',
    twitter: society?.twitter || '',
    linkedin: society?.linkedin || '',
    whatsapp: society?.whatsapp || '',
    telegram: society?.telegram || '',
    website: society?.website || ''
  })

  const handleSave = async () => {
    try {
      await orpc.society.updateFields.call({
        organizationId: society.id,
        data: formData
      })
      toast.success('Contact information saved!')
    } catch (_error) {
      toast.error('Failed to save contact information')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 font-semibold text-xl">Contact Information</h2>
        <p className="text-muted-foreground text-sm">
          Add your social media links so members can connect with you
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block font-medium text-sm" htmlFor="instagram">
            Instagram
          </label>
          <input
            className="w-full rounded-md border px-3 py-2"
            id="instagram"
            onChange={(e) =>
              setFormData({ ...formData, instagram: e.target.value })
            }
            placeholder="@username"
            type="text"
            value={formData.instagram}
          />
        </div>

        <div>
          <label className="mb-2 block font-medium text-sm" htmlFor="facebook">
            Facebook
          </label>
          <input
            className="w-full rounded-md border px-3 py-2"
            id="facebook"
            onChange={(e) =>
              setFormData({ ...formData, facebook: e.target.value })
            }
            placeholder="https://facebook.com/..."
            type="text"
            value={formData.facebook}
          />
        </div>

        <div>
          <label className="mb-2 block font-medium text-sm" htmlFor="twitter">
            Twitter/X
          </label>
          <input
            className="w-full rounded-md border px-3 py-2"
            onChange={(e) =>
              setFormData({ ...formData, twitter: e.target.value })
            }
            placeholder="@username"
            type="text"
            value={formData.twitter}
          />
        </div>

        <div>
          <label className="mb-2 block font-medium text-sm" htmlFor="linkedin">
            LinkedIn
          </label>
          <input
            className="w-full rounded-md border px-3 py-2"
            id="linkedin"
            onChange={(e) =>
              setFormData({ ...formData, linkedin: e.target.value })
            }
            placeholder="https://linkedin.com/..."
            type="text"
            value={formData.linkedin}
          />
        </div>

        <div>
          <label className="mb-2 block font-medium text-sm" htmlFor="whatsapp">
            WhatsApp
          </label>
          <input
            className="w-full rounded-md border px-3 py-2"
            id="whatsapp"
            onChange={(e) =>
              setFormData({ ...formData, whatsapp: e.target.value })
            }
            placeholder="Phone or group link"
            type="text"
            value={formData.whatsapp}
          />
        </div>

        <div>
          <label className="mb-2 block font-medium text-sm" htmlFor="telegram">
            Telegram
          </label>
          <input
            className="w-full rounded-md border px-3 py-2"
            id="telegram"
            onChange={(e) =>
              setFormData({ ...formData, telegram: e.target.value })
            }
            placeholder="@username or group link"
            type="text"
            value={formData.telegram}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block font-medium text-sm" htmlFor="website">
            Website
          </label>
          <input
            className="w-full rounded-md border px-3 py-2"
            id="website"
            onChange={(e) =>
              setFormData({ ...formData, website: e.target.value })
            }
            placeholder="https://yourwebsite.com"
            type="text"
            value={formData.website}
          />
        </div>
      </div>

      <Button className="w-full" onClick={handleSave}>
        Save Contact Information
      </Button>
    </div>
  )
}

// Step 3: Additional Details
const Step3AdditionalDetails = ({
  society: _society
}: {
  society: Society
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 font-semibold text-xl">Additional Details</h2>
        <p className="text-muted-foreground text-sm">
          Help members learn more about your society
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            className="mb-2 block font-medium text-sm"
            htmlFor="foundingYear"
          >
            Founding Year
          </label>
          <input
            className="w-full rounded-md border px-3 py-2"
            id="foundingYear"
            max={new Date().getFullYear()}
            min={1800}
            placeholder="2024"
            type="number"
          />
        </div>

        <div>
          <label
            className="mb-2 block font-medium text-sm"
            htmlFor="meetingSchedule"
          >
            Meeting Schedule
          </label>
          <input
            className="w-full rounded-md border px-3 py-2"
            id="meetingSchedule"
            placeholder="e.g., Every Tuesday at 6 PM"
            type="text"
          />
        </div>

        <div>
          <label
            className="mb-2 block font-medium text-sm"
            htmlFor="membershipRequirements"
          >
            Membership Requirements
          </label>
          <textarea
            className="w-full rounded-md border px-3 py-2"
            id="membershipRequirements"
            placeholder="Describe any requirements to join your society"
            rows={3}
          />
        </div>

        <div>
          <label className="mb-2 block font-medium text-sm" htmlFor="goals">
            Goals
          </label>
          <textarea
            className="w-full rounded-md border px-3 py-2"
            id="goals"
            placeholder="What does your society aim to achieve?"
            rows={4}
          />
        </div>
      </div>
    </div>
  )
}

export default OnboardingWizard

// Updated Step 3 with state management
const _Step3AdditionalDetailsUpdated = ({ society }: { society: Society }) => {
  const [formData, setFormData] = useState({
    foundingYear: society?.foundingYear || undefined,
    meetingSchedule: society?.meetingSchedule || '',
    membershipRequirements: society?.membershipRequirements || '',
    goals: society?.goals || ''
  })

  const handleSave = async () => {
    try {
      await orpc.society.updateFields.call({
        organizationId: society.id,
        data: formData
      })
      toast.success('Additional details saved!')
    } catch (_error) {
      toast.error('Failed to save additional details')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 font-semibold text-xl">Additional Details</h2>
        <p className="text-muted-foreground text-sm">
          Help members learn more about your society
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            className="mb-2 block font-medium text-sm"
            htmlFor="foundingYearInput"
          >
            Founding Year
          </label>
          <input
            className="w-full rounded-md border px-3 py-2"
            id="foundingYearInput"
            max={new Date().getFullYear()}
            min={1800}
            onChange={(e) =>
              setFormData({
                ...formData,
                foundingYear: e.target.value
                  ? Number(e.target.value)
                  : undefined
              })
            }
            placeholder="2024"
            type="number"
            value={formData.foundingYear || ''}
          />
        </div>

        <div>
          <label
            className="mb-2 block font-medium text-sm"
            htmlFor="meetingScheduleInput"
          >
            Meeting Schedule
          </label>
          <input
            className="w-full rounded-md border px-3 py-2"
            id="meetingScheduleInput"
            onChange={(e) =>
              setFormData({ ...formData, meetingSchedule: e.target.value })
            }
            placeholder="e.g., Every Tuesday at 6 PM"
            type="text"
            value={formData.meetingSchedule}
          />
        </div>

        <div>
          <label
            className="mb-2 block font-medium text-sm"
            htmlFor="membershipRequirementsInput"
          >
            Membership Requirements
          </label>
          <textarea
            className="w-full rounded-md border px-3 py-2"
            id="membershipRequirementsInput"
            onChange={(e) =>
              setFormData({
                ...formData,
                membershipRequirements: e.target.value
              })
            }
            placeholder="Describe any requirements to join your society"
            rows={3}
            value={formData.membershipRequirements}
          />
        </div>

        <div>
          <label className="mb-2 block font-medium text-sm" htmlFor="goals">
            Goals
          </label>
          <textarea
            className="w-full rounded-md border px-3 py-2"
            onChange={(e) =>
              setFormData({ ...formData, goals: e.target.value })
            }
            placeholder="What does your society aim to achieve?"
            rows={4}
            value={formData.goals}
          />
        </div>
      </div>

      <Button className="w-full" onClick={handleSave}>
        Save Additional Details
      </Button>
    </div>
  )
}

'use client'

import { Button } from '@rov/ui/components/button'
import { Card, CardContent } from '@rov/ui/components/card'
import { useAppForm } from '@rov/ui/components/form/index'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  Calendar,
  GraduationCap,
  Instagram,
  Linkedin,
  MessageCircle,
  Phone,
  User
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { type JSX, useEffect, useReducer } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { orpc, queryClient } from '@/utils/orpc'

/* ---------------------------- SCHEMAS ---------------------------- */

const basicSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  preferredName: z.string().optional(),
  major: z.string().min(1, 'Major is required'),
  year: z.string().min(1, 'Year is required')
})

const socialSchema = z.object({
  whatsapp: z.string().optional(),
  linkedin: z.string().optional(),
  instagram: z.string().optional(),
  wechat: z.string().optional()
})

type BasicValues = z.infer<typeof basicSchema>
type SocialValues = z.infer<typeof socialSchema>
type FlowStep = 1 | 2 | 3

type ProfileState = {
  step: FlowStep
  basic: BasicValues
  social: SocialValues
}

type Action =
  | { type: 'SET_STEP'; step: FlowStep }
  | { type: 'SET_BASIC'; payload: BasicValues }
  | { type: 'SET_SOCIAL'; payload: SocialValues }
  | { type: 'RESET' }

const initialState: ProfileState = {
  step: 1,
  basic: {
    fullName: '',
    preferredName: '',
    major: '',
    year: ''
  },
  social: {
    whatsapp: '',
    linkedin: '',
    instagram: '',
    wechat: ''
  }
}

/* ---------------------------- REDUCER ---------------------------- */

function reducer(state: ProfileState, action: Action): ProfileState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.step }
    case 'SET_BASIC':
      return { ...state, basic: { ...state.basic, ...action.payload } }
    case 'SET_SOCIAL':
      return { ...state, social: { ...state.social, ...action.payload } }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

/* ---------------------------- CARD WRAPPER ---------------------------- */

function CardWrapper({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Card className="w-full rounded-md p-6 shadow-sm">
      <CardContent className="p-0">
        <h2 className="mb-6 text-center font-semibold text-2xl">{title}</h2>
        {children}
      </CardContent>
    </Card>
  )
}

/* ---------------------------- ROOT FLOW ---------------------------- */

export default function ProfileFlow(): JSX.Element {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { data: onboardingStatus } = useQuery(
    orpc.user.onboarding.getStatus.queryOptions({ refetchOnMount: 'always' })
  )
  const router = useRouter()

  useEffect(() => {
    if (onboardingStatus?.hasUniversityEmail) return router.push('/spaces')
  }, [onboardingStatus, router])

  return (
    <div className="flex min-h-screen w-full items-center justify-center py-10">
      <div className="w-full max-w-md">
        {/* ------------------ PROGRESS BAR ------------------ */}
        <Image
          alt="rovierr Login page"
          className="mx-auto my-5"
          height={28}
          src="/rovierr-login-logo.svg"
          width={96}
        />

        <div className="mb-6 w-full">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{
                width: (() => {
                  switch (state.step) {
                    case 1:
                      return '33%'
                    case 2:
                      return '66%'
                    case 3:
                      return '100%'
                    default:
                      return '0%'
                  }
                })()
              }}
            />
          </div>
        </div>

        {state.step === 1 && (
          <StepBasic
            initial={state.basic}
            onNext={(values) => {
              dispatch({ type: 'SET_BASIC', payload: values })
              dispatch({ type: 'SET_STEP', step: 2 })
            }}
          />
        )}

        {state.step === 2 && (
          <StepSocial
            initial={state.social}
            onBack={() => dispatch({ type: 'SET_STEP', step: 1 })}
            onNext={(values) => {
              dispatch({ type: 'SET_SOCIAL', payload: values })
              dispatch({ type: 'SET_STEP', step: 3 })
            }}
          />
        )}

        {state.step === 3 && (
          <StepReview
            data={{ ...state.basic, ...state.social }}
            onBack={() => dispatch({ type: 'SET_STEP', step: 2 })}
            onReset={() => dispatch({ type: 'RESET' })}
          />
        )}
      </div>
    </div>
  )
}

/* ---------------------------- STEP 1: BASIC ---------------------------- */

function StepBasic({
  initial,
  onNext
}: {
  initial: BasicValues
  onNext: (d: BasicValues) => void
}): JSX.Element {
  const form = useAppForm({
    validators: { onSubmit: basicSchema },
    defaultValues: initial,
    onSubmit: ({ value }: { value: BasicValues }) => onNext(value)
  })

  return (
    <CardWrapper title="Complete your profile">
      <p className="py-5 font-bold">Basic Information</p>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <form.AppField name="fullName">
          {(field) => (
            <field.Text label="Full Name *" placeholder="Enter your name" />
          )}
        </form.AppField>

        <form.AppField name="preferredName">
          {(field) => (
            <field.Text label="Preferred Name" placeholder="Display name" />
          )}
        </form.AppField>

        <form.AppField name="major">
          {(field) => (
            <field.Select
              label="Major/Department"
              options={['Computer Science', 'Business', 'Engineering']}
              placeholder="Select your major"
            />
          )}
        </form.AppField>

        <form.AppField name="year">
          {(field) => (
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
        </form.AppField>

        <Button className="mt-4 w-full" type="submit">
          Next
        </Button>
      </form>
    </CardWrapper>
  )
}

/* ---------------------------- STEP 2: SOCIAL ---------------------------- */

function StepSocial({
  initial,
  onNext,
  onBack
}: {
  initial: SocialValues
  onNext: (d: SocialValues) => void
  onBack: () => void
}): JSX.Element {
  const form = useAppForm({
    validators: { onSubmit: socialSchema },
    defaultValues: initial,
    onSubmit: ({ value }: { value: SocialValues }) => onNext(value)
  })

  return (
    <CardWrapper title="Complete your profile">
      <div className="my-5">
        <p className="font-semibold text-lg">Connect Social links</p>
        <p className="text-muted-foreground text-sm">
          Optional - Skip if you want
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <form.AppField name="whatsapp">
          {(field) => (
            <field.Text label="Whatsapp" placeholder="Whatsapp number" />
          )}
        </form.AppField>

        <form.AppField name="linkedin">
          {(field) => (
            <field.Text
              label="LinkedIn Profile URL"
              placeholder="LinkedIn profile URL"
            />
          )}
        </form.AppField>

        <form.AppField name="instagram">
          {(field) => <field.Text label="Instagram" placeholder="@username" />}
        </form.AppField>

        <form.AppField name="wechat">
          {(field) => <field.Text label="WeChat" placeholder="WeChat ID" />}
        </form.AppField>

        <div className="flex justify-between gap-3 pt-4">
          <Button
            className="w-[40%] basis-[40%]"
            onClick={onBack}
            type="button"
            variant="outline"
          >
            Back
          </Button>

          <Button className="w-[60%] basis-[60%]" type="submit">
            Next
          </Button>
        </div>
      </form>
    </CardWrapper>
  )
}

/* ---------------------------- STEP 3: REVIEW ---------------------------- */

function StepReview({
  data,
  onBack,
  onReset
}: {
  data: ProfileData
  onBack: () => void
  onReset: () => void
}): JSX.Element {
  const { mutateAsync, isPending } = useMutation(
    orpc.user.onboarding.submit.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.user.profile.key()
        })
      }
    })
  )
  const router = useRouter()

  const handleSubmit = async () => {
    try {
      await mutateAsync({
        displayName: data.preferredName || data.fullName || '',
        profileImageUrl: null,
        major: data.major ?? null,
        yearOfStudy:
          (data.year as '1' | '2' | '3' | '4' | 'graduate' | 'phd' | null) ??
          null,
        interests: []
      })

      toast.success('Profile updated successfully')
      router.push('/spaces')
      onReset()
    } catch {
      toast.error('Failed to submit profile')
    }
  }

  return (
    <CardWrapper title="Review Your Information">
      <div className="space-y-3 text-gray-800">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-600" />
          <span>
            {data.fullName ?? '—'}
            {data.preferredName ? ` (${data.preferredName})` : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-gray-600" />
          <span>{data.major ?? '—'}</span>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-600" />
          <span>{data.year ?? '—'}</span>
        </div>

        <h3 className="mt-4 mb-2 font-medium">Connected Accounts</h3>

        <div className="flex flex-wrap gap-2">
          {data.whatsapp && <Tag icon={<Phone size={14} />}>Whatsapp</Tag>}
          {data.linkedin && <Tag icon={<Linkedin size={14} />}>LinkedIn</Tag>}
          {data.instagram && (
            <Tag icon={<Instagram size={14} />}>Instagram</Tag>
          )}
          {data.wechat && <Tag icon={<MessageCircle size={14} />}>WeChat</Tag>}

          {!(
            data.whatsapp ||
            data.linkedin ||
            data.instagram ||
            data.wechat
          ) && <p className="text-gray-500 text-sm">No connected accounts</p>}
        </div>
      </div>

      <Button
        className="mt-6 w-full"
        disabled={isPending}
        onClick={handleSubmit}
      >
        {isPending ? 'Submitting...' : 'Complete'}
      </Button>

      <Button
        className="mt-2 w-full"
        disabled={isPending}
        onClick={onBack}
        variant="outline"
      >
        Back
      </Button>
    </CardWrapper>
  )
}

function Tag({
  icon,
  children
}: {
  icon?: JSX.Element
  children: React.ReactNode
}): JSX.Element {
  return (
    <div className="flex items-center gap-1 rounded-xl bg-gray-100 px-3 py-1.5 font-medium text-sm">
      {icon && <span className="text-gray-600">{icon}</span>}
      {children}
    </div>
  )
}

type ProfileData = Partial<BasicValues & SocialValues>

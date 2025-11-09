'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { client } from '@/utils/orpc'

const onboardingSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(50),
  profileImageUrl: z.string().url().optional().or(z.literal('')),
  universityEmail: z.string().email('Invalid email address'),
  universityId: z.string().min(1, 'Please select a university'),
  major: z.string().optional(),
  yearOfStudy: z
    .enum(['1', '2', '3', '4', 'graduate', 'phd'])
    .optional()
    .or(z.literal('')),
  interests: z.array(z.string()).max(10).optional()
})

type OnboardingFormData = z.infer<typeof onboardingSchema>

export default function OnboardingPage() {
  const router = useRouter()
  const [universities, setUniversities] = useState<
    Array<{
      id: string
      name: string
      slug: string
      logo: string | null
      country: string
      city: string
    }>
  >([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showOTPInput, setShowOTPInput] = useState(false)
  const [otp, setOtp] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema)
  })

  // Check if user already completed profile
  useEffect(() => {
    const profileCompleted = localStorage.getItem('profile_completed')
    if (profileCompleted === 'true') {
      // Check verification status
      client.user.onboarding
        .getStatus()
        .then((status) => {
          if (status.isVerified) {
            router.push('/spaces')
          }
        })
        .catch((error) => {
          if (process.env.NODE_ENV === 'development') {
            console.error(error)
          }
        })
    }
  }, [router])

  // Fetch universities
  useEffect(() => {
    client.university
      .list()
      .then((data) => {
        setUniversities(data.universities)
      })
      .catch((error) => {
        toast.error('Failed to load universities')
        if (process.env.NODE_ENV === 'development') {
          console.error(error)
        }
      })
  }, [])

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true)

    try {
      await client.user.onboarding.submit({
        displayName: data.displayName,
        profileImageUrl: data.profileImageUrl || undefined,
        universityEmail: data.universityEmail,
        universityId: data.universityId,
        major: data.major,
        yearOfStudy: data.yearOfStudy || undefined,
        interests: data.interests
      })

      toast.success('Verification code sent to your email!')
      setShowOTPInput(true)
      localStorage.setItem('profile_completed', 'true')
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to submit onboarding'
      toast.error(errorMessage)
      if (process.env.NODE_ENV === 'development') {
        console.error(error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit code')
      return
    }

    setIsVerifying(true)

    try {
      await client.user.onboarding.verifyEmail({ otp })
      toast.success('Email verified successfully!')
      router.push('/spaces')
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Invalid or expired code'
      toast.error(errorMessage)
      if (process.env.NODE_ENV === 'development') {
        console.error(error)
      }
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendOTP = async () => {
    try {
      await client.user.onboarding.resendVerification({})
      toast.success('New verification code sent!')
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to resend code'
      toast.error(errorMessage)
      if (process.env.NODE_ENV === 'development') {
        console.error(error)
      }
    }
  }

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
              <input
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center font-mono text-2xl tracking-widest focus:border-transparent focus:ring-2 focus:ring-purple-500"
                id="otp"
                maxLength={6}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                type="text"
                value={otp}
              />
            </div>

            <button
              className="w-full rounded-lg bg-purple-600 px-4 py-3 font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isVerifying || otp.length !== 6}
              onClick={handleVerifyOTP}
              type="button"
            >
              {isVerifying ? 'Verifying...' : 'Verify Email'}
            </button>

            <button
              className="w-full rounded-lg px-4 py-2 font-medium text-purple-600 transition-colors hover:bg-purple-50"
              onClick={handleResendOTP}
              type="button"
            >
              Resend Code
            </button>
          </div>
        </div>
      </div>
    )
  }

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

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Display Name */}
          <div>
            <label
              className="mb-2 block font-medium text-gray-700 text-sm"
              htmlFor="displayName"
            >
              Display Name *
            </label>
            <input
              id="displayName"
              type="text"
              {...register('displayName')}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
              placeholder="John Doe"
            />
            {errors.displayName && (
              <p className="mt-1 text-red-600 text-sm">
                {errors.displayName.message}
              </p>
            )}
          </div>

          {/* Profile Image URL */}
          <div>
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
          </div>

          {/* University Selection */}
          <div>
            <label
              className="mb-2 block font-medium text-gray-700 text-sm"
              htmlFor="universityId"
            >
              University *
            </label>
            <select
              id="universityId"
              {...register('universityId')}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select your university</option>
              {universities.map((uni) => (
                <option key={uni.id} value={uni.id}>
                  {uni.name} - {uni.city}, {uni.country}
                </option>
              ))}
            </select>
            {errors.universityId && (
              <p className="mt-1 text-red-600 text-sm">
                {errors.universityId.message}
              </p>
            )}
          </div>

          {/* University Email */}
          <div>
            <label
              className="mb-2 block font-medium text-gray-700 text-sm"
              htmlFor="universityEmail"
            >
              University Email *
            </label>
            <input
              id="universityEmail"
              type="email"
              {...register('universityEmail')}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
              placeholder="student@university.edu"
            />
            {errors.universityEmail && (
              <p className="mt-1 text-red-600 text-sm">
                {errors.universityEmail.message}
              </p>
            )}
          </div>

          {/* Major */}
          <div>
            <label
              className="mb-2 block font-medium text-gray-700 text-sm"
              htmlFor="major"
            >
              Major (optional)
            </label>
            <input
              id="major"
              type="text"
              {...register('major')}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
              placeholder="Computer Science"
            />
          </div>

          {/* Year of Study */}
          <div>
            <label
              className="mb-2 block font-medium text-gray-700 text-sm"
              htmlFor="yearOfStudy"
            >
              Year of Study (optional)
            </label>
            <select
              id="yearOfStudy"
              {...register('yearOfStudy')}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
              <option value="graduate">Graduate</option>
              <option value="phd">PhD</option>
            </select>
          </div>

          <button
            className="w-full rounded-lg bg-purple-600 px-4 py-3 font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Submitting...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}

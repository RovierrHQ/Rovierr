'use client'

import { type ReactNode, useEffect, useState } from 'react'
import { client } from '@/utils/orpc'
import { VerificationPending } from './verification-pending'

interface FeatureGateProps {
  children: ReactNode
  fallback?: ReactNode
}

export function FeatureGate({ children, fallback }: FeatureGateProps) {
  const [isVerified, setIsVerified] = useState<boolean | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const status = await client.user.onboarding.getStatus()
        setIsVerified(status.isVerified)
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to check verification status:', error)
        }
        setIsVerified(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkVerificationStatus()
  }, [])

  const handleVerified = () => {
    setIsVerified(true)
    setShowModal(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-purple-600 border-b-2" />
      </div>
    )
  }

  if (!isVerified) {
    return (
      <>
        {fallback || (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
            <div className="mb-4 flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                  <svg
                    className="h-6 w-6 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">
                  Student Verification Required
                </h3>
                <p className="text-gray-600 text-sm">
                  Verify your university email to access this feature
                </p>
              </div>
            </div>

            <button
              className="w-full rounded-lg bg-purple-600 px-4 py-2 font-medium text-white transition-colors hover:bg-purple-700"
              onClick={() => setShowModal(true)}
              type="button"
            >
              Verify Now
            </button>
          </div>
        )}

        {/* Verification Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold text-gray-900 text-xl">
                  Verify Your Email
                </h2>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setShowModal(false)}
                  type="button"
                >
                  <svg
                    className="h-6 w-6"
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
              </div>

              <VerificationPending onVerified={handleVerified} />
            </div>
          </div>
        )}
      </>
    )
  }

  return <>{children}</>
}

interface VerificationBadgeProps {
  isVerified: boolean
}

export function VerificationBadge({ isVerified }: VerificationBadgeProps) {
  if (isVerified) {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 font-medium text-green-800 text-sm">
        Student • Verified ✅
      </span>
    )
  }

  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-800 text-sm">
      Student (unverified)
    </span>
  )
}

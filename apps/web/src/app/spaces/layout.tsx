'use client'

import { useQuery } from '@tanstack/react-query'
import { redirect, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import SpacesLayout from '@/components/layout/spaces-layout'
import RoadmapFloatButton from '@/components/roadmap/roadmap-float-button'
import { authClient } from '@/lib/auth-client'
import { orpc } from '@/utils/orpc'

function Layout({ children }: LayoutProps<'/spaces'>) {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const { data: onboardingStatus } = useQuery(
    orpc.user.onboarding.getStatus.queryOptions({ refetchOnMount: 'always' })
  )

  useEffect(() => {
    if (!onboardingStatus) return

    if (!onboardingStatus.isVerified) {
      router.push('/verify')
      return
    }

    const hasCompletedProfile =
      typeof window === 'undefined'
        ? true
        : window.localStorage.getItem('profileCompleted') === 'true'

    if (onboardingStatus.needsOnboarding || !hasCompletedProfile) {
      router.push('/profile/complete')
    }
  }, [onboardingStatus, router])

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-gray-900 border-b-2" />
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <SpacesLayout>
      {children}
      <RoadmapFloatButton />
    </SpacesLayout>
  )
}

export default Layout

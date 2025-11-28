'use client'

import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { ProfileErrorBoundary } from '@/components/profile/error-boundary'
import { ProfilePageSkeleton } from '@/components/profile/loading-skeleton'
import { ProfileHero } from '@/components/profile/profile-hero'
import { ProfileTabs } from '@/components/profile/profile-tabs'
import { AboutTab } from '@/components/profile/tabs/about-tab'
import { AcademicsTab } from '@/components/profile/tabs/academics-tab'
import { ActivityTab } from '@/components/profile/tabs/activity-tab'
import { ClubsTab } from '@/components/profile/tabs/clubs-tab'
import { OverviewTab } from '@/components/profile/tabs/overview-tab'
import { SettingsTab } from '@/components/profile/tabs/settings-tab'
import { VerificationPrompt } from '@/components/profile/verification-prompt'
import { orpc } from '@/utils/orpc'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview')

  // Fetch profile info to get verification status
  const {
    data: profileInfo,
    isLoading,
    error
  } = useQuery(orpc.user.profile.info.queryOptions())

  // Handle tab changes from URL query params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tab = params.get('tab')
      if (tab) {
        setActiveTab(tab)
      }
    }
  }, [])

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('tab', tab)
      window.history.pushState({}, '', url.toString())
    }
  }

  if (isLoading) {
    return <ProfilePageSkeleton />
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <ProfileErrorBoundary>
          <div>Error loading profile</div>
        </ProfileErrorBoundary>
      </div>
    )
  }

  const isVerified = profileInfo?.studentStatusVerified ?? false

  return (
    <div className="min-h-screen bg-background pt-10 pb-20 sm:px-10">
      <main className="mx-auto max-w-4xl space-y-0 py-4 sm:py-6">
        {/* Hero Section - Always visible */}
        <ProfileHero isVerified={isVerified} />

        {/* Verification Prompt - Only if unverified */}
        {!isVerified && (
          <div className="px-4 pt-4">
            <VerificationPrompt />
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mt-4 sm:mt-6">
          <ProfileTabs activeTab={activeTab} onTabChange={handleTabChange} />
        </div>

        {/* Tab Content with Error Boundaries */}
        <div className="px-3 py-4 sm:px-4 sm:py-6">
          {activeTab === 'overview' && (
            <ProfileErrorBoundary>
              <OverviewTab />
            </ProfileErrorBoundary>
          )}
          {activeTab === 'about' && (
            <ProfileErrorBoundary>
              <AboutTab />
            </ProfileErrorBoundary>
          )}
          {activeTab === 'academics' && (
            <ProfileErrorBoundary>
              <AcademicsTab />
            </ProfileErrorBoundary>
          )}
          {activeTab === 'activity' && (
            <ProfileErrorBoundary>
              <ActivityTab />
            </ProfileErrorBoundary>
          )}
          {activeTab === 'clubs' && (
            <ProfileErrorBoundary>
              <ClubsTab />
            </ProfileErrorBoundary>
          )}
          {activeTab === 'settings' && (
            <ProfileErrorBoundary>
              <SettingsTab />
            </ProfileErrorBoundary>
          )}
        </div>
      </main>
    </div>
  )
}

'use client'

import { ProfileErrorBoundary } from '@web/components/profile/error-boundary'
import { ProfilePageSkeleton } from '@web/components/profile/loading-skeleton'
import { ProfileHero } from '@web/components/profile/profile-hero'
import { ProfileTabs } from '@web/components/profile/profile-tabs'
import { AboutTab } from '@web/components/profile/tabs/about-tab'
import { AcademicsTab } from '@web/components/profile/tabs/academics-tab'
import { ClubsTab } from '@web/components/profile/tabs/clubs-tab'
import { SettingsTab } from '@web/components/profile/tabs/settings-tab'
import { VerificationPrompt } from '@web/components/profile/verification-prompt'
import api, { useQuery } from '@web/lib/api-client'
import { useQueryState } from 'nuqs'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useQueryState('tab')

  const {
    data: profileDetails,
    isLoading,
    error
  } = useQuery(['user', 'profile', 'details'], () =>
    api.user.profile.details.get()
  )

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

  const isVerified = profileDetails?.studentStatusVerified ?? false

  return (
    <div className="min-h-screen bg-background pt-10 pb-20 sm:px-10">
      <main className="mx-auto max-w-4xl space-y-0 py-4 sm:py-6">
        {/* Hero Section - Always visible */}
        <ProfileHero />

        {/* Verification Prompt - Only if unverified */}
        {!isVerified && (
          <div className="px-4 pt-4">
            <VerificationPrompt />
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mt-4 sm:mt-6">
          <ProfileTabs
            activeTab={activeTab || 'overview'}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Tab Content with Error Boundaries */}
        <div className="px-3 py-4 sm:px-4 sm:py-6">
          {/* {activeTab === 'overview' && (
            <ProfileErrorBoundary>
              <OverviewTab />
            </ProfileErrorBoundary>
          )} */}
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
          {/* {activeTab === 'activity' && (
            <ProfileErrorBoundary>
              <ActivityTab />
            </ProfileErrorBoundary>
          )} */}
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

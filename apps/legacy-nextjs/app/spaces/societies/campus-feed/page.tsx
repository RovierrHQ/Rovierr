'use client'

import ClubPostFeed from '@web/components/clubs/societies/club-post-feed'
import ClubPostPromptCard from '@web/components/clubs/societies/club-post-prompt-card'

const CampusFeedPage = () => (
  <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
    <ClubPostPromptCard />
    <ClubPostFeed />
  </div>
)

export default CampusFeedPage

'use client'

import { Alert, AlertDescription } from '@rov/ui/components/alert'
import { AlertCircle } from 'lucide-react'
import ClubPostFeed from '@/components/clubs/societies/club-post-feed'
import ClubPostPromptCard from '@/components/clubs/societies/club-post-prompt-card'

const CampusFeedPage = () => {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <Alert className="isolate mb-4" variant="destructive">
        <AlertDescription className="flex items-center gap-2">
          <AlertCircle className="size-4" />
          This is a Demonstration only
        </AlertDescription>
      </Alert>
      <ClubPostPromptCard />
      <ClubPostFeed />
    </div>
  )
}

export default CampusFeedPage

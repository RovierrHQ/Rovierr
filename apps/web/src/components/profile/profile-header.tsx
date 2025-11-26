'use client'

import { Button } from '@rov/ui/components/button'
import { ArrowLeft, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ProfileHeader() {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button
            aria-label="Go back"
            onClick={() => router.back()}
            size="icon"
            variant="ghost"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-lg">Profile</h1>
        </div>

        <Button
          aria-label="Settings"
          onClick={() => {
            // Scroll to settings tab or navigate
            const settingsTab = document.querySelector(
              '[data-tab="settings"]'
            ) as HTMLElement
            settingsTab?.click()
          }}
          size="icon"
          variant="ghost"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}

export default ProfileHeader

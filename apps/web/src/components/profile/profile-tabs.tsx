'use client'

import { Button } from '@rov/ui/components/button'
import { cn } from '@rov/ui/lib/utils'
import {
  Activity,
  BookOpen,
  Info,
  LayoutGrid,
  Settings,
  Users
} from 'lucide-react'

interface ProfileTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'about', label: 'About', icon: Info },
  { id: 'academics', label: 'Academics', icon: BookOpen },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'clubs', label: 'Clubs', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings }
]

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="border-b">
      <div className="scrollbar-hide flex gap-1 overflow-x-auto px-2 sm:px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <Button
              className={cn(
                'flex items-center gap-2 rounded-none border-transparent border-b-2 px-3 py-3 transition-colors sm:px-4',
                'min-w-fit', // Ensure buttons don't shrink on mobile
                isActive &&
                  'border-primary text-primary hover:bg-transparent hover:text-primary'
              )}
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              variant="ghost"
            >
              <Icon className="h-4 w-4" />
              <span className="whitespace-nowrap text-sm sm:text-base">
                {tab.label}
              </span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}

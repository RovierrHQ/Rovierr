'use client'

import { cn } from '@rov/ui/lib/utils'
import { Briefcase, GraduationCap, Users, Wallet } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'
import type { Space } from '@/lib/types'

const spaces: Space[] = [
  {
    id: 'academics',
    name: 'Education & Academics',
    icon: GraduationCap,
    color: 'from-blue-500 to-cyan-500',
    description: 'Course lists, assignments, and study tools',
    path: '/spaces/academics'
  },
  {
    id: 'social',
    name: 'Social',
    icon: Users,
    color: 'from-purple-500 to-pink-500',
    description: 'Groups, contacts, and activities',
    path: '/spaces/social'
  },
  {
    id: 'career',
    name: 'Career',
    icon: Briefcase,
    color: 'from-emerald-500 to-teal-500',
    description: 'Professional development and opportunities',
    path: '/spaces/career'
  },
  {
    id: 'personal',
    name: 'Personal',
    icon: Wallet,
    color: 'from-amber-500 to-orange-500',
    description: 'Finance, health, and personal life management',
    path: '/spaces/personal'
  }
]

export function SpaceSwitcher({
  variant = 'default'
}: {
  variant?: 'default' | 'compact'
}) {
  const router = useRouter()
  const pathname = usePathname()

  const activeSpace =
    spaces.find((space) => space.path === pathname)?.id || 'summary'
  const [hoveredSpace, setHoveredSpace] = React.useState<string | null>(null)

  const handleSpaceClick = (space: Space) => {
    router.push(space.path)
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3">
        {spaces.map((space) => {
          const Icon = space.icon
          const isActive = activeSpace === space.id
          const isHovered = hoveredSpace === space.id

          return (
            <div className="relative" key={space.id}>
              <button
                className={cn(
                  'relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300',
                  'hover:scale-110',
                  isActive
                    ? 'border-primary bg-primary/10 shadow-md shadow-primary/20'
                    : 'border-border bg-card/50 hover:border-primary/50'
                )}
                onClick={() => handleSpaceClick(space)}
                onMouseEnter={() => setHoveredSpace(space.id)}
                onMouseLeave={() => setHoveredSpace(null)}
                type="button"
              >
                <Icon
                  className={cn(
                    'h-5 w-5 transition-colors duration-300',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
              </button>

              {isHovered && (
                <div className="fade-in slide-in-from-top-2 absolute top-12 right-0 z-50 animate-in duration-200">
                  <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
                    <p className="whitespace-nowrap font-medium text-popover-foreground text-xs">
                      {space.name}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex items-center gap-6">
        {spaces.map((space) => {
          const Icon = space.icon
          const isActive = activeSpace === space.id
          const isHovered = hoveredSpace === space.id

          return (
            <div className="relative flex flex-col items-center" key={space.id}>
              <button
                className={cn(
                  'relative flex h-20 w-20 items-center justify-center rounded-full border-2 transition-all duration-300',
                  'hover:scale-110 hover:shadow-lg hover:shadow-primary/20',
                  isActive
                    ? 'border-primary bg-primary/10 shadow-lg shadow-primary/30'
                    : 'border-border bg-card hover:border-primary/50'
                )}
                onClick={() => handleSpaceClick(space)}
                onMouseEnter={() => setHoveredSpace(space.id)}
                onMouseLeave={() => setHoveredSpace(null)}
                type="button"
              >
                <Icon
                  className={cn(
                    'h-8 w-8 transition-colors duration-300',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
                {isActive && (
                  <div className="-inset-1 absolute rounded-full bg-gradient-to-r from-primary/20 to-accent/20 blur-md" />
                )}
              </button>

              <div
                className={cn(
                  'absolute top-24 flex flex-col items-center transition-all duration-300',
                  isHovered || isActive
                    ? 'translate-y-0 opacity-100'
                    : 'pointer-events-none translate-y-2 opacity-0'
                )}
              >
                <div className="h-2 w-px bg-gradient-to-b from-border to-transparent" />
                <div className="mt-2 rounded-lg border border-border bg-card px-4 py-2 shadow-lg">
                  <p className="whitespace-nowrap font-medium text-foreground text-sm">
                    {space.name}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="text-center">
        <p className="text-muted-foreground text-sm">
          {spaces.find((s) => s.id === activeSpace)?.description}
        </p>
      </div>
    </div>
  )
}

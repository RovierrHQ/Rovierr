'use client'

import { Badge } from '@rov/ui/components/badge'
import { buttonVariants } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@rov/ui/components/dialog'
import { cn } from '@rov/ui/lib/utils'
import { Link } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import {
  AudioWaveform,
  BriefcaseBusiness,
  ChevronRight,
  GraduationCap,
  Lock,
  Sparkles,
  UserRound,
  Users
} from 'lucide-react'
import { cloneElement, type ReactElement, useState } from 'react'

type SpaceOption = {
  id: string
  name: string
  icon: LucideIcon
  color: string
  bgColor: string
  description: string
  plan: 'Free' | 'Startup' | 'Enterprise'
  url: string
  isLocked?: boolean
}

const spaceOptions: SpaceOption[] = [
  {
    id: 'personal',
    name: 'Personal',
    icon: UserRound,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: 'Your personal space for notes and tasks',
    plan: 'Free',
    url: '/spaces/personal'
  },
  {
    id: 'academics',
    name: 'Academics',
    icon: GraduationCap,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    description: 'Courses, assignments, and study groups',
    plan: 'Startup',
    url: '/spaces/academics'
  },
  {
    id: 'societies',
    name: 'Societies',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    description: 'Clubs, organizations, and campus events',
    plan: 'Free',
    url: '/spaces/societies'
  },
  {
    id: 'career',
    name: 'Career',
    icon: BriefcaseBusiness,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    description: 'Jobs, internships, and networking',
    plan: 'Free',
    url: '/spaces/career',
    isLocked: true
  },
  {
    id: 'social',
    name: 'Social',
    icon: AudioWaveform,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    description: 'Social activities and campus life',
    plan: 'Free',
    url: '/spaces/social',
    isLocked: true
  }
]

export function SneakPeekModal({ children }: { children: ReactElement }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      {cloneElement(children, {
        onClick: (event: unknown) => {
          if (typeof children.props.onClick === 'function') {
            children.props.onClick(event)
          }
          setOpen(true)
        }
      })}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-white" />
            <DialogTitle className="text-xl">Sneak Peek</DialogTitle>
          </div>
          <p className="text-muted-foreground text-sm">
            Upgrade to Startup plan to unlock all spaces
          </p>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {spaceOptions.map((space) => {
            const Icon = space.icon
            return (
              <Card
                className={`group relative overflow-hidden border-border p-4 transition-all hover:shadow-md ${
                  space.isLocked ? 'opacity-75' : ''
                }`}
                key={space.id}
              >
                <Link
                  className="flex items-center gap-4"
                  onClick={() => setOpen(false)}
                  to={space.url}
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${space.bgColor}`}
                  >
                    <Icon className={`h-6 w-6 ${space.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {space.name}
                      </h3>
                      <Badge
                        className="text-xs"
                        variant={
                          space.plan === 'Free' ? 'secondary' : 'default'
                        }
                      >
                        {space.plan}
                      </Badge>
                      {space.isLocked && (
                        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm truncate">
                      {space.description}
                    </p>
                  </div>

                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </Link>
              </Card>
            )
          })}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-muted-foreground text-sm">
            Upgrade to unlock premium features
          </p>
          <Link
            className={cn(buttonVariants({}))}
            onClick={() => setOpen(false)}
            to="/pricing"
          >
            Upgrade Now
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}

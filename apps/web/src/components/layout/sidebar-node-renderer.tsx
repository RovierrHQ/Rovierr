import { Badge } from '@rov/ui/components/badge'
import { buttonVariants } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@rov/ui/components/dialog'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@rov/ui/components/sidebar'
import { cn } from '@rov/ui/lib/utils'
import { Link } from '@tanstack/react-router'
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
import { useState } from 'react'
import type { SidebarNode } from './use-space-sidebar-items'

type SidebarNodeRendererProps = {
  node: SidebarNode
}

const spaceOptions = [
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

export default function SidebarNodeRenderer({
  node
}: SidebarNodeRendererProps) {
  const [sneakPeekOpen, setSneakPeekOpen] = useState(false)
  const isAcademicsStartup = node.title === 'Academics'

  if (node.type === 'group-header') {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>{node.title}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {node.children?.map((child) => (
              <SidebarNodeRenderer key={child.id} node={child} />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  if (node.type === 'collapsible') {
    const Icon = node.icon

    if (isAcademicsStartup) {
      return (
        <>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="w-full justify-between"
              onClick={() => setSneakPeekOpen(true)}
            >
              <div className="flex items-center gap-2">
                {Icon && <Icon className="h-4 w-4" />}
                <span>{node.title}</span>
              </div>
              <Sparkles className="h-3 w-3 text-white" />
            </SidebarMenuButton>
          </SidebarMenuItem>

          <Dialog onOpenChange={setSneakPeekOpen} open={sneakPeekOpen}>
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
                  const SpaceIcon = space.icon
                  return (
                    <Card
                      className={`group relative overflow-hidden border-border p-4 transition-all hover:shadow-md ${
                        space.isLocked ? 'opacity-75' : ''
                      }`}
                      key={space.id}
                    >
                      <Link
                        className="flex items-center gap-4"
                        onClick={() => setSneakPeekOpen(false)}
                        to={space.url}
                      >
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${space.bgColor}`}
                        >
                          <SpaceIcon className={`h-6 w-6 ${space.color}`} />
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
                  onClick={() => setSneakPeekOpen(false)}
                  // to="/pricing"
                  to="/"
                >
                  Upgrade Now
                </Link>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )
    }

    return (
      <SidebarMenuItem>
        <details className="group/collapsible">
          <summary className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-accent">
            {Icon && <Icon className="h-4 w-4" />}
            <span>{node.title}</span>
            <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-open/collapsible:rotate-90" />
          </summary>
          <div className="mt-1 space-y-1 pl-4">
            {node.children?.map((child) => (
              <SidebarNodeRenderer key={child.id} node={child} />
            ))}
          </div>
        </details>
      </SidebarMenuItem>
    )
  }

  if (node.type === 'item') {
    const Icon = node.icon
    return (
      <SidebarMenuItem>
        <Link
          className="flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-accent"
          to={node.url || '#'}
        >
          {Icon && <Icon className="h-4 w-4" />}
          <span>{node.title}</span>
        </Link>
      </SidebarMenuItem>
    )
  }

  if (node.type === 'empty-state') {
    return (
      <SidebarMenuItem>
        <div className="px-2 py-1">
          <div className="rounded-md bg-muted/50 p-3">
            <p className="mb-3 text-sm text-muted-foreground">
              {node.emptyStateMessage}
            </p>
            <div className="flex flex-col gap-2">
              {node.emptyStateActions?.map((action) => {
                const ActionIcon = action.icon
                return (
                  <Link
                    className="inline-flex items-center justify-start gap-2 rounded-md border border-border bg-background px-3 py-1 text-sm hover:bg-accent"
                    key={action.label}
                    to={action.url}
                  >
                    {ActionIcon && <ActionIcon className="h-4 w-4" />}
                    {action.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </SidebarMenuItem>
    )
  }

  return null
}

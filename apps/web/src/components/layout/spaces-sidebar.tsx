'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '@rov/ui/components/sidebar'
import {
  AudioWaveform,
  BookOpen,
  Bot,
  BriefcaseBusiness,
  Frame,
  GalleryVerticalEnd,
  GraduationCap,
  MapIcon,
  PieChart,
  Settings2,
  SquareTerminal,
  UserRound
} from 'lucide-react'
import type * as React from 'react'
import { NavMain } from '@/components/layout/nav-main'
import { NavProjects } from '@/components/layout/nav-projects'
import { NavUser } from '@/components/layout/nav-user'
import { SpaceSwitcher } from '@/components/layout/space-switcher'

// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg'
  },
  spaces: [
    {
      name: 'Dashboard',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
      url: '/spaces'
    },
    {
      name: 'Academics',
      logo: GraduationCap,
      plan: 'Startup',
      url: '/spaces/academics'
    },
    {
      name: 'Social',
      logo: AudioWaveform,
      plan: 'Free',
      url: '/spaces/social'
    },
    {
      name: 'Personal',
      logo: UserRound,
      plan: 'Free',
      url: '/spaces/personal'
    },
    {
      name: 'Career',
      logo: BriefcaseBusiness,
      plan: 'Free',
      url: '/spaces/career'
    }
  ],
  navMain: [
    {
      title: 'Playground',
      url: '#',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: 'History',
          url: '#'
        },
        {
          title: 'Starred',
          url: '#'
        },
        {
          title: 'Settings',
          url: '#'
        }
      ]
    },
    {
      title: 'Models',
      url: '#',
      icon: Bot,
      items: [
        {
          title: 'Genesis',
          url: '#'
        },
        {
          title: 'Explorer',
          url: '#'
        },
        {
          title: 'Quantum',
          url: '#'
        }
      ]
    },
    {
      title: 'Documentation',
      url: '#',
      icon: BookOpen,
      items: [
        {
          title: 'Introduction',
          url: '#'
        },
        {
          title: 'Get Started',
          url: '#'
        },
        {
          title: 'Tutorials',
          url: '#'
        },
        {
          title: 'Changelog',
          url: '#'
        }
      ]
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '#'
        },
        {
          title: 'Team',
          url: '#'
        },
        {
          title: 'Billing',
          url: '#'
        },
        {
          title: 'Limits',
          url: '#'
        }
      ]
    }
  ],
  projects: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: Frame
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: PieChart
    },
    {
      name: 'Travel',
      url: '#',
      icon: MapIcon
    }
  ]
}

export function SpacesSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SpaceSwitcher spaces={data.spaces} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '@rov/ui/components/sidebar'
import { usePathname, useRouter } from 'next/navigation'

import { type ComponentProps, useEffect } from 'react'
import { NavMain } from '@/components/layout/nav-main'
import { NavProjects } from '@/components/layout/nav-projects'
import { NavUser } from '@/components/layout/nav-user'
import { SpaceSwitcher } from '@/components/layout/space-switcher'
import { navMain, projects, spaces } from '@/data/space-sidebar-data'

export function SpacesSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const activeSpaces = spaces.filter(
      (space) => space.isActive && pathname.includes(space.url)
    )
    if (!activeSpaces.length) router.push('/spaces')
  }, [router.push, pathname.includes])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SpaceSwitcher spaces={spaces} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

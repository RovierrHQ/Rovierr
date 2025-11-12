'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '@rov/ui/components/sidebar'
import { usePathname, useRouter } from 'next/navigation'

import { type ComponentProps, useEffect, useState } from 'react'
import { NavProjects } from '@/components/layout/nav-projects'
import { NavUser } from '@/components/layout/nav-user'
import { SpaceSwitcher } from '@/components/layout/space-switcher'
import { projects, spaces } from '@/data/space-sidebar-data'
import type { ISpacesChildrenItems } from '@/types/types-space-sidebar-data'
import SpacesNav from './spaces-nav'

export function SpacesSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const [currentSpaceChildren, setCurrentSpaceChildren] = useState<
    ISpacesChildrenItems[]
  >([])
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const activeSpaces = spaces.filter(
      (space) => space.isActive && pathname.includes(space.url)
    )

    if (!activeSpaces.length) router.push('/spaces/clubs')

    setCurrentSpaceChildren(
      activeSpaces.find((space) => space.url === pathname)?.childrenItems || []
    )
  }, [router.push, pathname])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SpaceSwitcher spaces={spaces} />
      </SidebarHeader>
      <SidebarContent>
        <SpacesNav spacesChildrenItems={currentSpaceChildren} />
        <NavProjects projects={projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

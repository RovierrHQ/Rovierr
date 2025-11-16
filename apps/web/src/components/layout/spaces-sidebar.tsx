'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '@rov/ui/components/sidebar'
import type { ComponentProps } from 'react'
import { NavUser } from '@/components/layout/nav-user'
import { SpaceSwitcher } from '@/components/layout/space-switcher'
import { spaces } from '@/data/space-sidebar-data'
import SidebarNodeRenderer from './sidebar-node-renderer'
import { useSpaceSidebarItems } from './use-space-sidebar-items'

function SpacesSidebarContent({ ...props }: ComponentProps<typeof Sidebar>) {
  const { sidebarTree } = useSpaceSidebarItems()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SpaceSwitcher spaces={spaces} />
      </SidebarHeader>
      <SidebarContent>
        {sidebarTree?.nodes.map((node) => (
          <SidebarNodeRenderer key={node.id} node={node} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export function SpacesSidebar(props: ComponentProps<typeof Sidebar>) {
  return <SpacesSidebarContent {...props} />
}

'use client'

import type { SidebarTree } from '@web/components/layout/use-space-sidebar-items'
import { useSpaceSidebarItems } from '@web/components/layout/use-space-sidebar-items'
import { spaces } from '@web/data/space-sidebar-data'
import { useEffect } from 'react'

export default function ProfileSidebarSetup() {
  const { setSidebarTree } = useSpaceSidebarItems()

  // Set sidebar tree to show all spaces when on profile page
  useEffect(() => {
    const sidebarTree: SidebarTree = {
      nodes: spaces.map((space) => ({
        id: `space-${space.name.toLowerCase()}`,
        title: space.name,
        type: 'item',
        url: space.url,
        icon: space.logo,
        isActive: space.isActive
      }))
    }
    setSidebarTree(sidebarTree)

    // Cleanup: don't reset on unmount, let other layouts set their own trees
  }, [setSidebarTree])

  return null
}

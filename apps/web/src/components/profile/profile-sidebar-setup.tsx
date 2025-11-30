'use client'

import { useEffect } from 'react'
import type { SidebarTree } from '@/components/layout/use-space-sidebar-items'
import { useSpaceSidebarItems } from '@/components/layout/use-space-sidebar-items'
import { spaces } from '@/data/space-sidebar-data'

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

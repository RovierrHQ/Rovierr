'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { careerSidebarNodes } from '@/components/career/career-sidebar-config'
import type { SidebarTree } from '@/components/layout/use-space-sidebar-items'
import { useSpaceSidebarItems } from '@/components/layout/use-space-sidebar-items'

const CareerLayout = ({ children }: { children: ReactNode }) => {
  const { setSidebarTree } = useSpaceSidebarItems()
  const pathname = usePathname()

  useEffect(() => {
    // Update sidebar nodes with active state based on current pathname
    const updatedNodes = careerSidebarNodes.map((node) => ({
      ...node,
      isActive: pathname === node.url
    }))

    // Build the sidebar tree
    const sidebarTree: SidebarTree = {
      nodes: updatedNodes
    }

    setSidebarTree(sidebarTree)
  }, [setSidebarTree, pathname])

  return <>{children}</>
}

export default CareerLayout

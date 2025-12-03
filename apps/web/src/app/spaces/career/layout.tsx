'use client'

import { Briefcase, FileText, GraduationCap, Home } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import type { SidebarTree } from '@/components/layout/use-space-sidebar-items'
import { useSpaceSidebarItems } from '@/components/layout/use-space-sidebar-items'

const CareerLayout = ({ children }: { children: ReactNode }) => {
  const { setSidebarTree } = useSpaceSidebarItems()
  const lastUpdateRef = useRef<string>('')

  useEffect(() => {
    // Create a stable key to detect changes
    const updateKey = 'career-sidebar-v1'

    // Skip if already set
    if (updateKey === lastUpdateRef.current) {
      return
    }

    lastUpdateRef.current = updateKey

    // Build the entire sidebar tree
    const sidebarTree: SidebarTree = {
      nodes: [
        // Dashboard - top level item
        {
          id: 'career-dashboard',
          title: 'Dashboard',
          type: 'item',
          url: '/spaces/career',
          icon: Home
        },
        // Resume Builder - top level item
        {
          id: 'resume-builder',
          title: 'Resume Builder',
          type: 'item',
          url: '/spaces/career/resume-builder',
          icon: FileText
        },
        {
          id: 'my-applications',
          title: 'My Applications',
          type: 'item',
          url: '/spaces/career/applications',
          icon: Briefcase
        },
        // Discover group
        {
          id: 'discover-group',
          title: 'Discover',
          type: 'group-header',
          children: [
            {
              id: 'internship',
              title: 'Internship',
              type: 'item',
              url: '/spaces/career/internship',
              icon: Briefcase
            },
            {
              id: 'tuition',
              title: 'Tuition',
              type: 'item',
              url: '/spaces/career/tuition',
              icon: GraduationCap
            }
          ]
        }
      ]
    }

    setSidebarTree(sidebarTree)
  }, [setSidebarTree])

  return <div>{children}</div>
}

export default CareerLayout

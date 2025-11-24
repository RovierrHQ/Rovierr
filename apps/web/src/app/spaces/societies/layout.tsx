'use client'

import { Calendar, Compass, Home, Network, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import type {
  SidebarNode,
  SidebarTree
} from '@/components/layout/use-space-sidebar-items'
import { useSpaceSidebarItems } from '@/components/layout/use-space-sidebar-items'
import { authClient } from '@/lib/auth-client'

const SocietiesLayout = ({ children }: { children: ReactNode }) => {
  const { setSidebarTree } = useSpaceSidebarItems()
  const { data: organizations, isPending } = authClient.useListOrganizations()
  useEffect(() => {
    // Don't update sidebar while data is still loading
    if (isPending) {
      return
    }

    // Map organizations from better-auth to the format expected by sidebar
    // Only show empty state if data has loaded (not undefined) and there are no organizations
    const joinedSocieties: Array<{ id: string; name: string }> =
      organizations?.map((org) => ({
        id: org.id,
        name: org.name
      })) ?? []

    // Build society nodes with sub-items
    const societyNodes: SidebarNode[] = joinedSocieties.map((society) => ({
      id: `society-${society.id}`,
      title: society.name,
      type: 'collapsible',
      url: `/spaces/societies/mine/${society.id}`,
      icon: Users,
      isActive: false,
      children: [
        {
          id: `society-${society.id}-discussion`,
          title: 'Discussion',
          type: 'item',
          url: `/spaces/societies/mine/${society.id}/discussion`
        },
        {
          id: `society-${society.id}-tasks`,
          title: 'Tasks',
          type: 'item',
          url: `/spaces/societies/mine/${society.id}/tasks`
        },
        {
          id: `society-${society.id}-expenses`,
          title: 'Expense Tracking',
          type: 'item',
          url: `/spaces/societies/mine/${society.id}/expenses`
        },
        {
          id: `society-${society.id}-email`,
          title: 'Email',
          type: 'item',
          url: `/spaces/societies/mine/${society.id}/email`
        },
        {
          id: `society-${society.id}-members`,
          title: 'Members',
          type: 'item',
          url: `/spaces/societies/mine/${society.id}/members`
        },
        {
          id: `society-${society.id}-teams`,
          title: 'Teams',
          type: 'item',
          url: `/spaces/societies/mine/${society.id}/teams`
        }
      ]
    }))

    // Build My Societies group children - either societies or empty state
    // At this point, isPending is false, so organizations is either an array or undefined
    // If it's an array with items, show societies; if empty array, show empty state
    const mySocietiesChildren: SidebarNode[] =
      organizations && organizations.length > 0
        ? societyNodes
        : [
            {
              id: 'no-societies-empty-state',
              title: "You haven't joined any societies yet",
              type: 'empty-state',
              emptyStateMessage: "You haven't joined any societies yet",
              emptyStateActions: [
                {
                  label: 'Join an existing society',
                  url: '/spaces/societies/discover/browse-clubs'
                },
                {
                  label: 'Create a new society',
                  url: '/spaces/societies/create'
                }
              ]
            }
          ]

    // Build the entire sidebar tree
    const sidebarTree: SidebarTree = {
      nodes: [
        // Campus Feed - top level item
        {
          id: 'campus-feed',
          title: 'Campus Feed',
          type: 'item',
          url: '/spaces/societies/campus-feed',
          icon: Home
        },
        // My Societies group
        {
          id: 'my-societies-group',
          title: 'My Societies',
          type: 'group-header',
          url: '/spaces/societies/mine',
          children: mySocietiesChildren
        },
        // Discover group
        {
          id: 'discover-group',
          title: 'Discover',
          type: 'group-header',
          children: [
            {
              id: 'browse-societies',
              title: 'Browse Societies',
              type: 'item',
              url: '/spaces/societies/discover/browse-clubs',
              icon: Compass
            },
            {
              id: 'events',
              title: 'Events',
              type: 'item',
              url: '/spaces/societies/discover/events',
              icon: Calendar
            },
            {
              id: 'network',
              title: 'Network',
              type: 'item',
              url: '/spaces/societies/discover/network',
              icon: Network
            }
          ]
        }
      ]
    }

    setSidebarTree(sidebarTree)

    // Cleanup: reset to null when component unmounts
    return () => {
      setSidebarTree(null)
    }
  }, [setSidebarTree, organizations, isPending])

  return <div>{children}</div>
}

export default SocietiesLayout

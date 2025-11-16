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

const ClubsLayout = ({ children }: { children: ReactNode }) => {
  const { setSidebarTree } = useSpaceSidebarItems()
  const { data: organizations } = authClient.useListOrganizations()

  useEffect(() => {
    // Map organizations from better-auth to the format expected by sidebar
    const joinedClubs: Array<{ id: string; name: string }> =
      organizations?.map((org) => ({
        id: org.id,
        name: org.name
      })) ?? []

    // Build club nodes with sub-items
    const clubNodes: SidebarNode[] = joinedClubs.map((club) => ({
      id: `club-${club.id}`,
      title: club.name,
      type: 'collapsible',
      url: `/spaces/clubs/joined/${club.id}`,
      icon: Users,
      isActive: false,
      children: [
        {
          id: `club-${club.id}-discussion`,
          title: 'Discussion',
          type: 'item',
          url: `/spaces/clubs/joined/${club.id}/discussion`
        },
        {
          id: `club-${club.id}-tasks`,
          title: 'Tasks',
          type: 'item',
          url: `/spaces/clubs/joined/${club.id}/tasks`
        },
        {
          id: `club-${club.id}-expenses`,
          title: 'Expense Tracking',
          type: 'item',
          url: `/spaces/clubs/joined/${club.id}/expenses`
        },
        {
          id: `club-${club.id}-email`,
          title: 'Email',
          type: 'item',
          url: `/spaces/clubs/joined/${club.id}/email`
        },
        {
          id: `club-${club.id}-members`,
          title: 'Members',
          type: 'item',
          url: `/spaces/clubs/joined/${club.id}/members`
        }
      ]
    }))

    // Build My Clubs group children - either clubs or empty state
    const myClubsChildren: SidebarNode[] =
      joinedClubs.length > 0
        ? clubNodes
        : [
            {
              id: 'no-clubs-empty-state',
              title: "You haven't joined any clubs yet",
              type: 'empty-state',
              emptyStateMessage: "You haven't joined any clubs yet",
              emptyStateActions: [
                {
                  label: 'Join an existing club',
                  url: '/spaces/clubs/discover/browse-clubs'
                },
                {
                  label: 'Create a new club',
                  url: '/spaces/clubs/create'
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
          url: '/spaces/clubs/campus-feed',
          icon: Home
        },
        // My Clubs group
        {
          id: 'my-clubs-group',
          title: 'My Clubs',
          type: 'group-header',
          children: myClubsChildren
        },
        // Discover group
        {
          id: 'discover-group',
          title: 'Discover',
          type: 'group-header',
          children: [
            {
              id: 'browse-clubs',
              title: 'Browse Clubs',
              type: 'item',
              url: '/spaces/clubs/discover/browse-clubs',
              icon: Compass
            },
            {
              id: 'events',
              title: 'Events',
              type: 'item',
              url: '/spaces/clubs/discover/events',
              icon: Calendar
            },
            {
              id: 'network',
              title: 'Network',
              type: 'item',
              url: '/spaces/clubs/discover/network',
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
  }, [setSidebarTree, organizations])

  return <div>{children}</div>
}

export default ClubsLayout

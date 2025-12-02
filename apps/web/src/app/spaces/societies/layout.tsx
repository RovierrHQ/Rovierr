'use client'

import { Calendar, Compass, Home, Network, Plus, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import type {
  SidebarNode,
  SidebarTree
} from '@/components/layout/use-space-sidebar-items'
import { useSpaceSidebarItems } from '@/components/layout/use-space-sidebar-items'
import { authClient } from '@/lib/auth-client'

const SocietiesLayout = ({ children }: { children: ReactNode }) => {
  const { setSidebarTree } = useSpaceSidebarItems()
  const { data: organizations, isPending } = authClient.useListOrganizations()
  const lastOrganizationsRef = useRef<string>('')
  const lastPermissionsMapRef = useRef<string>('')
  const [permissionsMap, setPermissionsMap] = useState<Map<string, boolean>>(
    new Map()
  )
  const [permissionsLoading, setPermissionsLoading] = useState(true)

  // Check permissions for all organizations
  useEffect(() => {
    if (!organizations || organizations.length === 0) {
      setPermissionsMap(new Map())
      setPermissionsLoading(false)
      return
    }

    const checkPermissions = async () => {
      setPermissionsLoading(true)
      const permissionPromises = organizations.map(async (org) => {
        try {
          const result = await authClient.organization.hasPermission({
            permissions: {
              organization: ['update']
            },
            organizationId: org.id
          })
          // Check the result structure - it should have data.success
          const hasPermission = result?.data?.success === true

          return {
            id: org.id,
            hasPermission
          }
        } catch {
          return { id: org.id, hasPermission: false }
        }
      })

      const results = await Promise.all(permissionPromises)

      const newMap = new Map<string, boolean>()
      for (const { id, hasPermission } of results) {
        newMap.set(id, hasPermission)
      }

      setPermissionsMap(newMap)
      setPermissionsLoading(false)
      // Force sidebar rebuild by clearing the last orgs key
      lastOrganizationsRef.current = ''
    }

    checkPermissions()
  }, [organizations])

  useEffect(() => {
    // Don't update sidebar while data is still loading or permissions are loading
    if (isPending || permissionsLoading) {
      return
    }

    // Don't build sidebar if we have organizations but permissions map is empty
    // This means permissions haven't been checked yet
    if (
      organizations &&
      organizations.length > 0 &&
      permissionsMap.size === 0
    ) {
      return
    }

    // Create a stable key from organizations to detect actual changes
    const orgsKey = JSON.stringify(
      organizations?.map((org) => ({ id: org.id, name: org.name })) ?? []
    )

    // Create a key for permissions map to detect changes
    const permissionsKey = JSON.stringify(Array.from(permissionsMap.entries()))

    // Skip if both organizations and permissions haven't changed
    if (
      orgsKey === lastOrganizationsRef.current &&
      permissionsKey === lastPermissionsMapRef.current
    ) {
      return
    }

    lastOrganizationsRef.current = orgsKey
    lastPermissionsMapRef.current = permissionsKey

    // Map organizations from better-auth to the format expected by sidebar
    // Only show empty state if data has loaded (not undefined) and there are no organizations
    const joinedSocieties: Array<{ id: string; name: string }> =
      organizations?.map((org) => ({
        id: org.id,
        name: org.name
      })) ?? []

    // Build society nodes with sub-items
    const societyNodes: SidebarNode[] = joinedSocieties.map((societyItem) => {
      const hasUpdatePermission = permissionsMap.get(societyItem.id) ?? false

      const menuItems: SidebarNode[] = [
        {
          id: `society-${societyItem.id}-discussion`,
          title: 'Discussion',
          type: 'item',
          url: `/spaces/societies/mine/${societyItem.id}/discussion`
        },
        {
          id: `society-${societyItem.id}-members`,
          title: 'Members',
          type: 'item',
          url: `/spaces/societies/mine/${societyItem.id}/members`
        }
      ]

      // Only show admin-only items if user has update permission
      if (hasUpdatePermission) {
        menuItems.push(
          {
            id: `society-${societyItem.id}-tasks`,
            title: 'Tasks',
            type: 'item',
            url: `/spaces/societies/mine/${societyItem.id}/tasks`
          },
          {
            id: `society-${societyItem.id}-expenses`,
            title: 'Expense Tracking',
            type: 'item',
            url: `/spaces/societies/mine/${societyItem.id}/expenses`
          },
          {
            id: `society-${societyItem.id}-email`,
            title: 'Email',
            type: 'item',
            url: `/spaces/societies/mine/${societyItem.id}/email`
          },
          {
            id: `society-${societyItem.id}-teams`,
            title: 'Teams',
            type: 'item',
            url: `/spaces/societies/mine/${societyItem.id}/teams`
          }
        )
      }

      return {
        id: `society-${societyItem.id}`,
        title: societyItem.name,
        type: 'collapsible',
        url: `/spaces/societies/mine/${societyItem.id}`,
        icon: Users,
        isActive: false,
        children: menuItems
      }
    })

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
                  url: '/spaces/societies/discover/browse-clubs',
                  icon: Compass
                },
                {
                  label: 'Create a new society',
                  url: '/spaces/societies/create',
                  icon: Plus
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

    // Don't reset sidebar tree on unmount - preserve it for navigation to other pages like /profile
    // The sidebar tree will be updated when navigating to a different space that needs its own sidebar
  }, [
    setSidebarTree,
    organizations,
    isPending,
    permissionsMap,
    permissionsLoading
  ])

  return <div>{children}</div>
}

export default SocietiesLayout

import {
  createFileRoute,
  Outlet,
  useLocation,
  useRouter
} from '@tanstack/react-router'
import SpacesLayout from '@web/components/layout/spaces-layout'
import type {
  SidebarNode,
  SidebarTree
} from '@web/components/layout/use-space-sidebar-items'
import { useSpaceSidebarItems } from '@web/components/layout/use-space-sidebar-items'
import RoadmapFloatButton from '@web/components/roadmap/roadmap-float-button'
import { spaces } from '@web/data/space-sidebar-data'
import { authClient } from '@web/lib/auth-client'
import { Users } from 'lucide-react'
import { useEffect, useRef } from 'react'

export const Route = createFileRoute('/spaces')({
  component: SpacesLayoutWrapper
})

function SpacesSidebarSetup() {
  const { data: organizations } = authClient.useListOrganizations()
  const { setSidebarTree } = useSpaceSidebarItems()
  const lastOrganizationsRef = useRef<string>('')

  // Set up sidebar with spaces and societies
  useEffect(() => {
    if (!organizations) return

    const orgsKey = JSON.stringify(
      organizations.map((org) => ({ id: org.id, name: org.name }))
    )

    if (orgsKey === lastOrganizationsRef.current) return
    lastOrganizationsRef.current = orgsKey

    // Build main spaces nodes
    const spacesNodes: SidebarNode[] = spaces.map((space) => {
      if (space.name === 'Academics') {
        // Insert societies under Academics
        const societyNodes: SidebarNode[] = organizations.map((org) => ({
          id: `society-${org.id}`,
          title: org.name,
          type: 'item' as const,
          url: `/spaces/societies/mine/${org.id}`,
          icon: Users,
          isActive: false
        }))

        return {
          id: space.name.toLowerCase(),
          title: space.name,
          type: 'collapsible' as const,
          url: space.url,
          icon: space.logo,
          isActive: space.isActive,
          children: [
            ...societyNodes,
            ...(space.childrenItems?.map((item) => ({
              id: item.title.toLowerCase().replace(/\s+/g, '-'),
              title: item.title,
              type: 'item' as const,
              url: item.url,
              icon: item.icon,
              isActive: item.isActive
            })) || [])
          ]
        }
      }

      return {
        id: space.name.toLowerCase(),
        title: space.name,
        type: space.childrenItems ? 'collapsible' : 'item',
        url: space.url,
        icon: space.logo,
        isActive: space.isActive,
        children: space.childrenItems?.map((item) => ({
          id: item.title.toLowerCase().replace(/\s+/g, '-'),
          title: item.title,
          type: 'item' as const,
          url: item.url,
          icon: item.icon,
          isActive: item.isActive,
          children: item.items?.map((subItem) => ({
            id: subItem.title.toLowerCase().replace(/\s+/g, '-'),
            title: subItem.title,
            type: 'item' as const,
            url: subItem.url,
            isActive: false
          }))
        }))
      }
    })

    const sidebarTree: SidebarTree = {
      nodes: spacesNodes
    }

    setSidebarTree(sidebarTree)
  }, [organizations, setSidebarTree])

  return null
}

function SpacesLayoutWrapper() {
  const { data: session, isPending } = authClient.useSession()
  const router = useRouter()
  const location = useLocation()

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-gray-900 border-b-2" />
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    router.navigate({ to: '/login' })
    return null
  }

  // Temporarily remove isVerified check for Google OAuth users
  // if (!session.user.isVerified) {
  //   router.navigate({ to: '/profile' })
  //   return null
  // }

  const pathname = location.pathname
  const showHeader = !(
    pathname?.startsWith('/spaces/academics') ||
    pathname?.startsWith('/spaces/career')
  )

  return (
    <SpacesLayout showHeader={showHeader}>
      <SpacesSidebarSetup />
      <Outlet />
      <RoadmapFloatButton />
    </SpacesLayout>
  )
}

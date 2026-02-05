'use client'

import SpacesLayout from '@web/components/layout/spaces-layout'
import RoadmapFloatButton from '@web/components/roadmap/roadmap-float-button'
import { authClient } from '@web/lib/auth-client'
import { redirect, usePathname } from 'next/navigation'

function Layout({ children }: LayoutProps<'/spaces'>) {
  const { data: session, isPending } = authClient.useSession()
  const pathname = usePathname()

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
    redirect('/login')
  }

  if (!session.user.isVerified) {
    redirect('/profile')
  }
  return (
    <SpacesLayout
      showHeader={
        !(
          pathname?.startsWith('/spaces/academics') ||
          pathname?.startsWith('/spaces/career')
        )
      }
    >
      {children}
      <RoadmapFloatButton />
    </SpacesLayout>
  )
}

export default Layout

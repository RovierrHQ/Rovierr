'use client'

import { redirect, usePathname } from 'next/navigation'
import SpacesLayout from '@/components/layout/spaces-layout'
import RoadmapFloatButton from '@/components/roadmap/roadmap-float-button'
import { authClient } from '@/lib/auth-client'

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
    <SpacesLayout showHeader={!pathname?.startsWith('/spaces/academics')}>
      {children}
      <RoadmapFloatButton />
    </SpacesLayout>
  )
}

export default Layout

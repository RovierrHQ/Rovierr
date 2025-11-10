'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import SpacesLayout from '@/components/layout/spaces-layout'
import RoadmapFloatButton from '@/components/roadmap/roadmap-float-button'
import { authClient } from '@/lib/auth-client'

function Layout({ children }: LayoutProps<'/spaces'>) {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  useEffect(() => {
    if (!(session || isPending)) {
      router.push('/login')
    }
  }, [session, isPending, router.push])
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
  return (
    <SpacesLayout>
      {children}
      <RoadmapFloatButton />
    </SpacesLayout>
  )
}

export default Layout

'use client'

import { redirect } from 'next/navigation'
import SpacesLayout from '@/components/layout/spaces-layout'
import { authClient } from '@/lib/auth-client'

function Layout({ children }: LayoutProps<'/spaces'>) {
  const { data: session, isPending } = authClient.useSession()

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
  return <SpacesLayout>{children}</SpacesLayout>
}

export default Layout

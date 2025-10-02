'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { authClient } from '@/lib/auth-client'

function SpacesLayout({ children }: LayoutProps<'/spaces'>) {
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
  return <div>{children}</div>
}

export default SpacesLayout

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
  return <div>{children}</div>
}

export default SpacesLayout

'use client'

import { redirect } from 'next/navigation'
import ProfilePage from '@/components/profile'
import { authClient } from '@/lib/auth-client'

export default function Page() {
  const { data, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!data?.user) {
    redirect('/')
  }

  return <ProfilePage />
}

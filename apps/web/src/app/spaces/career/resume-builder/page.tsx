'use client'

import ResumeList from '@/components/resume/resume-list-view'
import { authClient } from '@/lib/auth-client'

function ResumeListPage() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Please sign in to access the resume builder.</p>
      </div>
    )
  }

  return <ResumeList />
}

export default ResumeListPage

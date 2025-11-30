'use client'

import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { orpc } from '@/utils/orpc'

export default function AcademicsPage() {
  const router = useRouter()

  // Check enrollment status
  const { data: enrollmentStatus, isLoading } = useQuery(
    orpc.academic.enrollment.getEnrollmentStatus.queryOptions({
      input: {}
    })
  )

  useEffect(() => {
    if (!isLoading && enrollmentStatus) {
      if (enrollmentStatus.hasProgram && enrollmentStatus.hasCourses) {
        // Redirect to dashboard if enrolled
        router.push('/spaces/academics/dashboard')
      } else {
        // Redirect to onboarding if not enrolled
        router.push('/spaces/academics/onboarding')
      }
    }
  }, [enrollmentStatus, isLoading, router])

  // Show loading state while checking enrollment
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">Loading Academic Space...</p>
      </div>
    </div>
  )
}

'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@rov/ui/components/select'
import { useQuery } from '@tanstack/react-query'
import { GraduationCap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { orpc } from '@/utils/orpc'

export const AcademicHeader = () => {
  const router = useRouter()
  const {
    data: enrollment,
    isLoading,
    error
  } = useQuery(
    orpc.academic.enrollment.getEnrollment.queryOptions({ input: {} })
  )

  const [selectedTerm, setSelectedTerm] = useState(enrollment?.term.id ?? '')

  // Redirect to onboarding if not enrolled
  useEffect(() => {
    if (!isLoading && (error || !enrollment)) {
      router.push('/spaces/academics/onboarding')
    }
  }, [error, enrollment, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-between gap-8 px-4 py-2">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  // Show not enrolled message while redirecting
  if (error || !enrollment) {
    return (
      <div className="flex items-center justify-between gap-8 px-4 py-2">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Not Enrolled</span>
            <span className="text-muted-foreground text-xs">
              Redirecting to onboarding...
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-8 px-4 py-2">
      {/* Left: Current Program */}
      <div className="flex gap-2">
        <GraduationCap className="h-5 w-5 text-muted-foreground" />
        <div className="flex flex-col">
          <span className="font-semibold text-sm">
            {enrollment.program.code || enrollment.program.name}
          </span>
          <span className="text-muted-foreground text-xs">
            {enrollment.program.name}
          </span>
        </div>
      </div>

      {/* Right: Term Switcher */}
      <div className="flex items-center gap-2">
        <Select onValueChange={setSelectedTerm} value={selectedTerm}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={enrollment.term.id}>
              {enrollment.term.termName} {enrollment.term.academicYear}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

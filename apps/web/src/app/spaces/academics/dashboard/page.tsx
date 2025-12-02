'use client'

import { Button } from '@rov/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, Calendar, MessageSquare, Settings } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { AddCoursesDialog } from '@/components/academic/add-courses-dialog'
import { orpc } from '@/utils/orpc'

export default function AcademicDashboardPage() {
  const [addCoursesOpen, setAddCoursesOpen] = useState(false)
  // Fetch enrollment data
  const { data: enrollment, isLoading } = useQuery(
    orpc.academic.enrollment.getEnrollment.queryOptions({
      input: {}
    })
  )

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-muted" />
          <div className="h-4 w-96 rounded bg-muted" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div className="h-48 rounded-lg bg-muted" key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 font-bold text-3xl">Academic Dashboard</h1>
          <p className="text-muted-foreground">
            {enrollment?.program.name} • {enrollment?.term.termName}{' '}
            {enrollment?.term.academicYear}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/spaces/academics/onboarding">
            <Settings className="mr-2 h-4 w-4" />
            Manage Enrollment
          </Link>
        </Button>
      </div>

      {/* Course Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {enrollment?.courses.map((course) => (
          <Card className="transition-shadow hover:shadow-lg" key={course.id}>
            <CardHeader>
              <div className="mb-2 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <span className="rounded-full bg-muted px-2 py-1 font-mono text-xs">
                  {course.code}
                </span>
              </div>
              <CardTitle className="text-lg">{course.title}</CardTitle>
              <CardDescription>
                {course.instructor} • Section {course.section}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-2 text-muted-foreground text-sm">
                <Calendar className="h-4 w-4" />
                <span>{course.schedule}</span>
              </div>
              <Button asChild className="w-full" variant="outline">
                <Link
                  href={`/spaces/academics/courses/${course.id}/discussions`}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Discussions
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {enrollment?.courses.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 font-semibold text-lg">No Courses Enrolled</h3>
            <p className="mb-4 text-center text-muted-foreground text-sm">
              You haven't enrolled in any courses yet. Add courses to get
              started.
            </p>
            <Button onClick={() => setAddCoursesOpen(true)}>Add Courses</Button>
          </CardContent>
        </Card>
      )}

      <AddCoursesDialog
        onOpenChange={setAddCoursesOpen}
        open={addCoursesOpen}
      />
    </div>
  )
}

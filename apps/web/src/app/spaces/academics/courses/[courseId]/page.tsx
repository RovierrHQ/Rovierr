'use client'

import { Button } from '@rov/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@rov/ui/components/tabs'
import { useQuery } from '@tanstack/react-query'
import {
  BookOpen,
  Calendar,
  Clock,
  FileText,
  GraduationCap,
  Loader2,
  MessageSquare,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { use } from 'react'
import { orpc } from '@/utils/orpc'

export default function CoursePage({
  params
}: {
  params: Promise<{ courseId: string }>
}) {
  const { data: enrollment, isLoading } = useQuery(
    orpc.academic.enrollment.getEnrollment.queryOptions({ input: {} })
  )
  const courseId = use(params).courseId

  if (isLoading) {
    return (
      <div className="container mx-auto flex h-96 items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Find all enrollments for this course (could be multiple sections)
  const courseEnrollments =
    enrollment?.courses.filter(
      (c) =>
        c.id === courseId ||
        c.code === enrollment.courses.find((e) => e.id === courseId)?.code
    ) ?? []

  const mainCourse = courseEnrollments[0]

  if (!mainCourse) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 font-semibold text-lg">Course Not Found</h3>
            <p className="mb-4 text-center text-muted-foreground text-sm">
              This course doesn't exist or you're not enrolled in it.
            </p>
            <Button asChild>
              <Link href="/spaces/academics/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Course Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <span className="rounded-lg bg-primary/10 px-3 py-1 font-mono font-semibold text-primary text-sm">
                {mainCourse.code}
              </span>
              <span className="text-muted-foreground text-sm">
                {enrollment?.term.termName} {enrollment?.term.academicYear}
              </span>
            </div>
            <h1 className="mb-2 font-bold text-3xl">{mainCourse.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
              {mainCourse.instructor && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  <span>{mainCourse.instructor}</span>
                </div>
              )}
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href={`/spaces/academics/courses/${courseId}/settings`}>
              Settings
            </Link>
          </Button>
        </div>

        {/* Course Sections */}
        {courseEnrollments.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {courseEnrollments.map((courseSection) => (
              <Card className="min-w-[200px] flex-1" key={courseSection.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    {courseSection.section || 'Main Section'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  {courseSection.schedule && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{courseSection.schedule}</span>
                    </div>
                  )}
                  {courseSection.instructor && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GraduationCap className="h-3 w-3" />
                      <span>{courseSection.instructor}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Course Content Tabs */}
      <Tabs className="space-y-6" defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="discussions">Discussions</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-6" value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common course activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  asChild
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Link
                    href={`/spaces/academics/courses/${courseId}/materials`}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Course Materials
                  </Link>
                </Button>
                <Button
                  asChild
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Link
                    href={`/spaces/academics/courses/${courseId}/assignments`}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    View Assignments
                  </Link>
                </Button>
                <Button
                  asChild
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Link
                    href={`/spaces/academics/courses/${courseId}/discussions`}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Join Discussions
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Course Info */}
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mainCourse.schedule && (
                  <div>
                    <div className="mb-1 flex items-center gap-2 font-medium text-sm">
                      <Calendar className="h-4 w-4" />
                      Schedule
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {mainCourse.schedule}
                    </p>
                  </div>
                )}
                {mainCourse.section && (
                  <div>
                    <div className="mb-1 flex items-center gap-2 font-medium text-sm">
                      <Users className="h-4 w-4" />
                      Section
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {mainCourse.section}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Items */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming</CardTitle>
              <CardDescription>
                Assignments and events for this course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-muted-foreground text-sm">
                  No upcoming assignments or events
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials">
          <Card>
            <CardHeader>
              <CardTitle>Course Materials</CardTitle>
              <CardDescription>
                Lecture notes, slides, and resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-muted-foreground text-sm">
                  No materials available yet
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Assignments</CardTitle>
              <CardDescription>
                View and submit your assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-muted-foreground text-sm">
                  No assignments posted yet
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discussions">
          <Card>
            <CardHeader>
              <CardTitle>Discussions</CardTitle>
              <CardDescription>Course discussions and Q&A</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="mb-4 text-muted-foreground text-sm">
                  No discussions yet. Start a conversation!
                </p>
                <Button>Start Discussion</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades">
          <Card>
            <CardHeader>
              <CardTitle>Grades</CardTitle>
              <CardDescription>Your grades and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <GraduationCap className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-muted-foreground text-sm">
                  No grades available yet
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

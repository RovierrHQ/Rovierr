'use client'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from '@rov/ui/components/input-group'
import { useQuery } from '@tanstack/react-query'
import {
  BookOpen,
  Compass,
  Home,
  MicIcon,
  SearchIcon,
  Users
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { AcademicHeader } from '@/components/layout/academic-header'
import type {
  SidebarNode,
  SidebarTree
} from '@/components/layout/use-space-sidebar-items'
import { useSpaceSidebarItems } from '@/components/layout/use-space-sidebar-items'
import { orpc } from '@/utils/orpc'

const AcademicsLayout = ({ children }: { children: ReactNode }) => {
  const { setSidebarTree } = useSpaceSidebarItems()

  const { data: enrollment, isLoading } = useQuery(
    orpc.academic.enrollment.getEnrollment.queryOptions({ input: {} })
  )

  const enrolledCourses = enrollment?.courses ?? []
  const lastCoursesRef = useRef<string>('')

  useEffect(() => {
    if (isLoading) {
      return
    }

    const coursesKey = JSON.stringify(
      enrolledCourses?.map((course) => ({
        id: course.id,
        code: course.code
      })) ?? []
    )

    if (coursesKey === lastCoursesRef.current) {
      return
    }

    lastCoursesRef.current = coursesKey

    // Group courses by course code (to handle multiple sections like LEC, TUT, LAB)
    const courseMap = new Map<string, (typeof enrolledCourses)[0]>()

    for (const course of enrolledCourses) {
      const key = course.code || course.title
      if (!courseMap.has(key)) {
        courseMap.set(key, course)
      }
    }

    // Build course nodes with sub-items (using unique courses only)
    const courseNodes: SidebarNode[] = Array.from(courseMap.values()).map(
      (course) => ({
        id: `course-${course.id}`,
        title: course.code || course.title,
        type: 'collapsible',
        url: `/spaces/academics/courses/${course.id}`,
        icon: BookOpen,
        isActive: false,
        children: [
          {
            id: `course-${course.id}-overview`,
            title: 'Overview',
            type: 'item',
            url: `/spaces/academics/courses/${course.id}/overview`
          },
          {
            id: `course-${course.id}-materials`,
            title: 'Materials',
            type: 'item',
            url: `/spaces/academics/courses/${course.id}/materials`
          },
          {
            id: `course-${course.id}-assignments`,
            title: 'Assignments',
            type: 'item',
            url: `/spaces/academics/courses/${course.id}/assignments`
          },
          {
            id: `course-${course.id}-grades`,
            title: 'Grades',
            type: 'item',
            url: `/spaces/academics/courses/${course.id}/grades`
          }
        ]
      })
    )

    // Build My Courses group children - either courses or empty state
    const myCoursesChildren: SidebarNode[] =
      enrolledCourses && enrolledCourses.length > 0
        ? courseNodes
        : [
            {
              id: 'no-courses-empty-state',
              title: "You haven't added any courses yet",
              type: 'empty-state',
              emptyStateMessage: "You haven't added any courses yet",
              emptyStateActions: [
                {
                  label: 'Add courses to this semester',
                  url: '/spaces/academics/onboarding',
                  icon: BookOpen
                }
              ]
            }
          ]

    // Build the entire sidebar tree
    const sidebarTree: SidebarTree = {
      nodes: [
        // Dashboard - top level item
        {
          id: 'academic-dashboard',
          title: 'Dashboard',
          type: 'item',
          url: '/spaces/academics/dashboard',
          icon: Home
        },
        // My Courses This Semester group
        {
          id: 'my-courses-group',
          title: 'My Courses This Semester',
          type: 'group-header',
          children: myCoursesChildren
        },
        // Study & Collaboration group
        {
          id: 'study-collaboration-group',
          title: 'Study & Collaboration',
          type: 'group-header',
          children: [
            {
              id: 'my-study-groups',
              title: 'My Study Groups',
              type: 'item',
              url: '/spaces/academics/study-groups',
              icon: Users
            },
            {
              id: 'find-study-buddy',
              title: 'Find Study Buddy',
              type: 'item',
              url: '/spaces/academics/discover/study-buddy',
              icon: Compass
            },
            {
              id: 'join-study-group',
              title: 'Join Study Group',
              type: 'item',
              url: '/spaces/academics/discover/study-groups',
              icon: Compass
            }
          ]
        }
      ]
    }

    setSidebarTree(sidebarTree)
  }, [setSidebarTree, enrolledCourses, isLoading])

  return (
    <>
      <header className="sticky top-0 flex items-center justify-between bg-inherit p-10 pb-6 transition-[width,height] ease-linear">
        <AcademicHeader />
        <InputGroup className="h-12 w-80 rounded-full">
          <InputGroupInput placeholder="Type a Command or Speak" />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <MicIcon />
          </InputGroupAddon>
        </InputGroup>
      </header>
      {children}
    </>
  )
}

export default AcademicsLayout

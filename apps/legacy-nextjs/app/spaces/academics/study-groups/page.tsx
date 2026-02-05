'use client'

import { Alert, AlertDescription } from '@rov/ui/components/alert'
import { Button } from '@rov/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'
import { Calendar, Clock, Info, MessageSquare, Plus, Users } from 'lucide-react'

export default function StudyGroupsPage() {
  const mockStudyGroups = [
    {
      id: '1',
      name: 'CS 101 Study Group',
      course: 'Introduction to Computer Science',
      courseCode: 'CS 101',
      members: 8,
      nextMeeting: 'Tomorrow, 2:00 PM',
      location: 'Library Room 204',
      description: 'Weekly study sessions for CS 101 assignments and exams'
    },
    {
      id: '2',
      name: 'Calculus Study Squad',
      course: 'Calculus I',
      courseCode: 'MATH 150',
      members: 12,
      nextMeeting: 'Friday, 4:00 PM',
      location: 'Student Center',
      description: 'Group study for calculus problem sets and midterm prep'
    },
    {
      id: '3',
      name: 'Chemistry Lab Partners',
      course: 'General Chemistry',
      courseCode: 'CHEM 101',
      members: 6,
      nextMeeting: 'Next Monday, 10:00 AM',
      location: 'Science Building Lab 3',
      description: 'Lab preparation and review sessions'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <Alert className="mb-6">
        <Info className="size-4" />
        <AlertDescription>
          <strong>Demonstration purposes only.</strong> This feature will be
          built in the future. Study groups will help you collaborate with
          classmates and prepare for exams together.
        </AlertDescription>
      </Alert>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 font-bold text-3xl">My Study Groups</h1>
          <p className="text-muted-foreground">
            Manage your study groups and collaborate with classmates
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Study Group
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockStudyGroups.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <div className="mb-2 flex items-center justify-between">
                <CardTitle className="text-lg">{group.name}</CardTitle>
                <span className="rounded-lg bg-primary/10 px-2 py-1 font-mono font-semibold text-primary text-xs">
                  {group.courseCode}
                </span>
              </div>
              <CardDescription>{group.course}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                {group.description}
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{group.members} members</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{group.nextMeeting}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{group.location}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button className="flex-1" size="sm" variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Chat
                </Button>
                <Button className="flex-1" size="sm" variant="outline">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {mockStudyGroups.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 font-semibold text-lg">No Study Groups Yet</h3>
            <p className="mb-4 text-muted-foreground text-sm">
              Create or join a study group to start collaborating with
              classmates
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Study Group
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

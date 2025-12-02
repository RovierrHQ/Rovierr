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
import { Calendar, Clock, Info, Search, UserPlus, Users } from 'lucide-react'

export default function JoinStudyGroupPage() {
  const mockAvailableGroups = [
    {
      id: '1',
      name: 'Advanced Calculus Study Group',
      course: 'Calculus II',
      courseCode: 'MATH 250',
      members: 8,
      maxMembers: 12,
      nextMeeting: 'Wednesday, 6:00 PM',
      location: 'Library Study Room 305',
      description:
        'Focused study group for MATH 250. We meet twice a week to work through problem sets and prepare for exams.',
      studyFocus: 'Problem-solving and exam prep',
      organizer: 'David Kim'
    },
    {
      id: '2',
      name: 'Organic Chemistry Lab Prep',
      course: 'Organic Chemistry',
      courseCode: 'CHEM 201',
      members: 5,
      maxMembers: 8,
      nextMeeting: 'Monday, 2:00 PM',
      location: 'Science Building Room 120',
      description:
        'Weekly lab preparation sessions. We review lab procedures, safety protocols, and expected outcomes before each lab.',
      studyFocus: 'Lab preparation and review',
      organizer: 'Lisa Wang'
    },
    {
      id: '3',
      name: 'Data Structures Study Circle',
      course: 'Data Structures and Algorithms',
      courseCode: 'CS 201',
      members: 10,
      maxMembers: 15,
      nextMeeting: 'Friday, 4:00 PM',
      location: 'Computer Science Building Lab 2',
      description:
        'Collaborative coding sessions and algorithm discussions. Great for understanding complex data structures.',
      studyFocus: 'Coding practice and theory',
      organizer: 'James Rodriguez'
    },
    {
      id: '4',
      name: 'Physics Problem Solving Group',
      course: 'Physics I',
      courseCode: 'PHYS 101',
      members: 6,
      maxMembers: 10,
      nextMeeting: 'Thursday, 5:00 PM',
      location: 'Student Center Room 201',
      description:
        'Work through physics problems together. We focus on understanding concepts through practice problems.',
      studyFocus: 'Problem-solving and concepts',
      organizer: 'Maria Garcia'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <Alert className="mb-6">
        <Info className="size-4" />
        <AlertDescription>
          <strong>Demonstration purposes only.</strong> This feature will be
          built in the future. Join study groups will help you find and connect
          with existing study groups for your courses.
        </AlertDescription>
      </Alert>

      <div className="mb-8">
        <h1 className="mb-2 font-bold text-3xl">Join Study Group</h1>
        <p className="mb-6 text-muted-foreground">
          Discover and join study groups for your courses
        </p>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
            <input
              className="h-10 w-full rounded-md border border-input bg-background pr-4 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Search by course code or name..."
            />
          </div>
          <Button variant="outline">Filter</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {mockAvailableGroups.map((group) => (
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                      {group.members}/{group.maxMembers} members
                    </span>
                  </div>
                  <div className="h-2 w-24 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${(group.members / group.maxMembers) * 100}%`
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{group.nextMeeting}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{group.location}</span>
                </div>
                <div className="pt-1">
                  <span className="font-medium text-sm">Focus: </span>
                  <span className="text-muted-foreground text-sm">
                    {group.studyFocus}
                  </span>
                </div>
                <div className="pt-1">
                  <span className="font-medium text-sm">Organized by: </span>
                  <span className="text-muted-foreground text-sm">
                    {group.organizer}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1"
                  disabled={group.members >= group.maxMembers}
                  size="sm"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  {group.members >= group.maxMembers
                    ? 'Group Full'
                    : 'Join Group'}
                </Button>
                <Button className="flex-1" size="sm" variant="outline">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {mockAvailableGroups.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 font-semibold text-lg">
              No Study Groups Found
            </h3>
            <p className="mb-4 text-muted-foreground text-sm">
              Try adjusting your search or filters to find available study
              groups
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

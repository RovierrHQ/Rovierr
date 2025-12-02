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
import {
  BookOpen,
  GraduationCap,
  Info,
  MessageSquare,
  Search,
  UserPlus
} from 'lucide-react'

export default function FindStudyBuddyPage() {
  const mockStudyBuddies = [
    {
      id: '1',
      name: 'Alex Johnson',
      year: 'Sophomore',
      major: 'Computer Science',
      courses: ['CS 101', 'MATH 150', 'PHYS 101'],
      availability: 'Weekdays after 3 PM',
      studyStyle: 'Group study preferred',
      bio: 'Looking for a study partner for CS 101 and Calculus. Prefer structured study sessions.'
    },
    {
      id: '2',
      name: 'Sarah Chen',
      year: 'Junior',
      major: 'Mathematics',
      courses: ['MATH 150', 'MATH 250', 'STAT 200'],
      availability: 'Evenings and weekends',
      studyStyle: 'One-on-one or small groups',
      bio: 'Strong in calculus and statistics. Happy to help others while studying together.'
    },
    {
      id: '3',
      name: 'Michael Park',
      year: 'Freshman',
      major: 'Engineering',
      courses: ['PHYS 101', 'CHEM 101', 'MATH 150'],
      availability: 'Flexible schedule',
      studyStyle: 'Active discussion and problem-solving',
      bio: 'New to university, looking for study partners to navigate first-year courses.'
    },
    {
      id: '4',
      name: 'Emma Davis',
      year: 'Senior',
      major: 'Biology',
      courses: ['CHEM 101', 'BIO 201', 'BIO 202'],
      availability: 'Mornings and early afternoons',
      studyStyle: 'Quiet study with occasional discussions',
      bio: 'Pre-med student. Looking for focused study sessions for chemistry and biology.'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <Alert className="mb-6">
        <Info className="size-4" />
        <AlertDescription>
          <strong>Demonstration purposes only.</strong> This feature will be
          built in the future. Find study buddies will help you connect with
          classmates who share similar courses and study preferences.
        </AlertDescription>
      </Alert>

      <div className="mb-8">
        <h1 className="mb-2 font-bold text-3xl">Find Study Buddy</h1>
        <p className="mb-6 text-muted-foreground">
          Connect with classmates who share your courses and study preferences
        </p>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
            <input
              className="h-10 w-full rounded-md border border-input bg-background pr-4 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Search by course, major, or name..."
            />
          </div>
          <Button variant="outline">Filter</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {mockStudyBuddies.map((buddy) => (
          <Card key={buddy.id}>
            <CardHeader>
              <div className="mb-2 flex items-center justify-between">
                <CardTitle className="text-lg">{buddy.name}</CardTitle>
                <span className="rounded-lg bg-muted px-2 py-1 text-xs">
                  {buddy.year}
                </span>
              </div>
              <CardDescription className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                {buddy.major}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">{buddy.bio}</p>

              <div className="space-y-2">
                <div>
                  <p className="mb-1 font-medium text-sm">Shared Courses:</p>
                  <div className="flex flex-wrap gap-2">
                    {buddy.courses.map((course) => (
                      <span
                        className="rounded-lg bg-primary/10 px-2 py-1 font-mono text-primary text-xs"
                        key={course}
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{buddy.studyStyle}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-xs">
                      Available: {buddy.availability}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button className="flex-1" size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Connect
                </Button>
                <Button className="flex-1" size="sm" variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {mockStudyBuddies.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <UserPlus className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 font-semibold text-lg">
              No Study Buddies Found
            </h3>
            <p className="mb-4 text-muted-foreground text-sm">
              Try adjusting your search or filters to find potential study
              partners
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

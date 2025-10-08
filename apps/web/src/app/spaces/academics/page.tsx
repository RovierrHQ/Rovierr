'use client'

import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@rov/ui/components/dialog'
import { Input } from '@rov/ui/components/input'
import { Label } from '@rov/ui/components/label'
import { Textarea } from '@rov/ui/components/textarea'
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileText,
  GraduationCap,
  Hash,
  Info,
  Plus,
  TrendingUp
} from 'lucide-react'
import { useState } from 'react'
import { type SidebarSection, SpaceSidebar } from '@/components/space-sidebar'
import { Navbar } from '@/components/spaces-top-nav'

const sidebarSections: SidebarSection[] = [
  {
    id: 'courses',
    label: 'My Courses',
    icon: BookOpen,
    href: '/education#courses'
  },
  {
    id: 'assignments',
    label: 'Assignments',
    icon: ClipboardCheck,
    href: '/education#assignments'
  },
  {
    id: 'schedule',
    label: 'Study Schedule',
    icon: Calendar,
    href: '/education#schedule'
  },
  {
    id: 'resources',
    label: 'Study Resources',
    icon: FileText,
    href: '/education#resources'
  }
]

export default function AcademicsPage() {
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [courseForm, setCourseForm] = useState({
    name: '',
    description: '',
    code: '',
    credits: '',
    semester: '',
    prerequisites: ''
  })

  const handleAddCourse = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(courseForm)
      })
      if (response.ok) {
        setIsAddCourseOpen(false)
        setCourseForm({
          name: '',
          description: '',
          code: '',
          credits: '',
          semester: '',
          prerequisites: ''
        })
      }
    } catch (error) {
      console.error(new Error('Whoops, something bad happened'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex">
        <SpaceSidebar
          sections={sidebarSections}
          spaceColor="from-blue-500 to-cyan-500"
        />

        <main className="flex-1 px-6 py-8">
          <div className="mb-8">
            <h2 className="mb-2 font-bold text-3xl text-foreground">
              Education & Academics
            </h2>
            <p className="text-muted-foreground">
              Manage your courses, assignments, and academic progress
            </p>
          </div>

          {/* Quick Stats */}
          <div className="mb-8 grid gap-6 md:grid-cols-4">
            <Card className="border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">
                    Active Courses
                  </p>
                  <p className="mt-1 font-bold text-3xl text-foreground">5</p>
                </div>
                <BookOpen className="h-8 w-8 text-chart-1" />
              </div>
            </Card>

            <Card className="border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">
                    Assignments Due
                  </p>
                  <p className="mt-1 font-bold text-3xl text-foreground">7</p>
                </div>
                <ClipboardCheck className="h-8 w-8 text-chart-2" />
              </div>
            </Card>

            <Card className="border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Average GPA</p>
                  <p className="mt-1 font-bold text-3xl text-foreground">3.8</p>
                </div>
                <TrendingUp className="h-8 w-8 text-chart-3" />
              </div>
            </Card>

            <Card className="border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Study Hours</p>
                  <p className="mt-1 font-bold text-3xl text-foreground">24</p>
                </div>
                <Clock className="h-8 w-8 text-chart-4" />
              </div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Course List */}
            <Card
              className="border-border bg-card p-6 lg:col-span-2"
              id="courses"
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-semibold text-foreground text-lg">
                  My Courses
                </h3>
                <Dialog
                  onOpenChange={setIsAddCourseOpen}
                  open={isAddCourseOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      className="gap-1 bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1.5 text-sm text-white shadow-lg hover:from-blue-600 hover:to-purple-700"
                      size="sm"
                    >
                      <Plus className="h-4 w-4" />
                      Add Course
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[80vh] overflow-y-auto border-2 border-primary/20 bg-background shadow-2xl sm:max-w-[500px]">
                    <DialogHeader className="text-center">
                      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <GraduationCap className="h-6 w-6 text-primary" />
                      </div>
                      <DialogTitle className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text font-bold text-2xl text-transparent">
                        Add New Course
                      </DialogTitle>
                      <DialogDescription className="text-muted-foreground">
                        Fill in the details to add a new course to your academic
                        plan.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-6">
                      <div className="space-y-2">
                        <Label
                          className="flex items-center gap-2 font-medium text-sm"
                          htmlFor="name"
                        >
                          <BookOpen className="h-4 w-4 text-primary" />
                          Course Name
                        </Label>
                        <Input
                          className="border-primary/20 focus:border-primary"
                          id="name"
                          onChange={(e) =>
                            setCourseForm((prev) => ({
                              ...prev,
                              name: e.target.value
                            }))
                          }
                          placeholder="e.g., Introduction to Computer Science"
                          value={courseForm.name}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            className="flex items-center gap-2 font-medium text-sm"
                            htmlFor="code"
                          >
                            <Hash className="h-4 w-4 text-primary" />
                            Course Code
                          </Label>
                          <Input
                            className="border-primary/20 focus:border-primary"
                            id="code"
                            onChange={(e) =>
                              setCourseForm((prev) => ({
                                ...prev,
                                code: e.target.value
                              }))
                            }
                            placeholder="e.g., CS101"
                            value={courseForm.code}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            className="flex items-center gap-2 font-medium text-sm"
                            htmlFor="credits"
                          >
                            <Info className="h-4 w-4 text-primary" />
                            Credits
                          </Label>
                          <Input
                            className="border-primary/20 focus:border-primary"
                            id="credits"
                            min="0"
                            onChange={(e) =>
                              setCourseForm((prev) => ({
                                ...prev,
                                credits: e.target.value
                              }))
                            }
                            placeholder="e.g., 3"
                            type="number"
                            value={courseForm.credits}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label
                          className="flex items-center gap-2 font-medium text-sm"
                          htmlFor="semester"
                        >
                          <Calendar className="h-4 w-4 text-primary" />
                          Semester
                        </Label>
                        <Input
                          className="border-primary/20 focus:border-primary"
                          id="semester"
                          onChange={(e) =>
                            setCourseForm((prev) => ({
                              ...prev,
                              semester: e.target.value
                            }))
                          }
                          placeholder="e.g., Fall 2025"
                          value={courseForm.semester}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          className="flex items-center gap-2 font-medium text-sm"
                          htmlFor="description"
                        >
                          <FileText className="h-4 w-4 text-primary" />
                          Description
                        </Label>
                        <Textarea
                          className="min-h-[80px] border-primary/20 focus:border-primary"
                          id="description"
                          onChange={(e) =>
                            setCourseForm((prev) => ({
                              ...prev,
                              description: e.target.value
                            }))
                          }
                          placeholder="Brief description of the course content..."
                          value={courseForm.description}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          className="flex items-center gap-2 font-medium text-sm"
                          htmlFor="prerequisites"
                        >
                          <AlertCircle className="h-4 w-4 text-primary" />
                          Prerequisites
                        </Label>
                        <Textarea
                          className="min-h-[60px] border-primary/20 focus:border-primary"
                          id="prerequisites"
                          onChange={(e) =>
                            setCourseForm((prev) => ({
                              ...prev,
                              prerequisites: e.target.value
                            }))
                          }
                          placeholder="List any required prerequisites..."
                          value={courseForm.prerequisites}
                        />
                      </div>
                    </div>
                    <DialogFooter className="flex gap-2">
                      <Button
                        disabled={isLoading}
                        onClick={() => setIsAddCourseOpen(false)}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                        disabled={
                          isLoading || !courseForm.name || !courseForm.code
                        }
                        onClick={handleAddCourse}
                      >
                        {isLoading ? 'Adding...' : 'Add Course'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-card/50 p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">
                        Data Structures & Algorithms
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        CS 301 • Prof. Johnson
                      </p>
                    </div>
                    <span className="rounded-full bg-chart-1/10 px-3 py-1 font-medium text-chart-1 text-xs">
                      In Progress
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-foreground">75%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-3/4 rounded-full bg-chart-1" />
                    </div>
                  </div>
                  <div className="flex gap-4 text-muted-foreground text-sm">
                    <span>Next: Lecture 12</span>
                    <span>•</span>
                    <span>2 assignments pending</span>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card/50 p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">
                        Machine Learning
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        CS 405 • Prof. Chen
                      </p>
                    </div>
                    <span className="rounded-full bg-chart-1/10 px-3 py-1 font-medium text-chart-1 text-xs">
                      In Progress
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-foreground">60%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-3/5 rounded-full bg-chart-1" />
                    </div>
                  </div>
                  <div className="flex gap-4 text-muted-foreground text-sm">
                    <span>Next: Project Demo</span>
                    <span>•</span>
                    <span>1 assignment pending</span>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card/50 p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">
                        Calculus III
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        MATH 203 • Prof. Williams
                      </p>
                    </div>
                    <span className="rounded-full bg-chart-3/10 px-3 py-1 font-medium text-chart-3 text-xs">
                      Completed
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-muted-foreground">Final Grade</span>
                      <span className="font-medium text-foreground">
                        A (94%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-full rounded-full bg-chart-3" />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card/50 p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">
                        Database Systems
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        CS 350 • Prof. Martinez
                      </p>
                    </div>
                    <span className="rounded-full bg-chart-1/10 px-3 py-1 font-medium text-chart-1 text-xs">
                      In Progress
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-foreground">85%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-[85%] rounded-full bg-chart-1" />
                    </div>
                  </div>
                  <div className="flex gap-4 text-muted-foreground text-sm">
                    <span>Next: Final Project</span>
                    <span>•</span>
                    <span>1 assignment pending</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Assignment Tracker */}
            <Card className="border-border bg-card p-6" id="assignments">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-semibold text-foreground text-lg">
                  Assignments
                </h3>
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-3">
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                  <div className="mb-2 flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 text-red-500" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">
                        Binary Tree Implementation
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Data Structures
                      </p>
                    </div>
                  </div>
                  <p className="text-red-500 text-xs">Due in 2 days</p>
                </div>

                <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-3">
                  <div className="mb-2 flex items-start gap-2">
                    <Clock className="mt-0.5 h-4 w-4 text-orange-500" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">
                        ML Model Training
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Machine Learning
                      </p>
                    </div>
                  </div>
                  <p className="text-orange-500 text-xs">Due in 5 days</p>
                </div>

                <div className="rounded-lg border border-border bg-card/50 p-3">
                  <div className="mb-2 flex items-start gap-2">
                    <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">
                        SQL Query Optimization
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Database Systems
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-xs">Due in 1 week</p>
                </div>

                <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
                  <div className="mb-2 flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">
                        Sorting Algorithms
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Data Structures
                      </p>
                    </div>
                  </div>
                  <p className="text-green-500 text-xs">Completed • 98%</p>
                </div>
              </div>
            </Card>

            {/* Study Resources */}
            <Card
              className="border-border bg-card p-6 lg:col-span-2"
              id="resources"
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-semibold text-foreground text-lg">
                  Study Resources
                </h3>
                <Button
                  className="gap-2 bg-transparent"
                  size="sm"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                  Add Resource
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-border bg-card/50 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/10">
                      <FileText className="h-5 w-5 text-chart-1" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Lecture Notes
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Data Structures
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Complete notes from Lectures 1-12
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-card/50 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
                      <BookOpen className="h-5 w-5 text-chart-2" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Textbook Chapters
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Machine Learning
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Chapters 5-8 with annotations
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-card/50 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
                      <GraduationCap className="h-5 w-5 text-chart-3" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Practice Problems
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Database Systems
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    50+ SQL practice queries
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-card/50 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
                      <FileText className="h-5 w-5 text-chart-4" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Study Guides
                      </p>
                      <p className="text-muted-foreground text-xs">
                        All Courses
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Midterm preparation materials
                  </p>
                </div>
              </div>
            </Card>

            {/* Grade Overview */}
            <Card className="border-border bg-card p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-semibold text-foreground text-lg">
                  Grade Overview
                </h3>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex justify-between">
                    <span className="text-muted-foreground text-sm">
                      Data Structures
                    </span>
                    <span className="font-medium text-foreground text-sm">
                      A- (91%)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[91%] rounded-full bg-chart-1" />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between">
                    <span className="text-muted-foreground text-sm">
                      Machine Learning
                    </span>
                    <span className="font-medium text-foreground text-sm">
                      B+ (88%)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[88%] rounded-full bg-chart-2" />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between">
                    <span className="text-muted-foreground text-sm">
                      Calculus III
                    </span>
                    <span className="font-medium text-foreground text-sm">
                      A (94%)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[94%] rounded-full bg-chart-3" />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between">
                    <span className="text-muted-foreground text-sm">
                      Database Systems
                    </span>
                    <span className="font-medium text-foreground text-sm">
                      A (92%)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[92%] rounded-full bg-chart-4" />
                  </div>
                </div>

                <div className="mt-6 rounded-lg border border-chart-1/20 bg-chart-1/5 p-4">
                  <p className="text-muted-foreground text-sm">
                    Current Semester GPA
                  </p>
                  <p className="mt-1 font-bold text-2xl text-foreground">3.8</p>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

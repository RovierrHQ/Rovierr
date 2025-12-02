'use client'

import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import { useQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Target,
  TrendingUp,
  Users
} from 'lucide-react'
import { orpc } from '@/utils/orpc'

export default function CareerPage() {
  // Fetch statistics
  const { data: statistics } = useQuery(
    orpc.career.applications.statistics.queryOptions({
      input: {}
    })
  )

  return (
    <main className="flex-1 px-6 py-8">
      <div className="mb-8">
        <div className="mb-6">
          <h2 className="mb-2 font-bold text-3xl text-foreground">
            Career Space
          </h2>
          <p className="text-muted-foreground">
            Your central hub for career development and job search
          </p>
        </div>

        {/* Statistics Dashboard */}
        {statistics && (
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card className="border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">
                    Total Applications
                  </p>
                  <p className="mt-1 font-bold text-2xl text-foreground">
                    {statistics.total}
                  </p>
                </div>
                <Briefcase className="h-8 w-8 text-chart-1" />
              </div>
            </Card>

            <Card className="border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">
                    Upcoming Interviews
                  </p>
                  <p className="mt-1 font-bold text-2xl text-foreground">
                    {statistics.upcomingInterviews}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-chart-2" />
              </div>
            </Card>

            <Card className="border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">
                    Pending Responses
                  </p>
                  <p className="mt-1 font-bold text-2xl text-foreground">
                    {statistics.pendingResponses}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-chart-3" />
              </div>
            </Card>

            <Card className="border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Offers</p>
                  <p className="mt-1 font-bold text-2xl text-foreground">
                    {statistics.byStatus.offer_received || 0}
                  </p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                  <span className="font-bold text-green-500 text-lg">✓</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Career Goals */}
        <Card className="border-border bg-card p-6" id="goals">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-semibold text-foreground text-lg">
              Career Goals
            </h3>
            <Target className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
              <div className="mb-2 flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">
                    Complete Portfolio
                  </p>
                  <p className="text-muted-foreground text-xs">Q1 2025</p>
                </div>
              </div>
              <p className="text-green-500 text-xs">Completed</p>
            </div>

            <div className="rounded-lg border border-chart-1/20 bg-chart-1/5 p-3">
              <div className="mb-2 flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 text-chart-1" />
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">
                    Land Summer Internship
                  </p>
                  <p className="text-muted-foreground text-xs">Q2 2025</p>
                </div>
              </div>
              <div className="mt-2">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-foreground">60%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-3/5 rounded-full bg-chart-1" />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card/50 p-3">
              <div className="mb-2 flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">
                    Learn System Design
                  </p>
                  <p className="text-muted-foreground text-xs">Q3 2025</p>
                </div>
              </div>
              <div className="mt-2">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-foreground">25%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-1/4 rounded-full bg-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card/50 p-3">
              <div className="mb-2 flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">
                    Contribute to Open Source
                  </p>
                  <p className="text-muted-foreground text-xs">Ongoing</p>
                </div>
              </div>
              <div className="mt-2">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-foreground">40%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-2/5 rounded-full bg-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Skills Development */}
        <Card className="border-border bg-card p-6 lg:col-span-2" id="skills">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-semibold text-foreground text-lg">
              Skills Development
            </h3>
            <Button
              className="gap-2 bg-transparent"
              size="sm"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              Add Skill
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card/50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-semibold text-foreground">
                  React & Next.js
                </h4>
                <Award className="h-5 w-5 text-chart-1" />
              </div>
              <div className="mb-2">
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-muted-foreground">Proficiency</span>
                  <span className="font-medium text-foreground">Advanced</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[85%] rounded-full bg-chart-1" />
                </div>
              </div>
              <p className="text-muted-foreground text-xs">
                5 projects completed
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card/50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-semibold text-foreground">Python & ML</h4>
                <Award className="h-5 w-5 text-chart-2" />
              </div>
              <div className="mb-2">
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-muted-foreground">Proficiency</span>
                  <span className="font-medium text-foreground">
                    Intermediate
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[65%] rounded-full bg-chart-2" />
                </div>
              </div>
              <p className="text-muted-foreground text-xs">
                3 projects completed
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card/50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-semibold text-foreground">System Design</h4>
                <BookOpen className="h-5 w-5 text-chart-3" />
              </div>
              <div className="mb-2">
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-muted-foreground">Proficiency</span>
                  <span className="font-medium text-foreground">Learning</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[35%] rounded-full bg-chart-3" />
                </div>
              </div>
              <p className="text-muted-foreground text-xs">
                Currently studying
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card/50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-semibold text-foreground">
                  Cloud & DevOps
                </h4>
                <BookOpen className="h-5 w-5 text-chart-4" />
              </div>
              <div className="mb-2">
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-muted-foreground">Proficiency</span>
                  <span className="font-medium text-foreground">Beginner</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[25%] rounded-full bg-chart-4" />
                </div>
              </div>
              <p className="text-muted-foreground text-xs">Starting soon</p>
            </div>
          </div>
        </Card>

        {/* Professional Network */}
        <Card className="border-border bg-card p-6" id="networking">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-semibold text-foreground text-lg">Network</h3>
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card/50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-1/10">
                <Users className="h-5 w-5 text-chart-1" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">
                  Sarah Johnson
                </p>
                <p className="text-muted-foreground text-xs">
                  Senior Engineer at Google
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border bg-card/50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-2/10">
                <Users className="h-5 w-5 text-chart-2" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">
                  Michael Chen
                </p>
                <p className="text-muted-foreground text-xs">
                  Tech Lead at Meta
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border bg-card/50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-3/10">
                <Users className="h-5 w-5 text-chart-3" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">
                  Emily Rodriguez
                </p>
                <p className="text-muted-foreground text-xs">
                  Recruiter at Amazon
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border bg-card/50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-4/10">
                <Users className="h-5 w-5 text-chart-4" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">David Kim</p>
                <p className="text-muted-foreground text-xs">
                  Founder at StartupXYZ
                </p>
              </div>
            </div>

            <Button className="w-full gap-2 bg-transparent" variant="outline">
              <Plus className="h-4 w-4" />
              Add Connection
            </Button>
          </div>
        </Card>

        {/* Interview Prep */}
        <Card className="border-border bg-card p-6 lg:col-span-3">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-semibold text-foreground text-lg">
              Interview Preparation
            </h3>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-chart-1/20 bg-chart-1/5 p-4">
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-chart-1" />
                <h4 className="font-semibold text-foreground">
                  Coding Practice
                </h4>
              </div>
              <p className="mb-2 text-muted-foreground text-sm">
                Completed 45 LeetCode problems this month
              </p>
              <div className="flex items-center gap-2 text-chart-1 text-xs">
                <TrendingUp className="h-3 w-3" />
                <span>On track</span>
              </div>
            </div>

            <div className="rounded-lg border border-chart-2/20 bg-chart-2/5 p-4">
              <div className="mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-chart-2" />
                <h4 className="font-semibold text-foreground">
                  Behavioral Prep
                </h4>
              </div>
              <p className="mb-2 text-muted-foreground text-sm">
                Prepared answers for 12 common questions
              </p>
              <div className="flex items-center gap-2 text-chart-2 text-xs">
                <Clock className="h-3 w-3" />
                <span>In progress</span>
              </div>
            </div>

            <div className="rounded-lg border border-chart-3/20 bg-chart-3/5 p-4">
              <div className="mb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-chart-3" />
                <h4 className="font-semibold text-foreground">System Design</h4>
              </div>
              <p className="mb-2 text-muted-foreground text-sm">
                Studied 8 common design patterns
              </p>
              <div className="flex items-center gap-2 text-chart-3 text-xs">
                <TrendingUp className="h-3 w-3" />
                <span>Improving</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </main>
  )
}

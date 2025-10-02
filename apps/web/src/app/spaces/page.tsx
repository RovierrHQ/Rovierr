'use client'

import { Card } from '@rov/ui/components/card'
import {
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Target,
  TrendingUp,
  Users
} from 'lucide-react'
import { Navbar } from '@/components/spaces-top-nav'

export default function SummaryPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="mb-2 font-bold text-3xl text-foreground">Summary</h2>
          <p className="text-muted-foreground">Overview of all your spaces</p>
        </div>

        {/* Stats Overview */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Active Courses</p>
                <p className="mt-1 font-bold text-3xl text-foreground">5</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-1/10">
                <BookOpen className="h-6 w-6 text-chart-1" />
              </div>
            </div>
          </Card>

          <Card className="border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Pending Tasks</p>
                <p className="mt-1 font-bold text-3xl text-foreground">12</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10">
                <ClipboardCheck className="h-6 w-6 text-chart-2" />
              </div>
            </div>
          </Card>

          <Card className="border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Social Groups</p>
                <p className="mt-1 font-bold text-3xl text-foreground">8</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-3/10">
                <Users className="h-6 w-6 text-chart-3" />
              </div>
            </div>
          </Card>

          <Card className="border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Career Goals</p>
                <p className="mt-1 font-bold text-3xl text-foreground">3</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-4/10">
                <Target className="h-6 w-6 text-chart-4" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upcoming Deadlines */}
          <Card className="border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-lg">
                Upcoming Deadlines
              </h3>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border border-border bg-card/50 p-3">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded bg-chart-1/10">
                  <Clock className="h-4 w-4 text-chart-1" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    Data Structures Assignment
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Due in 2 days • Education
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-border bg-card/50 p-3">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded bg-chart-1/10">
                  <Clock className="h-4 w-4 text-chart-1" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    Machine Learning Project
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Due in 5 days • Education
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-border bg-card/50 p-3">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded bg-chart-4/10">
                  <Clock className="h-4 w-4 text-chart-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    Portfolio Website Update
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Due in 1 week • Career
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-lg">
                Recent Activity
              </h3>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border border-border bg-card/50 p-3">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded bg-chart-3/10">
                  <Users className="h-4 w-4 text-chart-3" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    Hiking Group Meetup
                  </p>
                  <p className="text-muted-foreground text-sm">
                    New announcement posted • Social
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-border bg-card/50 p-3">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded bg-chart-1/10">
                  <CheckCircle2 className="h-4 w-4 text-chart-1" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    Completed Calculus Quiz
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Score: 95% • Education
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-border bg-card/50 p-3">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded bg-chart-4/10">
                  <Target className="h-4 w-4 text-chart-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    Applied to 3 Internships
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Applications sent • Career
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* This Week's Focus */}
          <Card className="border-border bg-card p-6 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-lg">
                This Week's Focus
              </h3>
              <Target className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-chart-1/20 bg-chart-1/5 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-chart-1" />
                  <span className="font-medium text-chart-1 text-xs">
                    Education
                  </span>
                </div>
                <p className="text-foreground text-sm">
                  Complete 3 assignments and study for midterms
                </p>
              </div>

              <div className="rounded-lg border border-chart-3/20 bg-chart-3/5 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4 text-chart-3" />
                  <span className="font-medium text-chart-3 text-xs">
                    Social
                  </span>
                </div>
                <p className="text-foreground text-sm">
                  Attend football practice and hiking trip on Saturday
                </p>
              </div>

              <div className="rounded-lg border border-chart-4/20 bg-chart-4/5 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-chart-4" />
                  <span className="font-medium text-chart-4 text-xs">
                    Career
                  </span>
                </div>
                <p className="text-foreground text-sm">
                  Update resume and reach out to 2 recruiters
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

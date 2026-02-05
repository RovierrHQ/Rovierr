'use client'

import { Card } from '@rov/ui/components/card'
import { GraduationCap, Sparkles } from 'lucide-react'

export default function TuitionPage() {
  return (
    <main className="flex-1 px-6 py-8">
      <div className="mb-8">
        <h2 className="mb-2 font-bold text-3xl text-foreground">
          Tuition & Financial Aid
        </h2>
        <p className="text-muted-foreground">
          Discover scholarships, grants, and tuition assistance opportunities
        </p>
      </div>

      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="max-w-md border-border bg-card p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <GraduationCap className="h-16 w-16 text-muted-foreground" />
              <Sparkles className="-right-2 -top-2 absolute h-6 w-6 text-chart-2" />
            </div>
          </div>
          <h3 className="mb-3 font-semibold text-foreground text-xl">
            Coming Soon
          </h3>
          <p className="mb-4 text-muted-foreground">
            The Tuition & Financial Aid feature is currently under development.
            Soon you'll be able to discover scholarships, grants, and financial
            assistance programs tailored for university students.
          </p>
          <div className="rounded-lg border border-chart-2/20 bg-chart-2/5 p-4">
            <p className="font-medium text-chart-2 text-sm">
              Stay tuned for personalized scholarship recommendations and
              financial aid resources!
            </p>
          </div>
        </Card>
      </div>
    </main>
  )
}

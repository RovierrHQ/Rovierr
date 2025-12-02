'use client'

import { Card } from '@rov/ui/components/card'
import { Search, Sparkles } from 'lucide-react'

export default function FindJobsPage() {
  return (
    <main className="flex-1 px-6 py-8">
      <div className="mb-8">
        <h2 className="mb-2 font-bold text-3xl text-foreground">Find Jobs</h2>
        <p className="text-muted-foreground">
          Discover job opportunities from top companies
        </p>
      </div>

      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="max-w-md border-border bg-card p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <Search className="h-16 w-16 text-muted-foreground" />
              <Sparkles className="-right-2 -top-2 absolute h-6 w-6 text-chart-2" />
            </div>
          </div>
          <h3 className="mb-3 font-semibold text-foreground text-xl">
            Coming Soon
          </h3>
          <p className="mb-4 text-muted-foreground">
            The Job Board feature is currently under development. Soon you'll be
            able to discover and apply to jobs from LinkedIn, Indeed, and other
            platforms directly from Rovierr.
          </p>
          <div className="rounded-lg border border-chart-2/20 bg-chart-2/5 p-4">
            <p className="font-medium text-chart-2 text-sm">
              For now, you can add job applications manually by pasting job post
              URLs in the My Applications section!
            </p>
          </div>
        </Card>
      </div>
    </main>
  )
}

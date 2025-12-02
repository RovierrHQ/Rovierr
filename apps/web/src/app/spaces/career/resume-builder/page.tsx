'use client'

import { Card } from '@rov/ui/components/card'
import { FileText, Sparkles } from 'lucide-react'

export default function ResumeBuilderPage() {
  return (
    <main className="flex-1 px-6 py-8">
      <div className="mb-8">
        <h2 className="mb-2 font-bold text-3xl text-foreground">
          Resume Builder
        </h2>
        <p className="text-muted-foreground">
          Create and manage your professional resume
        </p>
      </div>

      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="max-w-md border-border bg-card p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <FileText className="h-16 w-16 text-muted-foreground" />
              <Sparkles className="-right-2 -top-2 absolute h-6 w-6 text-chart-1" />
            </div>
          </div>
          <h3 className="mb-3 font-semibold text-foreground text-xl">
            Coming Soon
          </h3>
          <p className="mb-4 text-muted-foreground">
            The Resume Builder feature is currently under development. Soon
            you'll be able to create professional resumes with AI-powered
            suggestions and templates.
          </p>
          <div className="rounded-lg border border-chart-1/20 bg-chart-1/5 p-4">
            <p className="font-medium text-chart-1 text-sm">
              In the meantime, focus on tracking your job applications to stay
              organized in your job search!
            </p>
          </div>
        </Card>
      </div>
    </main>
  )
}

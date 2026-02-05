'use client'

import { Card } from '@rov/ui/components/card'
import { Network, Sparkles } from 'lucide-react'

export default function NetworkPage() {
  return (
    <main className="flex-1 px-6 py-8">
      <div className="mb-8">
        <h2 className="mb-2 font-bold text-3xl text-foreground">Network</h2>
        <p className="text-muted-foreground">
          Connect with professionals and expand your network
        </p>
      </div>

      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="max-w-md border-border bg-card p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <Network className="h-16 w-16 text-muted-foreground" />
              <Sparkles className="-right-2 -top-2 absolute h-6 w-6 text-chart-3" />
            </div>
          </div>
          <h3 className="mb-3 font-semibold text-foreground text-xl">
            Coming Soon
          </h3>
          <p className="mb-4 text-muted-foreground">
            The Networking feature is currently under development. Soon you'll
            be able to connect with alumni, professionals, and build meaningful
            relationships for your career growth.
          </p>
          <div className="rounded-lg border border-chart-3/20 bg-chart-3/5 p-4">
            <p className="font-medium text-chart-3 text-sm">
              Stay tuned for features like alumni connections, mentorship
              programs, and professional networking events!
            </p>
          </div>
        </Card>
      </div>
    </main>
  )
}

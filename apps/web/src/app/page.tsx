'use client'
import { apiStatus } from '@rov/shared'
import AuroraBackgroundDemo from '@rov/ui/components/aurora-background-demo'
import { useQuery } from '@tanstack/react-query'
import { orpc } from '@/utils/orpc'

export default function Home() {
  const healthCheck = useQuery(orpc.healthCheck.queryOptions())

  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <div className="relative min-h-screen">
        <AuroraBackgroundDemo />
      </div>
      <div className="grid gap-6">
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">API Status</h2>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${healthCheck.data ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span className="text-muted-foreground text-sm">
              {apiStatus(healthCheck)}
            </span>
          </div>
        </section>
      </div>
    </div>
  )
}

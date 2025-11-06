'use client'

import { AuroraBackground } from '@rov/ui/components/aurora-background'
import AddRoadmap from '@/components/roadmap/add-roadmap'
import Topnav from '@/components/top-nav'

const RoadmapPage = () => {
  return (
    <div>
      <AuroraBackground />
      <Topnav />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="rounded-lg border-border border-b bg-card">
          <div className="mx-auto my-2 max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
              <div className="text-center sm:text-left">
                <h1 className="font-bold text-3xl text-foreground tracking-tight sm:text-4xl">
                  Product Roadmap
                </h1>
                <p className="mt-2 text-muted-foreground text-sm sm:text-base">
                  Share your ideas and help us build better features
                </p>
              </div>
              <AddRoadmap />
            </div>
          </div>
        </header>

        <div className="mt-8 grid gap-8">
          <div className="rounded-lg bg-secondary p-6 shadow-md">
            ...content 1
          </div>
          <div className="rounded-lg bg-secondary p-6 shadow-md">
            ...content 2
          </div>
          <div className="rounded-lg bg-secondary p-6 shadow-md">
            ...content 3
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoadmapPage

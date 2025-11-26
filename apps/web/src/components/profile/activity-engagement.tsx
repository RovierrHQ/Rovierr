'use client'

import { Badge } from '@rov/ui/components/badge'
import { Card } from '@rov/ui/components/card'
import { Calendar } from 'lucide-react'

export function ActivityEngagement() {
  return (
    <Card className="space-y-6 border-border/50 bg-card/50 p-6 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Your Activity</h3>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1 rounded-lg border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-4 text-center">
          <p className="font-bold text-2xl text-primary">24</p>
          <p className="text-muted-foreground text-xs">Events Attended</p>
        </div>
        <div className="space-y-1 rounded-lg border border-accent/20 bg-gradient-to-br from-accent/10 to-accent/5 p-4 text-center">
          <p className="font-bold text-2xl text-accent">8</p>
          <p className="text-muted-foreground text-xs">Upcoming RSVPs</p>
        </div>
        <div className="space-y-1 rounded-lg border border-chart-2/20 bg-gradient-to-br from-chart-2/10 to-chart-2/5 p-4 text-center">
          <p className="font-bold text-2xl text-chart-2">42h</p>
          <p className="text-muted-foreground text-xs">Volunteer Hours</p>
        </div>
      </div>

      {/* Recent Events */}
      <div className="space-y-3">
        <h4 className="font-medium text-muted-foreground text-sm">
          Recent Events
        </h4>
        <div className="space-y-2">
          <div className="flex items-center gap-3 rounded-lg bg-secondary/30 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm">AI Workshop 2024</p>
              <p className="text-muted-foreground text-xs">
                Attended • Dec 15, 2024
              </p>
            </div>
            <Badge className="shrink-0 text-xs" variant="secondary">
              Completed
            </Badge>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-secondary/30 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
              <Calendar className="h-5 w-5 text-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm">Hackathon Prep</p>
              <p className="text-muted-foreground text-xs">
                Registered • Jan 5, 2025
              </p>
            </div>
            <Badge className="shrink-0 border-primary/30 bg-primary/15 text-primary text-xs">
              Upcoming
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  )
}

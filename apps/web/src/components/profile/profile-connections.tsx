'use client'

import { Card } from '@rov/ui/components/card'
import { Calendar, Heart, Users } from 'lucide-react'

export function ProfileConnections() {
  return (
    <Card className="space-y-4 border-border/50 bg-card/50 p-6 backdrop-blur">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Connections</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg bg-secondary/30 p-3">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" />
            <span className="text-sm">3 Mutual Clubs</span>
          </div>
          <span className="text-muted-foreground text-xs">
            Robotics, AIESEC, Design
          </span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-secondary/30 p-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-accent" />
            <span className="text-sm">5 Mutual Events</span>
          </div>
          <span className="text-muted-foreground text-xs">
            Last: AI Workshop
          </span>
        </div>
      </div>
    </Card>
  )
}

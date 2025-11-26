'use client'

import { Card } from '@rov/ui/components/card'
import { Progress } from '@rov/ui/components/progress'
import { Award, CheckCircle2, Shield, Users } from 'lucide-react'

export function Achievements() {
  return (
    <Card className="space-y-6 border-border/50 bg-card/50 p-6 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Achievements</h3>
        </div>
      </div>

      {/* Contribution Level */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Contribution Level</span>
          <span className="font-semibold text-primary">Level 8</span>
        </div>
        <Progress className="h-2" value={65} />
        <p className="text-muted-foreground text-xs">350 XP until next level</p>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-muted-foreground text-sm">
          Badges & Recognition
        </h4>
        <div className="space-y-2">
          <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-3 transition-all hover:from-primary/15 hover:to-primary/10">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm">Club President</p>
              <p className="text-muted-foreground text-xs">Robotics Society</p>
            </div>
            <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-accent/20 bg-gradient-to-r from-accent/10 to-accent/5 p-3 transition-all hover:from-accent/15 hover:to-accent/10">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
              <Award className="h-5 w-5 text-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm">Hackathon Winner</p>
              <p className="text-muted-foreground text-xs">
                HKUST Hackathon 2024
              </p>
            </div>
            <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-chart-2/20 bg-gradient-to-r from-chart-2/10 to-chart-2/5 p-3 transition-all hover:from-chart-2/15 hover:to-chart-2/10">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-2/20">
              <Users className="h-5 w-5 text-chart-2" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm">Peer Mentor</p>
              <p className="text-muted-foreground text-xs">
                Engineering Faculty
              </p>
            </div>
            <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
          </div>
        </div>
      </div>
    </Card>
  )
}

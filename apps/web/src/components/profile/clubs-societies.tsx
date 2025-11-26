'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'
import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import { ChevronRight, Users } from 'lucide-react'

export function ClubsSocieties() {
  return (
    <Card className="space-y-6 border-border/50 bg-card/50 p-6 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Clubs & Societies</h3>
        </div>
        <Button
          className="text-primary hover:text-primary"
          size="sm"
          variant="ghost"
        >
          View All
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex cursor-pointer items-center gap-4 rounded-xl bg-secondary/50 p-4 transition-colors hover:bg-secondary/70">
          <Avatar className="h-12 w-12 rounded-lg">
            <AvatarImage src="/robotics-logo.png" />
            <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
              RS
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm">Robotics Society</p>
            <p className="text-muted-foreground text-xs">
              President • 234 members
            </p>
          </div>
          <Badge className="shrink-0 border-primary/30 bg-primary/15 text-primary hover:bg-primary/25">
            Academic
          </Badge>
        </div>

        <div className="flex cursor-pointer items-center gap-4 rounded-xl bg-secondary/50 p-4 transition-colors hover:bg-secondary/70">
          <Avatar className="h-12 w-12 rounded-lg">
            <AvatarImage src="/aiesec-logo.jpg" />
            <AvatarFallback className="rounded-lg bg-accent/10 text-accent">
              AI
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm">AIESEC CUHK</p>
            <p className="text-muted-foreground text-xs">
              Committee Member • 567 members
            </p>
          </div>
          <Badge className="shrink-0 border-chart-4/30 bg-chart-4/15 text-chart-4 hover:bg-chart-4/25">
            Leadership
          </Badge>
        </div>

        <div className="flex cursor-pointer items-center gap-4 rounded-xl bg-secondary/50 p-4 transition-colors hover:bg-secondary/70">
          <Avatar className="h-12 w-12 rounded-lg">
            <AvatarImage src="/design-club-logo.jpg" />
            <AvatarFallback className="rounded-lg bg-chart-2/10 text-chart-2">
              DC
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm">Design Collective</p>
            <p className="text-muted-foreground text-xs">
              Member • 189 members
            </p>
          </div>
          <Badge className="shrink-0 border-chart-3/30 bg-chart-3/15 text-chart-3 hover:bg-chart-3/25">
            Cultural
          </Badge>
        </div>
      </div>

      {/* Suggested Clubs */}
      <div className="space-y-3 border-border/50 border-t pt-4">
        <h4 className="font-medium text-muted-foreground text-sm">
          Suggested for You
        </h4>
        <div className="-mx-2 flex gap-2 overflow-x-auto px-2 pb-2">
          <div className="w-40 shrink-0 cursor-pointer rounded-lg border border-border/50 bg-secondary/30 p-3 transition-colors hover:bg-secondary/50">
            <Avatar className="mb-2 h-10 w-10 rounded-lg">
              <AvatarImage src="/ai-club.jpg" />
              <AvatarFallback className="rounded-lg text-xs">AI</AvatarFallback>
            </Avatar>
            <p className="mb-1 font-medium text-xs">AI Research Lab</p>
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-xs">142 members</p>
              <Badge className="border-primary/30 bg-primary/15 px-1.5 py-0 text-primary text-xs">
                Academic
              </Badge>
            </div>
          </div>
          <div className="w-40 shrink-0 cursor-pointer rounded-lg border border-border/50 bg-secondary/30 p-3 transition-colors hover:bg-secondary/50">
            <Avatar className="mb-2 h-10 w-10 rounded-lg">
              <AvatarImage src="/coding-club.jpg" />
              <AvatarFallback className="rounded-lg text-xs">CC</AvatarFallback>
            </Avatar>
            <p className="mb-1 font-medium text-xs">Coding Club</p>
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-xs">298 members</p>
              <Badge className="border-primary/30 bg-primary/15 px-1.5 py-0 text-primary text-xs">
                Academic
              </Badge>
            </div>
          </div>
          <div className="w-40 shrink-0 cursor-pointer rounded-lg border border-border/50 bg-secondary/30 p-3 transition-colors hover:bg-secondary/50">
            <Avatar className="mb-2 h-10 w-10 rounded-lg">
              <AvatarImage src="/startup-society.jpg" />
              <AvatarFallback className="rounded-lg text-xs">SS</AvatarFallback>
            </Avatar>
            <p className="mb-1 font-medium text-xs">Startup Society</p>
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-xs">176 members</p>
              <Badge className="border-chart-4/30 bg-chart-4/15 px-1.5 py-0 text-chart-4 text-xs">
                Leadership
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

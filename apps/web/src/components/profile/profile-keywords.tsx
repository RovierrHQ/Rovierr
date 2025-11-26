'use client'

import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import { Tag } from 'lucide-react'

export function ProfileKeywords() {
  return (
    <Card className="space-y-4 border-border/50 bg-card/50 p-6 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Keywords</h3>
        </div>
        <Button
          className="text-primary text-xs hover:text-primary"
          size="sm"
          variant="ghost"
        >
          Edit
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge className="border-primary/30 bg-primary/15 px-3 py-1.5 text-primary hover:bg-primary/25">
          AI
        </Badge>
        <Badge className="border-accent/30 bg-accent/15 px-3 py-1.5 text-accent hover:bg-accent/25">
          Robotics
        </Badge>
        <Badge className="border-chart-2/30 bg-chart-2/15 px-3 py-1.5 text-chart-2 hover:bg-chart-2/25">
          Leadership
        </Badge>
        <Badge className="border-chart-3/30 bg-chart-3/15 px-3 py-1.5 text-chart-3 hover:bg-chart-3/25">
          Design
        </Badge>
        <Badge className="border-chart-4/30 bg-chart-4/15 px-3 py-1.5 text-chart-4 hover:bg-chart-4/25">
          Innovation
        </Badge>
      </div>
    </Card>
  )
}

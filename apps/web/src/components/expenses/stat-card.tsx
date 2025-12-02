import { Card } from '@rov/ui/components/card'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  change?: string
  changeType?: 'positive' | 'negative'
  icon: LucideIcon
}

export function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon
}: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="font-medium text-muted-foreground text-sm">{title}</p>
          <p className="font-bold text-3xl text-card-foreground">{value}</p>
          {change && (
            <p
              className={`text-sm ${changeType === 'positive' ? 'text-accent' : 'text-destructive'}`}
            >
              {change}
            </p>
          )}
        </div>
        <div className="rounded-lg bg-primary/10 p-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </Card>
  )
}

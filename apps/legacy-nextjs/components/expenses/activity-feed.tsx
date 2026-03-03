import { Avatar, AvatarFallback } from '@rov/ui/components/avatar'
import { Card } from '@rov/ui/components/card'
import { CheckCircle, DollarSign, FileText, XCircle } from 'lucide-react'

const activities = [
  {
    id: 1,
    user: 'Sarah Chen',
    initials: 'SC',
    action: 'approved',
    expense: 'Marketing Campaign Materials',
    amount: '$2,450.00',
    time: '2 minutes ago',
    icon: CheckCircle,
    iconColor: 'text-accent'
  },
  {
    id: 2,
    user: 'Michael Torres',
    initials: 'MT',
    action: 'submitted',
    expense: 'Q4 Conference Travel',
    amount: '$3,200.00',
    time: '15 minutes ago',
    icon: FileText,
    iconColor: 'text-primary'
  },
  {
    id: 3,
    user: 'Emma Wilson',
    initials: 'EW',
    action: 'marked paid',
    expense: 'Office Supplies - November',
    amount: '$485.00',
    time: '1 hour ago',
    icon: DollarSign,
    iconColor: 'text-chart-3'
  },
  {
    id: 4,
    user: 'David Park',
    initials: 'DP',
    action: 'rejected',
    expense: 'Team Lunch Expense',
    amount: '$125.00',
    time: '2 hours ago',
    icon: XCircle,
    iconColor: 'text-destructive'
  },
  {
    id: 5,
    user: 'Lisa Anderson',
    initials: 'LA',
    action: 'submitted',
    expense: 'Software License Renewal',
    amount: '$899.00',
    time: '3 hours ago',
    icon: FileText,
    iconColor: 'text-primary'
  }
]

export function ActivityFeed() {
  return (
    <Card className="p-6">
      <h3 className="mb-4 font-semibold text-card-foreground text-lg">
        Recent Activity
      </h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div className="flex items-start gap-4" key={activity.id}>
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                {activity.initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-card-foreground text-sm">
                  {activity.user}
                </p>
                <span className="text-muted-foreground text-sm">
                  {activity.action}
                </span>
              </div>
              <p className="text-card-foreground text-sm">{activity.expense}</p>
              <div className="flex items-center gap-2">
                <span className="font-medium text-card-foreground text-sm">
                  {activity.amount}
                </span>
                <span className="text-muted-foreground text-xs">
                  • {activity.time}
                </span>
              </div>
            </div>

            <activity.icon className={`h-5 w-5 ${activity.iconColor}`} />
          </div>
        ))}
      </div>
    </Card>
  )
}

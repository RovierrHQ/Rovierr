import { Card } from '@rov/ui/components/card'

type DiscussionStatsProps = {
  // Legacy props (from legacy-nextjs)
  totalDiscussions?: number
  activeToday?: number
  userContributions?: number
  // Current props (from web)
  totalThreads?: number
  totalReplies?: number
  activeUsers?: number
}

export function DiscussionStats({
  totalDiscussions,
  activeToday,
  userContributions,
  totalThreads,
  totalReplies,
  activeUsers
}: DiscussionStatsProps) {
  // Use legacy props if provided, otherwise use current props
  const threads = totalDiscussions ?? totalThreads ?? 0
  const replies = totalReplies ?? 0
  const users = activeToday ?? activeUsers ?? 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="p-6 text-center">
        <div className="text-2xl font-bold text-primary mb-1">{threads}</div>
        <div className="text-sm text-muted-foreground">
          {totalDiscussions !== undefined
            ? 'Total Discussions'
            : 'Total Threads'}
        </div>
      </Card>

      <Card className="p-6 text-center">
        <div className="text-2xl font-bold text-primary mb-1">
          {replies || (userContributions ?? 0)}
        </div>
        <div className="text-sm text-muted-foreground">
          {totalReplies !== undefined ? 'Total Replies' : 'Contributions'}
        </div>
      </Card>

      <Card className="p-6 text-center">
        <div className="text-2xl font-bold text-primary mb-1">{users}</div>
        <div className="text-sm text-muted-foreground">
          {activeToday !== undefined ? 'Active Today' : 'Active Users'}
        </div>
      </Card>
    </div>
  )
}

import { Card } from '@rov/ui/components/card'

type DiscussionStatsProps = {
  totalThreads: number
  totalReplies: number
  activeUsers: number
}

export function DiscussionStats({ totalThreads, totalReplies, activeUsers }: DiscussionStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="p-6 text-center">
        <div className="text-2xl font-bold text-primary mb-1">{totalThreads}</div>
        <div className="text-sm text-muted-foreground">Total Threads</div>
      </Card>
      
      <Card className="p-6 text-center">
        <div className="text-2xl font-bold text-primary mb-1">{totalReplies}</div>
        <div className="text-sm text-muted-foreground">Total Replies</div>
      </Card>
      
      <Card className="p-6 text-center">
        <div className="text-2xl font-bold text-primary mb-1">{activeUsers}</div>
        <div className="text-sm text-muted-foreground">Active Users</div>
      </Card>
    </div>
  )
}

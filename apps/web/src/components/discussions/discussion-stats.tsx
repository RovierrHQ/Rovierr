import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'
import { MessageSquare, ThumbsUp, TrendingUp } from 'lucide-react'

interface DiscussionStatsProps {
  totalDiscussions: number
  activeToday: number
  userContributions: number
}

export function DiscussionStats({
  totalDiscussions,
  activeToday,
  userContributions
}: DiscussionStatsProps) {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <MessageSquare className="h-4 w-4" />
            Total Discussions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{totalDiscussions}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4" />
            Active Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{activeToday}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <ThumbsUp className="h-4 w-4" />
            Your Contributions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{userContributions}</div>
          <p className="text-muted-foreground text-xs">posts & replies</p>
        </CardContent>
      </Card>
    </div>
  )
}

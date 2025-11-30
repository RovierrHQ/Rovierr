import { Card, CardContent } from '@rov/ui/components/card'
import { MessageSquare } from 'lucide-react'
import { DiscussionCard } from './discussion-card'
import type { Discussion } from './types'

interface DiscussionListProps {
  discussions: Discussion[]
  selectedDiscussionId: string | null
  onSelectDiscussion: (id: string) => void
  emptyMessage?: string
}

export function DiscussionList({
  discussions,
  selectedDiscussionId,
  onSelectDiscussion,
  emptyMessage = 'No discussions found'
}: DiscussionListProps) {
  if (discussions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="mb-2 font-semibold text-lg">{emptyMessage}</h3>
          <p className="mb-4 text-center text-muted-foreground text-sm">
            Be the first to start a discussion!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {discussions.map((discussion) => (
        <DiscussionCard
          discussion={discussion}
          isSelected={selectedDiscussionId === discussion.id}
          key={discussion.id}
          onClick={() => onSelectDiscussion(discussion.id)}
        />
      ))}
    </div>
  )
}

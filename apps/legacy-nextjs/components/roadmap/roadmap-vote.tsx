'use client'

import { Button } from '@rov/ui/components/button'
import { useQueryClient } from '@tanstack/react-query'
import api, { useMutation } from '@web/lib/api-client'
import { authClient } from '@web/lib/auth-client'
import { ThumbsUp } from 'lucide-react'
import { redirect } from 'next/navigation'
import type { FC } from 'react'
import { useMemo } from 'react'

type RoadmapVoteProps = {
  roadmapId: string
  upvotes?: Array<{
    id: string
    userId: string
    roadmapId: string
    createdAt: string
    updatedAt: string
  }>
}

const RoadmapVote: FC<RoadmapVoteProps> = ({
  roadmapId,
  upvotes: upvotesProp
}) => {
  const { data: session } = authClient.useSession()
  const userId = session?.user.id
  const queryClient = useQueryClient()

  // Get upvotes from prop or from list query cache
  const upvotes = useMemo(() => {
    if (upvotesProp) return upvotesProp

    // Try to get from list query cache
    const listData = queryClient.getQueryData(['roadmap', 'list']) as
      | {
          data: Array<{
            id: string
            upvotes: Array<{
              id: string
              userId: string
              roadmapId: string
              createdAt: string
              updatedAt: string
            }>
          }>
        }
      | undefined

    const roadmap = listData?.data?.find((item) => item.id === roadmapId)
    return roadmap?.upvotes ?? []
  }, [upvotesProp, roadmapId, queryClient])

  const { mutateAsync, isPending } = useMutation<{ roadmapId: string }>(
    api.roadmap.vote.post,
    {
      onSuccess: () => {
        // Invalidate list query to refresh upvotes
        queryClient.invalidateQueries({
          queryKey: ['roadmap', 'list']
        })
      }
    }
  )

  const handleVote = async () => {
    if (!userId) return redirect('/login')
    await mutateAsync({ roadmapId })
  }

  const voted = upvotes.some((vote) => vote.userId === userId)
  const totalVotes = upvotes.length

  if (isPending) {
    return (
      <Button
        className="flex items-center gap-2"
        disabled
        size="sm"
        variant="outline"
      >
        <ThumbsUp className="h-4 w-4 animate-pulse text-muted-foreground" />
        <span className="animate-pulse text-muted-foreground">...</span>
      </Button>
    )
  }

  return (
    <Button
      className={`flex items-center gap-2 transition-all duration-200 ${
        voted
          ? 'scale-105 bg-primary text-primary-foreground hover:bg-primary/90'
          : 'scale-100'
      }`}
      onClick={handleVote}
      size="sm"
      variant={voted ? 'default' : 'outline'}
    >
      <ThumbsUp
        className={`h-4 w-4 transition-all duration-200 ${
          voted
            ? 'text-primary-foreground'
            : 'text-muted-foreground group-hover:text-foreground'
        }`}
      />
      <span>{totalVotes}</span>
    </Button>
  )
}

export default RoadmapVote

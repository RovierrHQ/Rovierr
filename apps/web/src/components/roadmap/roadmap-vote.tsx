'use client'

import { Button } from '@rov/ui/components/button'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ThumbsUp } from 'lucide-react'
import { redirect } from 'next/navigation'
import type { FC } from 'react'
import { authClient } from '@/lib/auth-client'
import { orpc, queryClient } from '@/utils/orpc'

type RoadmapVoteProps = {
  roadmapId: string
}

const RoadmapVote: FC<RoadmapVoteProps> = ({ roadmapId }) => {
  const { data: session } = authClient.useSession()
  const userId = session?.user.id

  const { data, isLoading } = useQuery(
    orpc.roadmap.voteList.queryOptions({ input: { roadmapId } })
  )

  const { mutateAsync, isPending } = useMutation(
    orpc.roadmap.vote.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.roadmap.voteList.key({ input: { roadmapId } })
        })
      }
    })
  )

  const handleVote = async () => {
    if (!userId) return redirect('/login')
    await mutateAsync({ roadmapId })
  }

  const voted = data?.votes?.some((vote) => vote.userId === userId) ?? false
  const totalVotes = data?.votes?.length ?? 0

  if (isLoading || isPending) {
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

'use client'

import { Button } from '@rov/ui/components/button'
import { useQueryClient } from '@tanstack/react-query'
import api, { useMutation } from '@web/lib/api-client'
import { authClient } from '@web/lib/auth-client'
import { ThumbsUp } from 'lucide-react'
import { redirect } from 'next/navigation'
import type { FC } from 'react'
import { useMemo } from 'react'
import { toast } from 'sonner'

type CommentVoteProps = {
  commentId: string
  commentUserId: string
  upvotes?: Array<{
    id: string
    userId: string
    createdAt: string
    updatedAt: string
  }>
}

const CommentVote: FC<CommentVoteProps> = ({
  commentId,
  commentUserId,
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
            comments: Array<{
              id: string
              upvotes: Array<{
                id: string
                userId: string
                createdAt: string
                updatedAt: string
              }>
            }>
          }>
        }
      | undefined

    const roadmap = listData?.data?.find((item) =>
      item.comments?.some((cmt) => cmt.id === commentId)
    )
    const comment = roadmap?.comments?.find((c) => c.id === commentId)
    return comment?.upvotes ?? []
  }, [upvotesProp, commentId, queryClient])

  const { mutateAsync, isPending } = useMutation(
    (body: { commentId: string }) => api.roadmap.comment.vote.post(body),
    {
      onMutate: async () => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({
          queryKey: ['roadmap', 'list']
        })

        // Snapshot the previous value
        const previousData = queryClient.getQueryData(['roadmap', 'list'])

        // Optimistically update the cache
        queryClient.setQueryData(['roadmap', 'list'], (old: unknown) => {
          const oldData = old as
            | {
                data: Array<{
                  id: string
                  comments?: Array<{
                    id: string
                    upvotes: Array<{
                      id: string
                      userId: string
                      createdAt: string
                      updatedAt: string
                    }>
                  }>
                }>
                meta?: unknown
              }
            | undefined

          if (!(oldData && userId)) return old

          return {
            ...oldData,
            data: oldData.data.map((roadmap) => {
              if (!roadmap.comments) return roadmap

              return {
                ...roadmap,
                comments: roadmap.comments.map((comment) => {
                  if (comment.id !== commentId) return comment

                  const hasVote = comment.upvotes.some(
                    (vote) => vote.userId === userId
                  )

                  if (hasVote) {
                    // Remove vote
                    return {
                      ...comment,
                      upvotes: comment.upvotes.filter(
                        (vote) => vote.userId !== userId
                      )
                    }
                  }
                  // Add vote
                  return {
                    ...comment,
                    upvotes: [
                      ...comment.upvotes,
                      {
                        id: `temp-${Date.now()}`,
                        userId,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                      }
                    ]
                  }
                })
              }
            })
          }
        })

        return { previousData }
      },
      onError: (_error, _variables, context) => {
        // Rollback on error
        if (context?.previousData) {
          queryClient.setQueryData(['roadmap', 'list'], context.previousData)
        }

        const errorMessage =
          (_error.value as { message?: string } | undefined)?.message ||
          'Failed to vote on comment'
        if (errorMessage.includes('cannot vote on your own')) {
          toast.error('You cannot vote on your own comment')
        } else {
          toast.error(errorMessage)
        }
      },
      onSettled: () => {
        // Refetch to ensure consistency
        queryClient.invalidateQueries({
          queryKey: ['roadmap', 'list']
        })
      }
    }
  )

  const handleVote = async () => {
    if (!userId) return redirect('/login')
    try {
      await mutateAsync({ commentId })
    } catch {
      // Error handling is done by the mutation
    }
  }

  const voted = upvotes.some((vote) => vote.userId === userId)
  const totalVotes = upvotes.length
  const isOwnComment = userId === commentUserId
  const isDisabled = isOwnComment || isPending

  if (isPending) {
    return (
      <Button
        className="flex items-center gap-2"
        disabled
        size="sm"
        variant="outline"
      >
        <ThumbsUp className="h-3 w-3 animate-pulse text-muted-foreground" />
        <span className="animate-pulse text-muted-foreground text-xs">...</span>
      </Button>
    )
  }

  return (
    <Button
      className={`flex items-center gap-2 transition-all duration-200 ${
        voted
          ? 'scale-105 bg-primary text-primary-foreground hover:bg-primary/90'
          : 'scale-100'
      } ${isOwnComment ? 'cursor-not-allowed opacity-50' : ''}`}
      disabled={isDisabled}
      onClick={handleVote}
      size="sm"
      title={isOwnComment ? 'Cannot vote on your own comment' : undefined}
      variant={voted ? 'default' : 'outline'}
    >
      <ThumbsUp
        className={`h-3 w-3 transition-all duration-200 ${
          voted
            ? 'text-primary-foreground'
            : 'text-muted-foreground group-hover:text-foreground'
        }`}
      />
      <span className="text-xs">{totalVotes}</span>
    </Button>
  )
}

export default CommentVote

'use client'

import { Button } from '@rov/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@rov/ui/components/dialog'
import { useAppForm } from '@rov/ui/components/form/index'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { redirect } from 'next/navigation'
import type { FC } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { authClient } from '@/lib/auth-client'
import { orpc } from '@/utils/orpc'
import UserInfo from '../profile/user-info'
import CommentVote from './comment-vote'

const commentSchema = z.object({
  text: z.string().min(1, 'Comment cannot be empty')
})

type Comment = {
  id: string
  text: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    image: string | null
  }
  upvotes: Array<{
    id: string
    userId: string
    createdAt: string
    updatedAt: string
  }>
}

type RoadmapCommentsProps = {
  roadmapId: string
  roadmapTitle: string
  comments: Comment[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

const RoadmapComments: FC<RoadmapCommentsProps> = ({
  roadmapId,
  roadmapTitle,
  comments,
  open,
  onOpenChange
}) => {
  const { data: session } = authClient.useSession()
  const queryClient = useQueryClient()

  const form = useAppForm({
    validators: {
      onSubmit: commentSchema
    },
    defaultValues: {
      text: ''
    },
    onSubmit: async ({ value }) => {
      try {
        if (!session?.user.id) return redirect('/login')

        await mutateAsync({
          roadmapId,
          text: value.text
        })

        toast.success('Comment added successfully!')
        form.reset()
      } catch {
        toast.error('Failed to add comment.')
      }
    }
  })

  const { mutateAsync, isPending } = useMutation(
    orpc.roadmap.createComment.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.roadmap.list.key()
        })
      }
    })
  )

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="flex max-h-[80vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Comments - {roadmapTitle}</DialogTitle>
          <DialogDescription>
            View and add comments for this roadmap item
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
          {comments.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  className="space-y-2 rounded-lg border border-border p-4"
                  key={comment.id}
                >
                  <div className="flex items-start justify-between">
                    <UserInfo
                      image={comment.user.image || ''}
                      name={comment.user.name}
                    />
                    <CommentVote
                      commentId={comment.id}
                      commentUserId={comment.user.id}
                      upvotes={comment.upvotes}
                    />
                  </div>
                  <p className="text-sm leading-relaxed">{comment.text}</p>
                  <div className="text-muted-foreground text-xs">
                    {new Date(comment.createdAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {session?.user.id && (
          <form
            className="mt-4 space-y-4 border-t pt-4"
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
          >
            <form.AppField
              children={(field) => (
                <field.TextArea
                  label="Add a comment"
                  placeholder="Write your comment here..."
                  rows={3}
                />
              )}
              name="text"
            />

            <DialogFooter>
              <Button
                disabled={isPending || form.state.isSubmitting}
                onClick={() => onOpenChange(false)}
                type="button"
                variant="outline"
              >
                Close
              </Button>
              <Button
                disabled={isPending || form.state.isSubmitting}
                type="submit"
              >
                {isPending || form.state.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Post Comment'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {!session?.user.id && (
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)} variant="outline">
              Close
            </Button>
            <Button
              onClick={() => redirect('/login')}
              type="button"
              variant="default"
            >
              Login to Comment
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default RoadmapComments

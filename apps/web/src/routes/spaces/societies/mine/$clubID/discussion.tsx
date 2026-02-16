import type { ThreadListItem } from '@api/routers/discussion/schemas'
import { Button } from '@rov/ui/components/button'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from '@rov/ui/components/sidebar'
import { createFileRoute } from '@tanstack/react-router'
import { CreateThreadDialog } from '@web/components/discussions/create-thread-dialog'
import { DiscussionFilters } from '@web/components/discussions/discussion-filters'
import { DiscussionList } from '@web/components/discussions/discussion-list'
import { DiscussionStats } from '@web/components/discussions/discussion-stats'
import { ThreadView } from '@web/components/discussions/thread-view'
import type { Discussion } from '@web/components/discussions/types'
import { SpacesSidebar } from '@web/components/layout/spaces-sidebar'
import api, { useMutation, useQuery } from '@web/lib/api-client'
import { MessageSquare } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute(
  '/spaces/societies/mine/$clubID/discussion'
)({
  component: DiscussionPage
})

function DiscussionPage() {
  const { clubID } = Route.useParams()
  const [selectedThread, setSelectedThread] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'trending' | 'recent' | 'unanswered'
  >('all')

  // Get threads for this club
  const {
    data: threadsData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['discussion', 'threads', clubID],
    queryFn: () =>
      api.discussion.thread.list.get({
        query: { organizationId: clubID }
      }),
    enabled: !!clubID
  })

  // Create thread mutation
  const createThreadMutation = useMutation(
    (thread: { title: string; content: string; tags: string[] }) =>
      api.discussion.thread.create.post({
        ...thread,
        organizationId: clubID
      }),
    {
      onSuccess: () => {
        toast.success('Discussion created successfully!')
        refetch()
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : 'Failed to create discussion'
        )
      }
    }
  )

  const handleCreateThread = (thread: {
    title: string
    content: string
    tags: string[]
  }) => {
    createThreadMutation.mutate(thread)
  }

  const selectedThreadData = threadsData?.find(
    (thread: ThreadListItem) => thread.id === selectedThread
  )

  if (isLoading) {
    return (
      <SidebarProvider>
        <SpacesSidebar />
        <SidebarInset>
          <div className="flex h-screen">
            <div className="flex-1 p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-muted rounded w-1/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      className="h-20 bg-muted rounded"
                      key={`reply-skeleton-${i}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <SpacesSidebar />
      <SidebarInset>
        <div className="flex h-screen">
          <div className="flex-1 p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                  <h1 className="text-2xl font-bold">Discussions</h1>
                  <MessageSquare className="h-6 w-6 text-muted-foreground" />
                </div>
                <CreateThreadDialog
                  disabled={createThreadMutation.isPending}
                  onCreateThread={handleCreateThread}
                />
              </div>
            </div>

            {selectedThread ? (
              <div>
                <Button
                  className="mb-4"
                  onClick={() => setSelectedThread(null)}
                  variant="ghost"
                >
                  ← Back to all discussions
                </Button>
                <ThreadView
                  onReply={() => {
                    // Handle reply logic here
                    toast.success('Reply posted successfully!')
                  }}
                  onVote={() => {
                    // Handle vote logic here
                    toast.success('Vote recorded!')
                  }}
                  thread={selectedThreadData as Discussion}
                />
              </div>
            ) : (
              <div>
                <DiscussionStats
                  activeUsers={0}
                  totalReplies={0} // This would come from API
                  totalThreads={threadsData?.length || 0} // This would come from API
                />

                <DiscussionFilters
                  onFilterChange={setSelectedFilter}
                  onSearchChange={setSearchQuery}
                  searchQuery={searchQuery}
                  selectedFilter={selectedFilter}
                />

                <DiscussionList
                  loading={isLoading}
                  onThreadClick={(threadId) => setSelectedThread(threadId)}
                  threads={threadsData || []}
                />
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

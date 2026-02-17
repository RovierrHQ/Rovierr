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
import { SpacesSidebar } from '@web/components/layout/spaces-sidebar'
import api, { useQuery } from '@web/lib/api-client'
import { MessageSquare } from 'lucide-react'
import { useState } from 'react'

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
  const { data: threadsData, isLoading } = useQuery({
    queryKey: ['discussion', 'threads', clubID],
    queryFn: () =>
      api.discussion.thread.list.get({
        query: { contextType: 'society', contextId: clubID }
      }),
    enabled: !!clubID
  })

  // Fetch full thread with replies when one is selected
  const { data: fullThreadData, isLoading: isThreadLoading } = useQuery({
    queryKey: ['discussion', 'thread', 'get', selectedThread],
    queryFn: () =>
      api.discussion.thread({ id: selectedThread as string }).get(),
    enabled: !!selectedThread
  })

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
                  contextId={clubID}
                  contextType="society"
                  onOpenChange={() => {}}
                  open={true}
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
                {isThreadLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div
                          className="h-16 bg-muted rounded"
                          key={`thread-skeleton-${i}`}
                        />
                      ))}
                    </div>
                  </div>
                ) : fullThreadData ? (
                  <ThreadView
                    discussion={fullThreadData}
                    onClose={() => setSelectedThread(null)}
                    replies={fullThreadData.replies ?? []}
                  />
                ) : null}
              </div>
            ) : (
              <div>
                <DiscussionStats
                  activeUsers={threadsData?.threads.length ?? 0}
                  totalReplies={
                    threadsData?.threads.reduce(
                      (acc, thread) => acc + (thread.replyCount ?? 0),
                      0
                    ) ?? 0
                  }
                  totalThreads={threadsData?.total ?? 0}
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
                  threads={threadsData?.threads ?? []}
                />
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

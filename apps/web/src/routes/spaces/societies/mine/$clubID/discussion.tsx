import { Button } from '@rov/ui/components/button'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from '@rov/ui/components/sidebar'
import { createFileRoute, useParams } from '@tanstack/react-router'
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
  const params = useParams({
    from: '/spaces/societies/mine/$clubID/discussion'
  })
  const clubID = params.clubID
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'pinned' | 'resolved' | 'unresolved'
  >('all')
  const [selectedThread, setSelectedThread] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Get threads for this club - matching legacy query structure
  const { data: threadsData, isLoading } = useQuery({
    queryKey: [
      'discussion',
      'thread',
      'list',
      {
        contextType: 'society',
        contextId: clubID,
        search: searchQuery,
        sortBy: 'recent',
        limit: 50,
        offset: 0
      }
    ],
    queryFn: () =>
      api.discussion.thread.list.get({
        query: {
          contextType: 'society',
          contextId: clubID,
          search: searchQuery || undefined,
          sortBy: 'recent',
          limit: 50,
          offset: 0
        }
      }),
    enabled: !!clubID
  })

  // Fetch full thread with replies when one is selected
  const { data: selectedThreadData } = useQuery({
    queryKey: ['discussion', 'thread', 'get', selectedThread],
    queryFn: () =>
      api.discussion.thread.get({
        query: { id: selectedThread || '' }
      }),
    enabled: !!selectedThread
  })

  // Filter discussions based on selected filter (matching legacy logic)
  const filteredThreads = (threadsData?.threads ?? []).filter((thread) => {
    if (selectedFilter === 'all') return true
    if (selectedFilter === 'pinned') return thread.isPinned
    if (selectedFilter === 'resolved') return false // TODO: implement resolved status
    if (selectedFilter === 'unresolved') return false // TODO: implement resolved status
    return true
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
          {/* Left Panel - Discussions List */}
          <div
            className={`flex flex-col flex-1 p-6 ${
              selectedThread ? 'w-1/2' : 'w-full'
            } transition-all`}
          >
            <div className="mb-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                  <div>
                    <h1 className="text-2xl font-bold">Discussions</h1>
                    <p className="text-sm text-muted-foreground">
                      Ask questions, share resources, and collaborate with
                      members
                    </p>
                  </div>
                </div>
                {!selectedThread && (
                  <Button onClick={() => setCreateDialogOpen(true)} size="lg">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    New Discussion
                  </Button>
                )}
              </div>

              <DiscussionFilters
                onFilterChange={setSelectedFilter}
                onSearchChange={setSearchQuery}
                searchQuery={searchQuery}
                selectedFilter={selectedFilter}
              />
            </div>

            {/* Stats Cards - Only show when no thread selected */}
            {!selectedThread && (
              <DiscussionStats
                activeToday={
                  filteredThreads.filter((d) =>
                    d.createdAt.includes(new Date().toISOString())
                  ).length
                }
                totalDiscussions={threadsData?.total ?? 0}
                userContributions={0}
              />
            )}

            {/* Discussions List */}
            <div className="flex-1 overflow-y-auto pr-4">
              <DiscussionList
                loading={isLoading}
                onThreadClick={(threadId) => setSelectedThread(threadId)}
                threads={filteredThreads}
              />
            </div>
          </div>

          {/* Right Panel - Thread View (Slack-style) */}
          {selectedThread && selectedThreadData && (
            <ThreadView
              discussion={selectedThreadData}
              onClose={() => setSelectedThread(null)}
              replies={selectedThreadData.replies ?? []}
            />
          )}
        </div>
      </SidebarInset>

      {/* Create Thread Dialog */}
      <CreateThreadDialog
        contextId={clubID}
        contextType="society"
        onOpenChange={setCreateDialogOpen}
        open={createDialogOpen}
      />
    </SidebarProvider>
  )
}

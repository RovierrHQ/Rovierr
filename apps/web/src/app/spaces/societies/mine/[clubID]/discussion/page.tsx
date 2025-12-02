'use client'

import { Button } from '@rov/ui/components/button'
import { useQuery } from '@tanstack/react-query'
import { MessageSquare } from 'lucide-react'
import { use, useState } from 'react'
import { CreateThreadDialog } from '@/components/discussions/create-thread-dialog'
import { DiscussionFilters } from '@/components/discussions/discussion-filters'
import { DiscussionList } from '@/components/discussions/discussion-list'
import { DiscussionStats } from '@/components/discussions/discussion-stats'
import { ThreadView } from '@/components/discussions/thread-view'
import type { Discussion, Reply } from '@/components/discussions/types'
import { orpc } from '@/utils/orpc'

interface PageProps {
  params: Promise<{ clubID: string }>
}

export default function SocietyDiscussionsPage({ params }: PageProps) {
  const { clubID } = use(params)
  const discussionContextId = clubID
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'pinned' | 'resolved' | 'unresolved'
  >('all')
  const [selectedDiscussion, setSelectedDiscussion] = useState<string | null>(
    null
  )
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Fetch discussions from the backend
  const { data: threadsData, isLoading } = useQuery(
    orpc.discussion.thread.list.queryOptions({
      input: {
        contextType: 'society',
        contextId: discussionContextId,
        search: searchQuery || undefined,
        sortBy: 'recent',
        limit: 50,
        offset: 0
      }
    })
  )

  // Fetch selected thread details with replies
  const { data: selectedThreadData } = useQuery(
    orpc.discussion.thread.get.queryOptions({
      input: { id: selectedDiscussion || '' },
      enabled: !!selectedDiscussion
    })
  )

  // Map backend data to frontend types
  const discussions: Discussion[] =
    threadsData?.threads.map((thread) => ({
      id: thread.id,
      title: thread.title,
      content: thread.content,
      author: {
        name: thread.author.isAnonymous
          ? 'Anonymous'
          : thread.author.name || 'Unknown',
        avatar: thread.author.isAnonymous ? null : thread.author.image,
        role: 'Member' // TODO: Get actual role from user data
      },
      isPinned: thread.isPinned,
      isResolved: false, // TODO: Implement resolved status
      replies: thread.replyCount,
      upvotes: thread.votes.upvotes - thread.votes.downvotes,
      createdAt: new Date(thread.createdAt).toLocaleString(),
      tags: thread.tags || [],
      userVote: thread.votes.userVote,
      contextType: 'society',
      contextId: discussionContextId
    })) || []

  // Filter discussions based on selected filter
  const filteredDiscussions = discussions.filter((discussion) => {
    const matchesFilter =
      selectedFilter === 'all' ||
      (selectedFilter === 'pinned' && discussion.isPinned) ||
      (selectedFilter === 'resolved' && discussion.isResolved) ||
      (selectedFilter === 'unresolved' && !discussion.isResolved)

    return matchesFilter
  })

  const currentDiscussion = selectedThreadData
    ? {
        id: selectedThreadData.id,
        title: selectedThreadData.title,
        content: selectedThreadData.content,
        author: {
          name: selectedThreadData.author.isAnonymous
            ? 'Anonymous'
            : selectedThreadData.author.name || 'Unknown',
          avatar: selectedThreadData.author.isAnonymous
            ? null
            : selectedThreadData.author.image,
          role: 'Member'
        },
        isPinned: selectedThreadData.isPinned,
        isResolved: false,
        replies: selectedThreadData.replyCount,
        upvotes:
          selectedThreadData.votes.upvotes - selectedThreadData.votes.downvotes,
        createdAt: new Date(selectedThreadData.createdAt).toLocaleString(),
        tags: selectedThreadData.tags || [],
        userVote: selectedThreadData.votes.userVote,
        contextType: 'society' as const,
        contextId: discussionContextId
      }
    : undefined

  // Map replies from backend data
  const mapReplyToFrontend = (reply: {
    id: string
    threadId: string
    content: string
    author: { name: string | null; image: string | null; isAnonymous: boolean }
    votes: {
      upvotes: number
      downvotes: number
      userVote: 'up' | 'down' | null
    }
    createdAt: string
    isEndorsed: boolean
  }): Reply => ({
    id: reply.id,
    threadId: reply.threadId,
    content: reply.content,
    author: {
      name: reply.author.isAnonymous
        ? 'Anonymous'
        : reply.author.name || 'Unknown',
      avatar: reply.author.isAnonymous ? null : reply.author.image,
      role: reply.isEndorsed ? 'Moderator' : 'Member'
    },
    upvotes: reply.votes.upvotes - reply.votes.downvotes,
    createdAt: new Date(reply.createdAt).toLocaleString(),
    isAnswer: reply.isEndorsed,
    userVote: reply.votes.userVote
  })

  const currentReplies: Reply[] = selectedThreadData?.replies
    ? selectedThreadData.replies.map(mapReplyToFrontend)
    : []

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <div className="text-center">
          <MessageSquare className="mx-auto mb-4 h-12 w-12 animate-pulse text-muted-foreground" />
          <p className="text-muted-foreground">Loading discussions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-4 p-10">
      {/* Left Panel - Discussions List */}
      <div
        className={`flex flex-col ${selectedDiscussion ? 'w-1/2' : 'w-full'} transition-all`}
      >
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="mb-2 font-bold text-3xl">Discussions</h1>
              <p className="text-muted-foreground">
                Ask questions, share resources, and collaborate with members
              </p>
            </div>
            {!selectedDiscussion && (
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

        {/* Stats Cards - Only show when no discussion selected */}
        {!selectedDiscussion && (
          <DiscussionStats
            activeToday={
              discussions.filter((d) => d.createdAt.includes('hour')).length
            }
            totalDiscussions={threadsData?.total || 0}
            userContributions={8} // TODO: Get actual user contributions
          />
        )}

        {/* Discussions List */}
        <div className="flex-1 overflow-y-auto pr-4">
          <DiscussionList
            discussions={filteredDiscussions}
            emptyMessage={
              searchQuery
                ? 'No discussions match your search'
                : 'No discussions found'
            }
            onSelectDiscussion={setSelectedDiscussion}
            selectedDiscussionId={selectedDiscussion}
          />
        </div>
      </div>

      {/* Right Panel - Thread View (Slack-style) */}
      {selectedDiscussion && currentDiscussion && (
        <ThreadView
          discussion={currentDiscussion}
          onClose={() => setSelectedDiscussion(null)}
          replies={currentReplies}
        />
      )}

      {/* Create Thread Dialog */}
      <CreateThreadDialog
        contextId={discussionContextId}
        contextType="society"
        onOpenChange={setCreateDialogOpen}
        open={createDialogOpen}
      />
    </div>
  )
}

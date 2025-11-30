'use client'

import { Button } from '@rov/ui/components/button'
import { MessageSquare } from 'lucide-react'
import { useState } from 'react'
import { DiscussionFilters } from '@/components/discussions/discussion-filters'
import { DiscussionList } from '@/components/discussions/discussion-list'
import { DiscussionStats } from '@/components/discussions/discussion-stats'
import {
  mockDiscussions,
  mockReplies
} from '@/components/discussions/mock-data'
import { ThreadView } from '@/components/discussions/thread-view'

export default function DiscussionsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'pinned' | 'resolved' | 'unresolved'
  >('all')
  const [selectedDiscussion, setSelectedDiscussion] = useState<string | null>(
    null
  )

  const filteredDiscussions = mockDiscussions.filter((discussion) => {
    const matchesSearch =
      discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discussion.content.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter =
      selectedFilter === 'all' ||
      (selectedFilter === 'pinned' && discussion.isPinned) ||
      (selectedFilter === 'resolved' && discussion.isResolved) ||
      (selectedFilter === 'unresolved' && !discussion.isResolved)

    return matchesSearch && matchesFilter
  })

  const currentDiscussion = mockDiscussions.find(
    (d) => d.id === selectedDiscussion
  )
  const currentReplies = selectedDiscussion
    ? mockReplies[selectedDiscussion] || []
    : []

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-4">
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
                Ask questions, share resources, and collaborate with classmates
              </p>
            </div>
            {!selectedDiscussion && (
              <Button size="lg">
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
              mockDiscussions.filter((d) => d.createdAt.includes('hour')).length
            }
            totalDiscussions={mockDiscussions.length}
            userContributions={8}
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
    </div>
  )
}

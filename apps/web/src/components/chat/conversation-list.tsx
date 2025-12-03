'use client'

import type { ConversationWithLastMessage } from '@rov/orpc-contracts'
import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'
import { Button } from '@rov/ui/components/button'
import { Input } from '@rov/ui/components/input'
import { ScrollArea } from '@rov/ui/components/scroll-area'
import { Separator } from '@rov/ui/components/separator'
import { cn } from '@rov/ui/lib/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { MessageCircle, Search, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { orpc } from '@/utils/orpc'

interface ConversationListProps {
  conversations: ConversationWithLastMessage[]
  connections: Array<{
    id: string
    user: {
      id: string
      name: string
      username: string | null
      image: string | null
    } | null
  }>
  onSelect: (conversationId: string) => void
}

export function ConversationList({
  conversations,
  connections,
  onSelect
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const queryClient = useQueryClient()

  const createConversationMutation = useMutation(
    orpc.chat.getOrCreateConversation.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: ['chat', 'listConversations']
        })
        onSelect(data.id)
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to start conversation')
      }
    })
  )

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      conv.otherParticipant?.name.toLowerCase().includes(query) ||
      conv.lastMessage?.content.toLowerCase().includes(query)
    )
  })

  const filteredConnections = connections.filter((conn) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return conn.user?.name.toLowerCase().includes(query)
  })

  // Filter out connections that already have conversations
  const conversationUserIds = new Set(
    conversations.map((conv) => conv.otherParticipant?.id).filter(Boolean)
  )
  const connectionsWithoutConversations = filteredConnections.filter(
    (conn) => conn.user && !conversationUserIds.has(conn.user.id)
  )

  const handleStartChat = (userId: string) => {
    createConversationMutation.mutate({ userId })
  }

  if (conversations.length === 0 && connections.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <MessageCircle className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 font-semibold text-lg">No conversations yet</h3>
        <p className="text-muted-foreground text-sm">
          Connect with people to start chatting
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            value={searchQuery}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1 px-2">
          {connectionsWithoutConversations.length > 0 && (
            <>
              <div className="px-3 py-2 font-semibold text-muted-foreground text-xs uppercase">
                Start New Chat
              </div>
              {connectionsWithoutConversations.map((connection) => {
                const user = connection.user
                if (!user) return null

                return (
                  <button
                    className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-accent"
                    disabled={createConversationMutation.isPending}
                    key={connection.id}
                    onClick={() => handleStartChat(user.id)}
                    type="button"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.image || undefined} />
                      <AvatarFallback>
                        {user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate font-medium">{user.name}</h4>
                      {user.username && (
                        <p className="truncate text-muted-foreground text-sm">
                          @{user.username}
                        </p>
                      )}
                    </div>
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                  </button>
                )
              })}
              {filteredConversations.length > 0 && (
                <Separator className="my-2" />
              )}
            </>
          )}

          {filteredConversations.length > 0 && (
            <>
              <div className="px-3 py-2 font-semibold text-muted-foreground text-xs uppercase">
                Recent Conversations
              </div>
              {filteredConversations.map((conversation) => (
                <button
                  className={cn(
                    'flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-accent',
                    conversation.unreadCount > 0 && 'bg-accent/50'
                  )}
                  key={conversation.id}
                  onClick={() => onSelect(conversation.id)}
                  type="button"
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={conversation.otherParticipant?.image || undefined}
                      />
                      <AvatarFallback>
                        {conversation.otherParticipant?.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.unreadCount > 0 && (
                      <div className="-top-1 -right-1 absolute flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                        <span className="font-medium text-primary-foreground text-xs">
                          {conversation.unreadCount > 9
                            ? '9+'
                            : conversation.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <h4
                        className={cn(
                          'truncate font-medium',
                          conversation.unreadCount > 0 && 'font-semibold'
                        )}
                      >
                        {conversation.otherParticipant?.name}
                      </h4>
                      {conversation.lastMessageAt && (
                        <span className="ml-2 flex-shrink-0 text-muted-foreground text-xs">
                          {formatDistanceToNow(
                            new Date(conversation.lastMessageAt),
                            {
                              addSuffix: false
                            }
                          )}
                        </span>
                      )}
                    </div>

                    {conversation.lastMessage && (
                      <p
                        className={cn(
                          'truncate text-muted-foreground text-sm',
                          conversation.unreadCount > 0 && 'font-medium'
                        )}
                      >
                        {conversation.lastMessage.content}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </>
          )}

          {filteredConversations.length === 0 &&
            connectionsWithoutConversations.length === 0 && (
              <div className="py-8 text-center text-muted-foreground text-sm">
                No conversations found
              </div>
            )}
        </div>
      </ScrollArea>
    </div>
  )
}

'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'
import { Button } from '@rov/ui/components/button'
import { Input } from '@rov/ui/components/input'
import { Skeleton } from '@rov/ui/components/skeleton'
import { cn } from '@rov/ui/lib/utils'
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { ArrowLeft, Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { useCentrifugo } from '@/lib/centrifuge'
import { orpc } from '@/utils/orpc'

type Message = {
  id: string
  conversationId: string
  senderId: string
  content: string
  type: string
  createdAt: string
  sender: {
    id: string
    name: string
    username: string | null
    image: string | null
  }
}

interface ConversationViewProps {
  conversationId: string
  onBack: () => void
}

export function ConversationView({
  conversationId,
  onBack
}: ConversationViewProps) {
  const [messageInput, setMessageInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()
  const { data: session } = authClient.useSession()

  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['chat', 'messages', conversationId],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      return await orpc.chat.getMessages.call({
        conversationId,
        limit: 50,
        before: pageParam
      })
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore && lastPage.messages.length > 0) {
        return lastPage.messages[0].id
      }
      return
    },
    initialPageParam: undefined as string | undefined
  })

  const sendMutation = useMutation(
    orpc.chat.sendMessage.mutationOptions({
      onSuccess: (newMessage) => {
        setMessageInput('')
        // Add message to the list optimistically
        queryClient.setQueryData(
          ['chat', 'messages', conversationId],
          (oldData: unknown) => {
            if (!oldData || typeof oldData !== 'object') return oldData
            const queryData = oldData as {
              pages: Array<{ messages: Message[] }>
            }
            return {
              ...queryData,
              pages: queryData.pages.map((page, i) =>
                i === queryData.pages.length - 1
                  ? { ...page, messages: [...page.messages, newMessage] }
                  : page
              )
            }
          }
        )
        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    })
  )

  // Get Centrifugo connection token
  const { data: centrifugoAuth } = useQuery(
    orpc.realtime.getConnectionToken.queryOptions({
      enabled: !!session?.user?.id,
      staleTime: 55 * 60 * 1000 // 55 minutes (token expires in 1 hour)
    })
  )

  // Subscribe to real-time messages for this conversation
  useCentrifugo<{ type: string; message?: Message }>(
    {
      token: centrifugoAuth?.token
    },
    `conversation:${conversationId}`,
    (realtimeData) => {
      // Only add message if it's from another user (to avoid duplicates from optimistic updates)
      if (
        realtimeData.type === 'new_message' &&
        realtimeData.message &&
        realtimeData.message.senderId !== session?.user?.id
      ) {
        queryClient.setQueryData(
          ['chat', 'messages', conversationId],
          (realtimeOldData: unknown) => {
            if (!realtimeOldData || typeof realtimeOldData !== 'object')
              return realtimeOldData
            const realtimeQueryData = realtimeOldData as {
              pages: Array<{ messages: Message[] }>
            }
            return {
              ...realtimeQueryData,
              pages: realtimeQueryData.pages.map((page, i) =>
                i === realtimeQueryData.pages.length - 1
                  ? {
                      ...page,
                      messages: [
                        ...page.messages,
                        realtimeData.message as Message
                      ]
                    }
                  : page
              )
            }
          }
        )
        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    }
  )

  // Mark as read when opening conversation
  useEffect(() => {
    orpc.chat.markAsRead.call({ conversationId })
    queryClient.invalidateQueries({ queryKey: ['chat', 'getUnreadCount'] })
  }, [conversationId, queryClient])

  // Scroll to bottom on initial load
  useEffect(() => {
    if (data && !isLoading) {
      messagesEndRef.current?.scrollIntoView()
    }
  }, [data, isLoading])

  const handleSend = () => {
    if (!messageInput.trim() || sendMutation.isPending) return

    sendMutation.mutate({
      conversationId,
      content: messageInput,
      type: 'text'
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const messages = (data?.pages.flatMap(
    (page: { messages: Message[] }) => page.messages
  ) ?? []) as Message[]

  // Get the other user (not the current user) from messages
  const otherUser = messages.find(
    (msg) => msg.senderId !== session?.user?.id
  )?.sender

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Button onClick={onBack} size="icon" variant="ghost">
          <ArrowLeft className="h-4 w-4" />
        </Button>

        {otherUser && (
          <>
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUser.image || undefined} />
              <AvatarFallback>
                {otherUser.name
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold">{otherUser.name}</h3>
              {otherUser.username && (
                <p className="truncate text-muted-foreground text-sm">
                  @{otherUser.username}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4" ref={scrollAreaRef}>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                className={cn(
                  'flex gap-2',
                  i % 2 === 0 ? 'justify-start' : 'justify-end'
                )}
                // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton loaders don't change order
                key={`skeleton-${i}`}
              >
                <Skeleton className="h-16 w-64 rounded-lg" />
              </div>
            ))}
          </div>
        ) : null}

        {!isLoading && messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <p className="mb-2 text-muted-foreground">No messages yet</p>
              <p className="text-muted-foreground text-sm">
                Start the conversation!
              </p>
            </div>
          </div>
        ) : null}

        {!isLoading && messages.length > 0 ? (
          <div className="space-y-4">
            {hasNextPage && (
              <div className="text-center">
                <Button
                  onClick={() => fetchNextPage()}
                  size="sm"
                  variant="ghost"
                >
                  Load older messages
                </Button>
              </div>
            )}

            {messages.map((message) => {
              const isOwn = message.senderId === session?.user?.id
              return (
                <div
                  className={cn(
                    'flex gap-2',
                    isOwn ? 'justify-end' : 'justify-start'
                  )}
                  key={message.id}
                >
                  {!isOwn && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.sender.image || undefined} />
                      <AvatarFallback>
                        {message.sender.name
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={cn(
                      'max-w-[70%] rounded-lg px-4 py-2',
                      isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm">
                      {message.content}
                    </p>
                    <p
                      className={cn(
                        'mt-1 text-xs',
                        isOwn
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      )}
                    >
                      {formatDistanceToNow(new Date(message.createdAt), {
                        addSuffix: true
                      })}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        ) : null}
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            disabled={sendMutation.isPending}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            value={messageInput}
          />
          <Button
            disabled={!messageInput.trim() || sendMutation.isPending}
            onClick={handleSend}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

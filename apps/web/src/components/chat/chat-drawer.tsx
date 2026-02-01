'use client'

import { Badge } from '@rov/ui/components/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@rov/ui/components/sheet'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@rov/ui/components/sidebar'
import { useQueryClient } from '@tanstack/react-query'
import { usePresence } from '@web/hooks/use-presence'
import api, { useQuery } from '@web/lib/api-client'
import { authClient } from '@web/lib/auth-client'
import { useCentrifugo } from '@web/lib/centrifuge'
import { MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { ConversationList } from './conversation-list'
import { ConversationView } from './conversation-view'

export function ChatDrawer() {
  // Subscribe to presence updates
  usePresence()

  const [isOpen, setIsOpen] = useState(false)
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null)
  const queryClient = useQueryClient()
  const { data: session } = authClient.useSession()

  const { data: unreadCount } = useQuery(
    ['chat', 'getUnreadCount'],
    () => api.chat['unread-count'].get(),
    { enabled: !!session?.user?.id }
  )

  const { data: conversations } = useQuery(
    ['chat', 'listConversations'],
    () => api.chat.conversations.get(),
    { enabled: isOpen && !!session?.user?.id }
  )

  const { data: connections } = useQuery(
    ['connection', 'listConnections', { limit: 100, offset: 0 }],
    () =>
      api.connection.list.get({
        query: {
          limit: 100,
          offset: 0
        }
      }),
    { enabled: isOpen }
  )

  // Get Centrifugo connection token
  const { data: centrifugoAuth } = useQuery(
    ['realtime', 'token'],
    () => api.realtime.token.get(),
    {
      enabled: !!session?.user?.id,
      staleTime: 55 * 60 * 1000 // 55 minutes (token expires in 1 hour)
    }
  )

  // Subscribe to user's personal chat channel for new messages and conversation updates
  useCentrifugo<{ type: string; conversationId?: string }>(
    {
      token: centrifugoAuth?.data?.token
    },
    `chat:${session?.user?.id}`,
    (data) => {
      if (data.type === 'new_message' || data.type === 'message') {
        // Invalidate conversations list to refresh
        queryClient.invalidateQueries({
          queryKey: ['chat', 'listConversations']
        })
        // Invalidate unread count
        queryClient.invalidateQueries({ queryKey: ['chat', 'getUnreadCount'] })
      }
    }
  )

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId)
  }

  const handleBack = () => {
    setSelectedConversationId(null)
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            className="relative"
            onClick={() => setIsOpen(true)}
            tooltip="Messages"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Messages</span>
            {unreadCount && unreadCount.count > 0 && (
              <Badge
                className="-top-1 -right-1 absolute flex h-5 w-5 items-center justify-center p-0 text-xs"
                variant="destructive"
              >
                {unreadCount.count > 99 ? '99+' : unreadCount.count}
              </Badge>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <Sheet onOpenChange={setIsOpen} open={isOpen}>
        <SheetContent className="w-full p-0 sm:w-[540px]" side="right">
          <SheetHeader className="p-6 pb-4">
            <SheetTitle>
              {selectedConversationId ? 'Conversation' : 'Messages'}
            </SheetTitle>
          </SheetHeader>

          <div className="flex h-[calc(100vh-80px)] flex-col overflow-hidden">
            {selectedConversationId ? (
              <ConversationView
                conversationId={selectedConversationId}
                onBack={handleBack}
              />
            ) : (
              <ConversationList
                connections={connections?.connections ?? []}
                conversations={conversations?.conversations ?? []}
                onSelect={handleSelectConversation}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

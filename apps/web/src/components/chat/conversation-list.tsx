import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'
import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import { MessageCircle, Users } from 'lucide-react'
import type { FC } from 'react'

type Connection = {
  id: string
  name: string
  avatar?: string
  type: 'user' | 'group'
}

type Conversation = {
  id: string
  participant: {
    id: string
    name: string
    avatar?: string
  }
  lastMessage?: {
    content: string
    timestamp: string
  }
  unreadCount?: number
  updatedAt: string
}

type ConversationListProps = {
  conversations: Conversation[]
  connections: Connection[]
  onSelect: (conversationId: string) => void
}

export const ConversationList: FC<ConversationListProps> = ({
  conversations,
  connections,
  onSelect
}) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60_000)
    const diffHours = Math.floor(diffMs / 3_600_000)
    const diffDays = Math.floor(diffMs / 86_400_000)

    if (diffMins < 1) return 'now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return date.toLocaleDateString()
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
          <p className="text-muted-foreground mb-4">
            Start a conversation with someone from your connections
          </p>
          <div className="space-y-2 w-full max-w-sm">
            {connections.slice(0, 3).map((connection) => (
              <Card key={connection.id} className="p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={connection.avatar} />
                    <AvatarFallback>
                      {connection.type === 'group' ? (
                        <Users className="h-4 w-4" />
                      ) : (
                        connection.name[0]
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {connection.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {connection.type === 'group' ? 'Group' : 'User'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Create new conversation logic would go here
                      console.log('Start conversation with', connection.id)
                    }}
                  >
                    Message
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          {conversations.map((conversation) => (
            <Card
              key={conversation.id}
              className="cursor-pointer transition-colors hover:bg-accent/50 border-0 rounded-none"
              onClick={() => onSelect(conversation.id)}
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conversation.participant.avatar} />
                    <AvatarFallback>
                      {conversation.participant.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm truncate">
                        {conversation.participant.name}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {conversation.updatedAt && formatTime(conversation.updatedAt)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage?.content || 'No messages yet'}
                      </p>
                      {conversation.unreadCount && conversation.unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-2 px-2 py-0 text-xs min-w-[20px] text-center">
                          {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

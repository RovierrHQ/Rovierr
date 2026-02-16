import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'
import { Button } from '@rov/ui/components/button'
import { Input } from '@rov/ui/components/input'
import { ArrowLeft, Send } from 'lucide-react'
import { useState } from 'react'
import type { FC } from 'react'

type Message = {
  id: string
  content: string
  sender: {
    id: string
    name: string
    avatar?: string
  }
  timestamp: string
  isOwn: boolean
}

type ConversationViewProps = {
  conversationId: string
  onBack: () => void
}

export const ConversationView: FC<ConversationViewProps> = ({
  onBack
}) => {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Mock data for demonstration - in real app this would come from API
  const mockMessages: Message[] = [
    {
      id: '1',
      content: 'Hey! How are you doing?',
      sender: {
        id: 'other',
        name: 'John Doe',
        avatar: undefined
      },
      timestamp: new Date(Date.now() - 3_600_000).toISOString(),
      isOwn: false
    },
    {
      id: '2',
      content: 'I\'m doing great! Just working on some projects. How about you?',
      sender: {
        id: 'me',
        name: 'Me',
        avatar: undefined
      },
      timestamp: new Date(Date.now() - 3_000_000).toISOString(),
      isOwn: true
    },
    {
      id: '3',
      content: 'Same here! Let me know if you want to collaborate on anything.',
      sender: {
        id: 'other',
        name: 'John Doe',
        avatar: undefined
      },
      timestamp: new Date(Date.now() - 1_800_000).toISOString(),
      isOwn: false
    }
  ]

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleSendMessage = () => {
    if (!message.trim()) return

    setIsLoading(true)
    try {
      // In real app, this would send the message via API
      console.log('Sending message:', message)
      setMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="md:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <Avatar className="h-8 w-8">
          <AvatarImage src={undefined} />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <p className="font-medium text-sm">John Doe</p>
          <p className="text-xs text-muted-foreground">Active now</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mockMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.isOwn ? 'flex-row-reverse' : ''}`}
          >
            {!msg.isOwn && (
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={msg.sender.avatar} />
                <AvatarFallback>
                  {msg.sender.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            )}
            
            <div className={`max-w-[70%] ${msg.isOwn ? 'text-right' : ''}`}>
              <div
                className={`inline-block rounded-lg px-3 py-2 text-sm ${
                  msg.isOwn
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {msg.content}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatTime(msg.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

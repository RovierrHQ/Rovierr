export interface Discussion {
  id: string
  title: string
  content: string
  author: {
    name: string
    avatar: string | null
    role: string
  }
  isPinned: boolean
  isResolved: boolean
  replies: number
  upvotes: number
  createdAt: string
  tags: string[]
  userVote?: 'up' | 'down' | null
  contextType: 'course' | 'society' | 'event' | 'project'
  contextId: string
}

export interface Reply {
  threadId: string
  id: string
  content: string
  author: {
    name: string
    avatar: string | null
    role: string
  }
  upvotes: number
  createdAt: string
  isAnswer?: boolean
  userVote?: 'up' | 'down' | null
}

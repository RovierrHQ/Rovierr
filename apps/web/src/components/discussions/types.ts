export type Discussion = {
  id: string
  title: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
    role?: string
  }
  createdAt: string
  updatedAt: string
  isPinned: boolean
  isLocked: boolean
  isResolved?: boolean
  replyCount: number
  upvotes: number
  downvotes: number
  userVote?: 'up' | 'down'
  tags: string[]
  contextType?: string
  contextId?: string
  replies?: Reply[]
}

export type Reply = {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
    role?: string
  }
  createdAt: string
  updatedAt: string
  isEdited?: boolean
  upvotes: number
  downvotes: number
  userVote?: 'up' | 'down'
  threadId: string
  parentId?: string
  replies?: Reply[]
}

export type ThreadListItem = {
  id: string
  title: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: string
  updatedAt: string
  isPinned: boolean
  isLocked: boolean
  replyCount: number
  votes: number
  tags: string[]
}

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
}

export interface Reply {
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
}

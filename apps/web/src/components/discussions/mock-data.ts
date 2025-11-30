import type { Discussion, Reply } from './types'

export const mockReplies: Record<string, Reply[]> = {
  '1': [
    {
      id: 'r1-1',
      content:
        'I had the same question! After working through it, I realized you need to identify the overlapping subproblems first. Try drawing out the recursion tree - that helped me see the pattern.',
      author: {
        name: 'Alex Thompson',
        avatar: null,
        role: 'Student'
      },
      upvotes: 8,
      createdAt: '1 hour ago'
    },
    {
      id: 'r1-2',
      content:
        'The key insight is that each subproblem can be defined by a smaller input size. For problem 3 specifically:\n\n1. Define your state (what parameters change)\n2. Write the recurrence relation\n3. Identify base cases\n4. Add memoization\n\nLet me know if you want me to walk through an example!',
      author: {
        name: 'Prof. Anderson',
        avatar: null,
        role: 'Instructor'
      },
      upvotes: 32,
      createdAt: '45 minutes ago',
      isAnswer: true
    },
    {
      id: 'r1-3',
      content:
        'Thanks @Prof. Anderson! That makes much more sense now. I was trying to solve it bottom-up first which was confusing me.',
      author: {
        name: 'Sarah Chen',
        avatar: null,
        role: 'Student'
      },
      upvotes: 3,
      createdAt: '30 minutes ago'
    }
  ],
  '2': [
    {
      id: 'r2-1',
      content:
        'These notes are amazing! Thank you so much for sharing. The examples really help clarify the concepts.',
      author: {
        name: 'David Kim',
        avatar: null,
        role: 'Student'
      },
      upvotes: 12,
      createdAt: '4 hours ago'
    },
    {
      id: 'r2-2',
      content:
        'Could you also share your notes from Lecture 7? I missed that class and would really appreciate it!',
      author: {
        name: 'Jessica Liu',
        avatar: null,
        role: 'Student'
      },
      upvotes: 5,
      createdAt: '3 hours ago'
    }
  ],
  '3': [
    {
      id: 'r3-1',
      content: "I'm interested! What time were you thinking?",
      author: {
        name: 'Michael Wong',
        avatar: null,
        role: 'Student'
      },
      upvotes: 2,
      createdAt: '20 hours ago'
    },
    {
      id: 'r3-2',
      content:
        "Count me in! I'm free Saturday afternoon. Should we create a group chat?",
      author: {
        name: 'Sarah Chen',
        avatar: null,
        role: 'Student'
      },
      upvotes: 4,
      createdAt: '18 hours ago'
    }
  ]
}

export const mockDiscussions: Discussion[] = [
  {
    id: '1',
    title: 'Question about Assignment 2 - Dynamic Programming approach',
    content:
      "I'm having trouble understanding the optimal substructure for problem 3. Can someone explain how to break it down into smaller subproblems?",
    author: {
      name: 'Sarah Chen',
      avatar: null,
      role: 'Student'
    },
    isPinned: true,
    isResolved: false,
    replies: 12,
    upvotes: 24,
    createdAt: '2 hours ago',
    tags: ['assignment', 'help-needed']
  },
  {
    id: '2',
    title: 'Lecture 8 Notes - Greedy Algorithms',
    content:
      "I took detailed notes from today's lecture on greedy algorithms. Sharing them here for anyone who missed class or wants a reference.",
    author: {
      name: 'Michael Wong',
      avatar: null,
      role: 'Student'
    },
    isPinned: true,
    isResolved: false,
    replies: 8,
    upvotes: 45,
    createdAt: '5 hours ago',
    tags: ['notes', 'lecture-8']
  },
  {
    id: '3',
    title: 'Study group for midterm - Anyone interested?',
    content:
      "Looking to form a study group for the upcoming midterm. Planning to meet this weekend at the library. DM me if you're interested!",
    author: {
      name: 'Emily Rodriguez',
      avatar: null,
      role: 'Student'
    },
    isPinned: false,
    isResolved: false,
    replies: 15,
    upvotes: 18,
    createdAt: '1 day ago',
    tags: ['study-group', 'midterm']
  },
  {
    id: '4',
    title: 'Clarification on graph traversal complexity',
    content:
      "In the lecture, we discussed BFS and DFS having O(V+E) complexity. Can someone explain why it's not O(V*E)?",
    author: {
      name: 'David Kim',
      avatar: null,
      role: 'Student'
    },
    isPinned: false,
    isResolved: true,
    replies: 6,
    upvotes: 32,
    createdAt: '2 days ago',
    tags: ['algorithms', 'complexity']
  },
  {
    id: '5',
    title: 'Recommended resources for graph algorithms?',
    content:
      "I'm finding the graph algorithms section challenging. Does anyone have good YouTube channels or websites that explain these concepts well?",
    author: {
      name: 'Jessica Liu',
      avatar: null,
      role: 'Student'
    },
    isPinned: false,
    isResolved: false,
    replies: 9,
    upvotes: 14,
    createdAt: '3 days ago',
    tags: ['resources', 'graphs']
  },
  {
    id: '6',
    title: 'Office hours schedule change',
    content:
      'Due to a conference, office hours this Thursday will be moved to Friday 2-4 PM. Please plan accordingly.',
    author: {
      name: 'Prof. Anderson',
      avatar: null,
      role: 'Instructor'
    },
    isPinned: true,
    isResolved: false,
    replies: 2,
    upvotes: 8,
    createdAt: '4 days ago',
    tags: ['announcement', 'office-hours']
  }
]

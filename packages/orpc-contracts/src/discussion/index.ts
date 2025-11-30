import { oc } from '@orpc/contract'
import { z } from 'zod'
import {
  createReplySchema,
  createThreadSchema,
  endorseReplySchema,
  followThreadSchema,
  fullThreadSchema,
  listFollowedThreadsSchema,
  listThreadsSchema,
  lockThreadSchema,
  pinThreadSchema,
  replySchema,
  threadListItemSchema,
  unfollowThreadSchema,
  unvoteSchema,
  updateReplySchema,
  updateThreadSchema,
  voteCountSchema,
  voteSchema
} from './schemas'

export const discussion = {
  // ============================================================================
  // Thread Routes
  // ============================================================================

  thread: {
    create: oc
      .route({
        method: 'POST',
        description: 'Create a new discussion thread',
        summary: 'Create Thread',
        tags: ['Discussion']
      })
      .input(createThreadSchema)
      .output(fullThreadSchema)
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        FORBIDDEN: {
          data: z.object({
            message: z
              .string()
              .default(
                'User does not have permission to create threads in this context'
              )
          })
        },
        VALIDATION_ERROR: {
          data: z.object({
            message: z.string(),
            errors: z.record(z.string(), z.string())
          })
        }
      }),

    list: oc
      .route({
        method: 'GET',
        description: 'List discussion threads with filters',
        summary: 'List Threads',
        tags: ['Discussion']
      })
      .input(listThreadsSchema)
      .output(
        z.object({
          threads: z.array(threadListItemSchema),
          total: z.number(),
          hasMore: z.boolean()
        })
      )
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        FORBIDDEN: {
          data: z.object({
            message: z
              .string()
              .default(
                'User does not have permission to view threads in this context'
              )
          })
        }
      }),

    get: oc
      .route({
        method: 'GET',
        description: 'Get a single thread with replies',
        summary: 'Get Thread',
        tags: ['Discussion']
      })
      .input(z.object({ id: z.string() }))
      .output(fullThreadSchema)
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Thread not found')
          })
        },
        FORBIDDEN: {
          data: z.object({
            message: z
              .string()
              .default('User does not have permission to view this thread')
          })
        }
      }),

    update: oc
      .route({
        method: 'PATCH',
        description: 'Update a thread',
        summary: 'Update Thread',
        tags: ['Discussion']
      })
      .input(updateThreadSchema)
      .output(fullThreadSchema)
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Thread not found')
          })
        },
        FORBIDDEN: {
          data: z.object({
            message: z
              .string()
              .default('User does not have permission to update this thread')
          })
        }
      }),

    delete: oc
      .route({
        method: 'DELETE',
        description: 'Delete a thread',
        summary: 'Delete Thread',
        tags: ['Discussion']
      })
      .input(z.object({ id: z.string() }))
      .output(z.object({ success: z.boolean() }))
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Thread not found')
          })
        },
        FORBIDDEN: {
          data: z.object({
            message: z
              .string()
              .default('User does not have permission to delete this thread')
          })
        }
      }),

    pin: oc
      .route({
        method: 'PATCH',
        description: 'Pin or unpin a thread',
        summary: 'Pin Thread',
        tags: ['Discussion']
      })
      .input(pinThreadSchema)
      .output(fullThreadSchema)
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Thread not found')
          })
        },
        FORBIDDEN: {
          data: z.object({
            message: z
              .string()
              .default('User does not have moderator permission to pin threads')
          })
        }
      }),

    lock: oc
      .route({
        method: 'PATCH',
        description: 'Lock or unlock a thread',
        summary: 'Lock Thread',
        tags: ['Discussion']
      })
      .input(lockThreadSchema)
      .output(fullThreadSchema)
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Thread not found')
          })
        },
        FORBIDDEN: {
          data: z.object({
            message: z
              .string()
              .default(
                'User does not have moderator permission to lock threads'
              )
          })
        }
      })
  },

  // ============================================================================
  // Reply Routes
  // ============================================================================

  reply: {
    create: oc
      .route({
        method: 'POST',
        description: 'Create a reply to a thread or another reply',
        summary: 'Create Reply',
        tags: ['Discussion']
      })
      .input(createReplySchema)
      .output(replySchema)
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Thread or parent reply not found')
          })
        },
        FORBIDDEN: {
          data: z.object({
            message: z
              .string()
              .default(
                'Thread is locked or user does not have permission to reply'
              )
          })
        },
        VALIDATION_ERROR: {
          data: z.object({
            message: z.string(),
            errors: z.record(z.string(), z.string())
          })
        }
      }),

    update: oc
      .route({
        method: 'PATCH',
        description: 'Update a reply',
        summary: 'Update Reply',
        tags: ['Discussion']
      })
      .input(updateReplySchema)
      .output(replySchema)
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Reply not found')
          })
        },
        FORBIDDEN: {
          data: z.object({
            message: z
              .string()
              .default('User does not have permission to update this reply')
          })
        }
      }),

    delete: oc
      .route({
        method: 'DELETE',
        description: 'Delete a reply',
        summary: 'Delete Reply',
        tags: ['Discussion']
      })
      .input(z.object({ id: z.string() }))
      .output(z.object({ success: z.boolean() }))
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Reply not found')
          })
        },
        FORBIDDEN: {
          data: z.object({
            message: z
              .string()
              .default('User does not have permission to delete this reply')
          })
        }
      }),

    endorse: oc
      .route({
        method: 'PATCH',
        description: 'Endorse or unendorse a reply',
        summary: 'Endorse Reply',
        tags: ['Discussion']
      })
      .input(endorseReplySchema)
      .output(replySchema)
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Reply not found')
          })
        },
        FORBIDDEN: {
          data: z.object({
            message: z
              .string()
              .default(
                'User does not have moderator permission to endorse replies'
              )
          })
        }
      })
  },

  // ============================================================================
  // Vote Routes
  // ============================================================================

  vote: {
    vote: oc
      .route({
        method: 'POST',
        description: 'Vote on a thread or reply',
        summary: 'Vote',
        tags: ['Discussion']
      })
      .input(voteSchema)
      .output(voteCountSchema)
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Thread or reply not found')
          })
        },
        CONFLICT: {
          data: z.object({
            message: z.string().default('User has already voted')
          })
        }
      }),

    unvote: oc
      .route({
        method: 'DELETE',
        description: 'Remove a vote from a thread or reply',
        summary: 'Unvote',
        tags: ['Discussion']
      })
      .input(unvoteSchema)
      .output(voteCountSchema)
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Thread, reply, or vote not found')
          })
        }
      })
  },

  // ============================================================================
  // Follow Routes
  // ============================================================================

  follow: {
    follow: oc
      .route({
        method: 'POST',
        description: 'Follow a thread to receive notifications',
        summary: 'Follow Thread',
        tags: ['Discussion']
      })
      .input(followThreadSchema)
      .output(z.object({ success: z.boolean(), isFollowing: z.boolean() }))
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Thread not found')
          })
        }
      }),

    unfollow: oc
      .route({
        method: 'DELETE',
        description: 'Unfollow a thread',
        summary: 'Unfollow Thread',
        tags: ['Discussion']
      })
      .input(unfollowThreadSchema)
      .output(z.object({ success: z.boolean(), isFollowing: z.boolean() }))
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        },
        NOT_FOUND: {
          data: z.object({
            message: z.string().default('Thread not found')
          })
        }
      }),

    list: oc
      .route({
        method: 'GET',
        description: 'List threads the user is following',
        summary: 'List Followed Threads',
        tags: ['Discussion']
      })
      .input(listFollowedThreadsSchema)
      .output(
        z.object({
          threads: z.array(threadListItemSchema),
          total: z.number(),
          hasMore: z.boolean()
        })
      )
      .errors({
        UNAUTHORIZED: {
          data: z.object({
            message: z.string().default('User not authenticated')
          })
        }
      })
  }
}

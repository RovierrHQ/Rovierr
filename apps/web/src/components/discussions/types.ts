import type { Treaty } from '@elysiajs/eden'
import type api from '@web/lib/api-client'

// Infer from treaty list response: GET /discussion/thread/list
type ThreadListResponse = Awaited<
  ReturnType<typeof api.discussion.thread.list.get>
>
type ThreadListData = Treaty.Data<ThreadListResponse>

export type ThreadListItem = ThreadListData['threads'][number]

// Infer from treaty get-by-id response: GET /discussion/thread/:id
type ThreadRoute = ReturnType<typeof api.discussion.thread>
type GetThreadResponse = Awaited<ReturnType<ThreadRoute['get']>>
type GetThreadData = Treaty.Data<GetThreadResponse>

export type Discussion = GetThreadData
export type Reply = NonNullable<Discussion['replies']>[number]

/** Thread from list (no replies) or full thread (with replies). Use for ThreadView when source may be list or get-by-id. */
export type ThreadViewDiscussion = ThreadListItem | Discussion

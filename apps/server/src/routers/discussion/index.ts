import { follows } from './follows'
import { replies } from './replies'
import { threads } from './threads'
import { votes } from './votes'

export const discussion = {
  thread: threads,
  reply: replies,
  vote: votes,
  follow: follows
}

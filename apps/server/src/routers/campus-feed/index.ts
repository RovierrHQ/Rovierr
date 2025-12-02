import { events } from './events'
import { interactions } from './interactions'
import { posts } from './posts'

export const campusFeed = {
  ...posts,
  ...interactions,
  ...events
}

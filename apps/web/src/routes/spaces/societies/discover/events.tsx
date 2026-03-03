import { createFileRoute } from '@tanstack/react-router'
import ClubEvents from '@web/components/clubs/societies/club-events'

export const Route = createFileRoute('/spaces/societies/discover/events')({
  component: EventsPage
})

function EventsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <ClubEvents />
    </div>
  )
}

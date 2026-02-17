import { createFileRoute } from '@tanstack/react-router'
import BrowseClubs from '@web/components/clubs/societies/browse-clubs'

export const Route = createFileRoute('/spaces/societies/discover/browse-clubs')(
  {
    component: BrowseClubsPage
  }
)

function BrowseClubsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <BrowseClubs />
    </div>
  )
}

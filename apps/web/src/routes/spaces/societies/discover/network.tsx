import { createFileRoute } from '@tanstack/react-router'
import Network from '@web/components/clubs/discover/network'

export const Route = createFileRoute('/spaces/societies/discover/network')({
  component: NetworkPage
})

function NetworkPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <Network />
    </div>
  )
}

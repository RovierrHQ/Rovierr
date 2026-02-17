import { createFileRoute } from '@tanstack/react-router'

function RouteComponent() {
  return <div>Hello Network!</div>
}

export const Route = createFileRoute('/spaces/societies/discover/network')({
  component: RouteComponent
})

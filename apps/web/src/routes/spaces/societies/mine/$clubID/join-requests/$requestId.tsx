import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/spaces/societies/mine/$clubID/join-requests/$requestId'
)({
  component: () => null
})

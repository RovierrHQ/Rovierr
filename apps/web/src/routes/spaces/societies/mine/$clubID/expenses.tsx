import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/spaces/societies/mine/$clubID/expenses')(
  {
    component: () => null
  }
)

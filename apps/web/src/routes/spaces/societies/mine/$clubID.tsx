import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/spaces/societies/mine/$clubID')({
  component: () => <Outlet />
})

import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/spaces/societies')({
  component: () => <Outlet />
})

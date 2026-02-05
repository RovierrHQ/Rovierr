import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/spaces/career')({
  component: () => <Outlet />
})

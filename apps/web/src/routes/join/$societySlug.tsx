import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/join/$societySlug')({
  component: () => <Outlet />
})

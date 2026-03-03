import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/spaces/academics/courses/$courseId')({
  component: () => <Outlet />
})

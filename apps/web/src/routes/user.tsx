import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/user')({
  beforeLoad: () => {
    // Redirect /user to /profile (user's own profile)
    throw redirect({
      to: '/profile'
    })
  },
  component: () => null
})

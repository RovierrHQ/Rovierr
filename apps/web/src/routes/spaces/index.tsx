import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/spaces/')({
  beforeLoad: () => {
    console.log('redirecting to /spaces/societies/campus-feed')
    throw redirect({ to: '/spaces/societies/campus-feed' })
  }
})

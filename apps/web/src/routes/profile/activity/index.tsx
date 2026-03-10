import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/profile/activity/')({
  component: ProfileActivityPage,
  beforeLoad: () => {
    // Redirect to main profile page with activity tab
    throw redirect({
      to: '/profile',
      search: { tab: 'activity' }
    })
  }
})

function ProfileActivityPage() {
  return null
}

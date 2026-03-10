import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/profile/details/')({
  component: ProfileDetailsPage,
  beforeLoad: () => {
    // Redirect to main profile page with details tab
    throw redirect({
      to: '/profile',
      search: { tab: 'about' }
    })
  }
})

function ProfileDetailsPage() {
  return null
}

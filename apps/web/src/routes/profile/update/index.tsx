import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/profile/update/')({
  component: ProfileUpdatePage,
  beforeLoad: () => {
    // Redirect to main profile page with settings tab
    throw redirect({
      to: '/profile',
      search: { tab: 'settings' }
    })
  }
})

function ProfileUpdatePage() {
  return null
}

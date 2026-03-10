import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/profile/academic/')({
  component: ProfileAcademicPage,
  beforeLoad: () => {
    // Redirect to main profile page with academics tab
    throw redirect({
      to: '/profile',
      search: { tab: 'academics' }
    })
  }
})

function ProfileAcademicPage() {
  return null
}

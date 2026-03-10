import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import SpacesLayout from '@web/components/layout/spaces-layout'
import ProfileSidebarSetup from '@web/components/profile/profile-sidebar-setup'
import RoadmapFloatButton from '@web/components/roadmap/roadmap-float-button'
import { authClient } from '@web/lib/auth-client'

export const Route = createFileRoute('/profile')({
  beforeLoad: async () => {
    const session = await authClient.getSession()
    if (!session.data?.user) {
      throw redirect({
        to: '/login',
        search: { callbackUrl: '/profile' }
      })
    }
  },
  component: ProfileLayout
})

function ProfileLayout() {
  return (
    <SpacesLayout showHeader={false}>
      <ProfileSidebarSetup />
      <Outlet />
      <RoadmapFloatButton />
    </SpacesLayout>
  )
}

export default ProfileLayout

import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import ProfilePageComponent from '@web/components/profile'
import { z } from 'zod'

const profileSearchSchema = z.object({
  tab: z
    .enum(['overview', 'about', 'academics', 'activity', 'clubs', 'settings'])
    .optional()
    .catch('overview')
})

export type ProfileSearch = z.infer<typeof profileSearchSchema>

export const Route = createFileRoute('/profile/')({
  component: ProfilePage,
  validateSearch: (search) => profileSearchSchema.parse(search)
})

function ProfilePage() {
  const search = useSearch({ from: '/profile/' })
  const navigate = useNavigate({ from: '/profile' })

  const handleTabChange = (tab: string) => {
    navigate({
      search: (prev) => ({ ...prev, tab: tab as ProfileSearch['tab'] })
    })
  }

  return (
    <ProfilePageComponent
      activeTab={search.tab ?? 'overview'}
      onTabChange={handleTabChange}
    />
  )
}

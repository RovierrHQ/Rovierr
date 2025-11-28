import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PublicProfileView } from '@/components/profile/public-profile-view'
import { orpc } from '@/utils/orpc'

interface PageProps {
  params: Promise<{
    username: string
  }>
}

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const { username } = await params

  try {
    const profile = await orpc.user.profile.public.call({ username })

    return {
      title: `${profile.name} (@${profile.username}) - Rovierr`,
      description: profile.bio || `View ${profile.name}'s profile on Rovierr`,
      openGraph: {
        title: `${profile.name} (@${profile.username})`,
        description: profile.bio || `View ${profile.name}'s profile on Rovierr`,
        images: profile.image ? [profile.image] : [],
        type: 'profile'
      },
      twitter: {
        card: 'summary',
        title: `${profile.name} (@${profile.username})`,
        description: profile.bio || `View ${profile.name}'s profile on Rovierr`,
        images: profile.image ? [profile.image] : []
      }
    }
  } catch {
    return {
      title: 'User Not Found - Rovierr',
      description: 'This user profile could not be found'
    }
  }
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params
  try {
    const profile = await orpc.user.profile.public.call({ username })

    return <PublicProfileView profile={profile} />
  } catch {
    notFound()
  }
}

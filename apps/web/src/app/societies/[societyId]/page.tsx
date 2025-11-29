'use client'

import type { societySchema } from '@rov/orpc-contracts'
import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import { useQuery } from '@tanstack/react-query'
import {
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Loader2,
  MessageCircle,
  Send,
  Twitter,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import type { z } from 'zod'
import { orpc } from '@/utils/orpc'

type Society = z.infer<typeof societySchema>

const SocietyProfilePage = () => {
  const params = useParams()
  const societyId = params.societyId as string

  const { data: society, isLoading } = useQuery({
    queryKey: ['society', societyId],
    queryFn: async () => {
      return await orpc.society.getById.call({ id: societyId })
    }
  })

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!society) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 font-semibold text-2xl">Society Not Found</h1>
          <p className="text-muted-foreground">
            The society you're looking for doesn't exist.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Profile Header */}
      <ProfileHeader society={society} />

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            <AboutSection society={society} />
            {society.goals && <GoalsSection goals={society.goals} />}
            {society.meetingSchedule && (
              <MeetingInfoSection schedule={society.meetingSchedule} />
            )}
            {society.membershipRequirements && (
              <MembershipSection
                requirements={society.membershipRequirements}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <SocialLinksSection society={society} />
            <StatsCard society={society} />
          </div>
        </div>
      </div>
    </div>
  )
}

// Profile Header Component
const ProfileHeader = ({ society }: { society: Society }) => {
  // Default gradient for missing banner
  const defaultGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'

  return (
    <div className="relative">
      {/* Banner */}
      <div
        className="h-48 w-full sm:h-64"
        style={{
          background: society.banner
            ? `url(${society.banner}) center/cover`
            : defaultGradient
        }}
      />

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-16 sm:-mt-20 relative">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            {/* Logo */}
            <div className="flex items-end gap-4">
              {society.logo ? (
                <img
                  alt={`${society.name} logo`}
                  className="h-24 w-24 rounded-lg border-4 border-background bg-background object-cover sm:h-32 sm:w-32"
                  src={society.logo}
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-lg border-4 border-background bg-primary font-bold text-2xl text-primary-foreground sm:h-32 sm:w-32">
                  {society.name
                    .split(' ')
                    .map((word: string) => word[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
              )}

              <div className="pb-2">
                <h1 className="font-bold text-2xl sm:text-3xl">
                  {society.name}
                </h1>
                <div className="mt-1 flex items-center gap-2">
                  <Badge
                    variant={
                      society.type === 'university' ? 'default' : 'secondary'
                    }
                  >
                    {society.type === 'university'
                      ? 'Official Organization'
                      : 'Student Society'}
                  </Badge>
                  {society.isVerified && (
                    <Badge variant="outline">Verified</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Join Button */}
            <div className="pb-2">
              <Button size="lg">
                <Users className="mr-2 h-4 w-4" />
                Join Society
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// About Section
const AboutSection = ({ society }: { society: Society }) => {
  return (
    <Card className="p-6">
      <h2 className="mb-4 font-semibold text-xl">About</h2>
      <p className="text-muted-foreground">{society.description}</p>

      {/* Tags */}
      {society.tags && society.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {society.tags.map((tag: string) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* University Affiliation */}
      {society.institutionId && (
        <div className="mt-4 text-sm">
          <span className="text-muted-foreground">Affiliated with: </span>
          <Link
            className="font-medium hover:underline"
            href={`/universities/${society.institutionId}`}
          >
            University
          </Link>
        </div>
      )}
    </Card>
  )
}

// Social Links Section
const SocialLinksSection = ({ society }: { society: Society }) => {
  const getInstagramUrl = (instagram: string | null) => {
    if (!instagram) return null
    if (instagram.startsWith('@')) {
      return `https://instagram.com/${instagram.slice(1)}`
    }
    return instagram
  }

  const getTwitterUrl = (twitter: string | null) => {
    if (!twitter) return null
    if (twitter.startsWith('@')) {
      return `https://twitter.com/${twitter.slice(1)}`
    }
    return twitter
  }

  const socialLinks = [
    {
      name: 'Instagram',
      icon: Instagram,
      url: getInstagramUrl(society.instagram)
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: society.facebook
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: getTwitterUrl(society.twitter)
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: society.linkedin
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: society.whatsapp
    },
    {
      name: 'Telegram',
      icon: Send,
      url: society.telegram
    },
    {
      name: 'Website',
      icon: Globe,
      url: society.website
    }
  ].filter((link) => link.url)

  if (socialLinks.length === 0) {
    return null
  }

  return (
    <Card className="p-6">
      <h2 className="mb-4 font-semibold text-xl">Connect With Us</h2>
      <div className="space-y-2">
        {socialLinks.map((link) => (
          <a
            className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
            href={link.url || '#'}
            key={link.name}
            rel="noopener noreferrer"
            target="_blank"
          >
            <link.icon className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium text-sm">{link.name}</span>
          </a>
        ))}
      </div>
    </Card>
  )
}

// Goals Section
const GoalsSection = ({ goals }: { goals: string }) => {
  return (
    <Card className="p-6">
      <h2 className="mb-4 font-semibold text-xl">Our Goals</h2>
      <p className="text-muted-foreground">{goals}</p>
    </Card>
  )
}

// Meeting Info Section
const MeetingInfoSection = ({ schedule }: { schedule: string }) => {
  return (
    <Card className="p-6">
      <h2 className="mb-4 font-semibold text-xl">Meeting Schedule</h2>
      <p className="text-muted-foreground">{schedule}</p>
    </Card>
  )
}

// Membership Section
const MembershipSection = ({ requirements }: { requirements: string }) => {
  return (
    <Card className="p-6">
      <h2 className="mb-4 font-semibold text-xl">Membership Requirements</h2>
      <p className="text-muted-foreground">{requirements}</p>
    </Card>
  )
}

// Stats Card
const StatsCard = ({ society }: { society: Society }) => {
  return (
    <Card className="p-6">
      <h2 className="mb-4 font-semibold text-xl">Stats</h2>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">Members</span>
          <span className="font-semibold">{society.memberCount || 0}</span>
        </div>
        {society.foundingYear && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Founded</span>
            <span className="font-semibold">{society.foundingYear}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">
            Profile Completion
          </span>
          <span className="font-semibold">
            {society.profileCompletionPercentage || 0}%
          </span>
        </div>
      </div>
    </Card>
  )
}

export default SocietyProfilePage

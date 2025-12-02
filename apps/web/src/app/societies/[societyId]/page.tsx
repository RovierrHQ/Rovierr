'use client'

import type { societySchema } from '@rov/orpc-contracts'
import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'
import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import { Card, CardContent } from '@rov/ui/components/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@rov/ui/components/tooltip'
import { useQuery } from '@tanstack/react-query'
import {
  CheckCircle2,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Loader2,
  MapPin,
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

  const { data: society, isLoading } = useQuery(
    orpc.society.getById.queryOptions({ input: { id: societyId } })
  )

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!society) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
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
    <div className="mx-auto min-h-screen max-w-5xl">
      <div className="-mx-4 -mt-6 relative overflow-x-hidden">
        {/* Banner */}
        <div className="relative h-64 w-full overflow-hidden">
          {society.banner ? (
            <img
              alt="Society Banner"
              className="h-full w-full object-cover"
              src={society.banner}
            />
          ) : (
            <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600" />
          )}
          <div className="absolute right-0 bottom-0 left-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>

        {/* Content */}
        <div className="-mt-20 relative px-4 sm:px-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
              {/* Avatar */}
              <div className="group relative flex-shrink-0">
                <div className="absolute inset-0 animate-pulse rounded-full bg-primary opacity-60 blur-md" />
                <Avatar className="relative h-28 w-28 border-4 border-primary shadow-2xl ring-2 ring-background sm:h-40 sm:w-40">
                  <AvatarImage alt={society.name} src={society.logo ?? ''} />
                  <AvatarFallback className="bg-primary/10 text-3xl text-primary sm:text-4xl">
                    {society.name
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Info */}
              <div className="flex-1 space-y-3 pt-0 text-center sm:space-y-4 sm:pt-6 sm:text-left">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <h1 className="text-balance font-bold text-2xl text-foreground tracking-tight sm:text-3xl">
                      {society.name}
                    </h1>

                    {society.isVerified ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-emerald-500 transition-colors hover:bg-emerald-500/15">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span className="font-medium text-xs">
                                Verified
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs" side="bottom">
                            <p className="text-sm">
                              This organization has been verified and is an
                              official society.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : null}

                    <Badge
                      variant={
                        society.type === 'university' ? 'default' : 'secondary'
                      }
                    >
                      {society.type === 'university'
                        ? 'Official Organization'
                        : 'Student Society'}
                    </Badge>
                  </div>

                  {society.description && (
                    <p className="mx-auto line-clamp-2 max-w-lg text-pretty text-muted-foreground text-sm leading-relaxed sm:mx-0">
                      {society.description}
                    </p>
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  {society.tags &&
                    society.tags.length > 0 &&
                    society.tags.slice(0, 3).map((tag) => (
                      <Badge
                        className="border border-border/50 bg-secondary/50 text-foreground"
                        key={tag}
                        variant="secondary"
                      >
                        {tag}
                      </Badge>
                    ))}
                  {society.memberCount !== undefined && (
                    <Badge
                      className="border border-border/50 bg-secondary/50 text-foreground"
                      variant="secondary"
                    >
                      {society.memberCount}{' '}
                      {society.memberCount === 1 ? 'Member' : 'Members'}
                    </Badge>
                  )}
                  {society.foundingYear && (
                    <Badge
                      className="border border-border/50 bg-secondary/50 text-foreground"
                      variant="secondary"
                    >
                      Founded {society.foundingYear}
                    </Badge>
                  )}
                </div>

                {/* Location & Website */}
                <div className="flex flex-col gap-2 text-muted-foreground text-xs sm:flex-row sm:flex-wrap sm:gap-4 sm:text-sm">
                  {society.institutionId && (
                    <div className="flex items-center justify-center gap-1 md:justify-start">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <Link
                        className="transition-colors hover:text-primary"
                        href={`/universities/${society.institutionId}`}
                      >
                        University Affiliation
                      </Link>
                    </div>
                  )}

                  {society.website && (
                    <Link
                      className="flex items-center justify-center gap-1 transition-colors hover:text-primary md:justify-start"
                      href={society.website}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <Globe className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">Website</span>
                    </Link>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <Button size="sm">
                    <Users className="mr-2 h-4 w-4" />
                    Join Society
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Contact
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="mt-8 px-4 sm:px-6">
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

// About Section
const AboutSection = ({ society }: { society: Society }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="mb-4 font-semibold text-xl">About</h2>
        <p className="whitespace-pre-wrap text-muted-foreground">
          {society.description}
        </p>

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
      </CardContent>
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
    if (instagram.startsWith('http')) {
      return instagram
    }
    return `https://instagram.com/${instagram}`
  }

  const getTwitterUrl = (twitter: string | null) => {
    if (!twitter) return null
    if (twitter.startsWith('@')) {
      return `https://twitter.com/${twitter.slice(1)}`
    }
    if (twitter.startsWith('http')) {
      return twitter
    }
    return `https://twitter.com/${twitter}`
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
    <Card>
      <CardContent className="p-6">
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
      </CardContent>
    </Card>
  )
}

// Goals Section
const GoalsSection = ({ goals }: { goals: string }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="mb-4 font-semibold text-xl">Our Goals</h2>
        <p className="whitespace-pre-wrap text-muted-foreground">{goals}</p>
      </CardContent>
    </Card>
  )
}

// Meeting Info Section
const MeetingInfoSection = ({ schedule }: { schedule: string }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="mb-4 font-semibold text-xl">Meeting Schedule</h2>
        <p className="whitespace-pre-wrap text-muted-foreground">{schedule}</p>
      </CardContent>
    </Card>
  )
}

// Membership Section
const MembershipSection = ({ requirements }: { requirements: string }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="mb-4 font-semibold text-xl">Membership Requirements</h2>
        <p className="whitespace-pre-wrap text-muted-foreground">
          {requirements}
        </p>
      </CardContent>
    </Card>
  )
}

// Stats Card
const StatsCard = ({ society }: { society: Society }) => {
  return (
    <Card>
      <CardContent className="p-6">
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
      </CardContent>
    </Card>
  )
}

export default SocietyProfilePage

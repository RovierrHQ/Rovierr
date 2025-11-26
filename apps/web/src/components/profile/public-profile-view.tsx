'use client'

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
import {
  AlertCircle,
  CheckCircle2,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'

interface PublicProfileProps {
  profile: {
    id: string
    name: string
    username: string
    image: string | null
    bannerImage: string | null
    bio: string | null
    website: string | null
    socialLinks: {
      whatsapp: string | null
      telegram: string | null
      instagram: string | null
      facebook: string | null
      twitter: string | null
      linkedin: string | null
    }
    currentUniversity: {
      id: string
      name: string
      logo: string | null
      city: string
      country: string
    } | null
    studentStatusVerified: boolean
    createdAt: Date
    major: string | null
    yearOfStudy: string | null
  }
}

export function PublicProfileView({ profile }: PublicProfileProps) {
  const initials = profile.name
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  const facultyBadge = profile.major || 'Student'
  const yearBadge = profile.yearOfStudy ? `Year ${profile.yearOfStudy}` : null

  return (
    <div className="mx-auto min-h-screen max-w-5xl">
      <div className="-mx-4 -mt-6 relative overflow-x-hidden">
        {/* Banner */}
        <div className="relative h-64 w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-purple-600/80 to-cyan-600/90">
            {profile.bannerImage ? (
              <img
                alt="Profile Banner"
                className="h-full w-full object-cover opacity-40 mix-blend-overlay"
                src={profile.bannerImage}
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600" />
            )}
          </div>
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
                  <AvatarImage alt={profile.name} src={profile.image ?? ''} />
                  <AvatarFallback className="bg-primary/10 text-3xl text-primary sm:text-4xl">
                    {initials || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Info */}
              <div className="flex-1 space-y-3 pt-0 text-center sm:space-y-4 sm:pt-6 sm:text-left">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <h1 className="text-balance font-bold text-2xl text-foreground tracking-tight sm:text-3xl">
                      {profile.name}
                    </h1>

                    {profile.studentStatusVerified ? (
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
                              This student's identity and enrollment have been
                              confirmed by{' '}
                              {profile.currentUniversity?.name ||
                                'their university'}
                              .
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-amber-500 transition-colors hover:bg-amber-500/15">
                              <AlertCircle className="h-3.5 w-3.5" />
                              <span className="font-medium text-xs">
                                Unverified
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs" side="bottom">
                            <p className="text-sm">
                              This user has not verified their university email.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>

                  {profile.bio && (
                    <p className="mx-auto max-w-lg text-pretty text-muted-foreground text-sm leading-relaxed sm:mx-0">
                      {profile.bio}
                    </p>
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  {profile.currentUniversity && (
                    <Badge className="border border-primary/40 bg-primary/20 text-primary shadow-sm hover:bg-primary/30">
                      {profile.currentUniversity.name}
                    </Badge>
                  )}

                  {facultyBadge && (
                    <Badge
                      className="border border-border/50 bg-secondary/50 text-foreground"
                      variant="secondary"
                    >
                      {facultyBadge}
                    </Badge>
                  )}

                  {yearBadge && (
                    <Badge
                      className="border border-border/50 bg-secondary/50 text-foreground"
                      variant="secondary"
                    >
                      {yearBadge}
                    </Badge>
                  )}
                </div>

                {/* Location & Website */}
                <div className="flex flex-col gap-2 text-muted-foreground text-xs sm:flex-row sm:flex-wrap sm:gap-4 sm:text-sm">
                  {profile.currentUniversity && (
                    <div className="flex items-center justify-center gap-1 md:justify-start">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      {profile.currentUniversity.city},{' '}
                      {profile.currentUniversity.country}
                    </div>
                  )}

                  {profile.website && (
                    <Link
                      className="flex items-center justify-center gap-1 transition-colors hover:text-primary md:justify-start"
                      href={profile.website}
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
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                  <Button size="sm" variant="outline">
                    <Mail className="mr-2 h-4 w-4" />
                    Connect
                  </Button>
                </div>
              </div>
            </div>

            {/* XP Card */}
            <div className="flex flex-col items-center gap-4">
              <Card className="w-full max-w-sm border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-muted-foreground text-sm">
                          Contribution Level
                        </p>
                        <p className="font-bold text-xl">Campus Champion</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-2xl text-primary">2,450</p>
                      <p className="text-muted-foreground text-xs">XP Points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs - Placeholder */}
      <div className="mt-8 px-4 sm:px-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <p className="font-medium text-lg">More content coming soon</p>
              <p className="text-sm">
                Activity feed, posts, and achievements will appear here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

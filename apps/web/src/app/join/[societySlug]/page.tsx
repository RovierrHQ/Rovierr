'use client'

import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import { useQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Loader2,
  Twitter,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { orpc } from '@/utils/orpc'

const PublicJoinPage = () => {
  const params = useParams()
  const societySlug = params.societySlug as string

  // Fetch public registration page data
  const { data, isLoading, error } = useQuery(
    orpc.societyRegistration.public.getPageData.queryOptions({
      input: { societySlug }
    })
  )

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <h1 className="mb-2 font-bold text-2xl">Society Not Found</h1>
          <p className="mb-6 text-muted-foreground">
            The society you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link href="/spaces/societies/discover">Discover Societies</Link>
          </Button>
        </Card>
      </div>
    )
  }

  const { society, settings, form, isAvailable, unavailableReason } = data

  return (
    <div className="min-h-screen bg-background">
      {/* Banner Section */}
      {society.banner && (
        <div
          className="h-48 w-full bg-center bg-cover sm:h-64"
          style={{
            backgroundImage: `url(${society.banner})`,
            backgroundColor: society.primaryColor || undefined
          }}
        />
      )}

      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Society Header */}
        <div className="mb-8 flex flex-col items-start gap-6 sm:flex-row">
          {society.logo && (
            <img
              alt={`${society.name} logo`}
              className="h-24 w-24 rounded-lg object-cover shadow-lg"
              src={society.logo}
            />
          )}
          <div className="flex-1">
            <h1 className="mb-2 font-bold text-3xl">{society.name}</h1>
            {society.description && (
              <p className="text-muted-foreground">{society.description}</p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{society.memberCount} members</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Registration Status Card */}
            <Card className="p-6">
              {isAvailable ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <h2 className="font-semibold text-lg">
                      Registration is Open
                    </h2>
                  </div>
                  {settings.welcomeMessage && (
                    <p className="text-muted-foreground">
                      {settings.welcomeMessage}
                    </p>
                  )}
                  {settings.remainingSlots !== null && (
                    <p className="text-muted-foreground text-sm">
                      {settings.remainingSlots} spots remaining
                    </p>
                  )}
                  <Button asChild className="w-full" size="lg">
                    <Link href={`/join/${societySlug}/apply`}>
                      Join {society.name}
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    <h2 className="font-semibold text-lg">
                      Registration Closed
                    </h2>
                  </div>
                  <p className="text-muted-foreground">{unavailableReason}</p>
                </div>
              )}
            </Card>

            {/* Meeting Schedule */}
            {society.meetingSchedule && (
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <h3 className="font-semibold">Meeting Schedule</h3>
                </div>
                <p className="text-muted-foreground">
                  {society.meetingSchedule}
                </p>
              </Card>
            )}

            {/* Membership Requirements */}
            {society.membershipRequirements && (
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <h3 className="font-semibold">Membership Requirements</h3>
                </div>
                <p className="text-muted-foreground">
                  {society.membershipRequirements}
                </p>
              </Card>
            )}

            {/* Goals */}
            {society.goals && (
              <Card className="p-6">
                <h3 className="mb-4 font-semibold">Our Goals</h3>
                <p className="text-muted-foreground">{society.goals}</p>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Period */}
            {(settings.startDate || settings.endDate) && (
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <h3 className="font-semibold text-sm">Registration Period</h3>
                </div>
                <div className="space-y-2 text-muted-foreground text-sm">
                  {settings.startDate && (
                    <div>
                      <span className="font-medium">Opens:</span>{' '}
                      {new Date(settings.startDate).toLocaleDateString()}
                    </div>
                  )}
                  {settings.endDate && (
                    <div>
                      <span className="font-medium">Closes:</span>{' '}
                      {new Date(settings.endDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Payment Info */}
            {form?.paymentEnabled && form.paymentAmount && (
              <Card className="p-6">
                <h3 className="mb-2 font-semibold text-sm">Membership Fee</h3>
                <p className="font-bold text-2xl">${form.paymentAmount}</p>
                <p className="mt-2 text-muted-foreground text-sm">
                  Payment required after application
                </p>
              </Card>
            )}

            {/* Social Links */}
            {(society.instagram ||
              society.facebook ||
              society.twitter ||
              society.linkedin ||
              society.website) && (
              <Card className="p-6">
                <h3 className="mb-4 font-semibold text-sm">Connect With Us</h3>
                <div className="flex flex-wrap gap-2">
                  {society.instagram && (
                    <Button asChild size="icon" variant="outline">
                      <a
                        href={`https://instagram.com/${society.instagram.replace('@', '')}`}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <Instagram className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {society.facebook && (
                    <Button asChild size="icon" variant="outline">
                      <a
                        href={society.facebook}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <Facebook className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {society.twitter && (
                    <Button asChild size="icon" variant="outline">
                      <a
                        href={`https://twitter.com/${society.twitter.replace('@', '')}`}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <Twitter className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {society.linkedin && (
                    <Button asChild size="icon" variant="outline">
                      <a
                        href={society.linkedin}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {society.website && (
                    <Button asChild size="icon" variant="outline">
                      <a
                        href={society.website}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <Globe className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PublicJoinPage

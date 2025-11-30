'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'
import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@rov/ui/components/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@rov/ui/components/tooltip'
import { useQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Copy,
  QrCode as QrCodeIcon,
  Share2,
  Sparkles
} from 'lucide-react'
import { useState } from 'react'
import QRCode from 'react-qr-code'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import { orpc } from '@/utils/orpc'
import { ImageUploadDialog } from './image-upload-dialog'
import { ProfileHeroSkeleton } from './loading-skeleton'

interface ProfileHeroProps {
  isVerified: boolean
}

export function ProfileHero({ isVerified }: ProfileHeroProps) {
  const { data: session } = authClient.useSession()
  const { data: profileDetails, isLoading } = useQuery(
    orpc.user.profile.details.queryOptions()
  )
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProfileImageDialogOpen, setIsProfileImageDialogOpen] =
    useState(false)
  const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false)

  const user = session?.user

  if (isLoading || !(user && profileDetails)) {
    return <ProfileHeroSkeleton />
  }

  // Get initials for avatar fallback
  const initials = user.name
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  // Get username or create one from email
  const username =
    profileDetails.username ||
    user.email?.split('@')[0] ||
    user.name?.toLowerCase().replace(/\s+/g, '')

  // Create proper URL without @ symbol
  const profileUrl = `https://rovierr.com/${username}`
  const displayUrl = `@${username}`

  // Get faculty/major badge
  const facultyBadge = profileDetails.major || 'Student'

  // Get year of study badge
  const yearBadge = profileDetails.yearOfStudy
    ? `Year ${profileDetails.yearOfStudy}`
    : null

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl)
      toast.success('Profile link copied!')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const handleShareProfile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user.name}'s Profile`,
          text: `Check out ${user.name}'s profile on Rovierr`,
          url: profileUrl
        })
      } catch (error) {
        // User cancelled or share failed
        if ((error as Error).name !== 'AbortError') {
          await handleCopyUrl()
        }
      }
    } else {
      await handleCopyUrl()
    }
  }

  return (
    <div className="-mx-4 -mt-6 relative overflow-x-hidden">
      {/* Full-width Hero Banner */}
      <div className="relative h-64 w-full overflow-hidden">
        {/* Banner Image/Gradient */}
        {profileDetails.bannerImage ? (
          <img
            alt="Profile Banner"
            className="h-full w-full rounded-xl object-cover"
            src={profileDetails.bannerImage}
          />
        ) : (
          <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600" />
        )}

        {/* Blur overlay near bottom */}
        <div className="absolute right-0 bottom-0 left-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent" />

        {/* Edit Banner Button */}
        <button
          aria-label="Edit banner image"
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-background/20 text-white shadow-lg backdrop-blur-md transition-colors hover:bg-background/30"
          onClick={() => setIsBannerDialogOpen(true)}
          type="button"
        >
          <Camera className="h-4 w-4" />
        </button>
      </div>

      {/* Content Container */}
      <div className="-mt-20 relative px-4 sm:px-6">
        <div className="flex flex-col gap-6">
          {/* Stack vertically on mobile, horizontal on larger screens */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
            {/* Avatar on the left */}
            <div className="group relative flex-shrink-0">
              <div className="absolute inset-0 animate-pulse rounded-full bg-primary opacity-60 blur-md" />

              {/* Smaller avatar on mobile */}
              <Avatar className="relative h-28 w-28 border-4 border-primary shadow-2xl ring-2 ring-background sm:h-40 sm:w-40">
                <AvatarImage
                  alt={user.name || 'User'}
                  src={profileDetails.image ?? user.image ?? ''}
                />
                <AvatarFallback className="bg-primary/10 text-3xl text-primary sm:text-4xl">
                  {initials || 'U'}
                </AvatarFallback>
              </Avatar>

              <button
                aria-label="Change profile picture"
                className="absolute right-1 bottom-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-xl transition-all hover:scale-105 hover:bg-primary/90 sm:h-11 sm:w-11"
                onClick={() => setIsProfileImageDialogOpen(true)}
                type="button"
              >
                <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            {/* Name, Bio and Badges on the right */}
            {/* Center text on mobile, left-align on larger screens */}
            <div className="flex-1 space-y-3 pt-0 text-center sm:space-y-4 sm:pt-6 sm:text-left">
              {/* Name & Bio */}
              <div className="space-y-2">
                {/* Center items on mobile */}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <h2 className="text-balance font-bold text-2xl text-foreground tracking-tight sm:text-3xl">
                    {user.name}
                  </h2>

                  {isVerified ? (
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
                            {profileDetails.currentUniversity?.name ||
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
                            Verify your university email to unlock full features
                            and build trust.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>

                {profileDetails.bio && (
                  <p className="mx-auto line-clamp-2 max-w-lg text-pretty text-muted-foreground text-sm leading-relaxed sm:mx-0">
                    {profileDetails.bio}
                  </p>
                )}
              </div>

              {/* Badges */}
              {/* Center badges on mobile */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                {profileDetails.currentUniversity && (
                  <Badge className="border border-primary/40 bg-primary/20 text-primary shadow-sm hover:bg-primary/30">
                    {profileDetails.currentUniversity.name}
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

              {/* Center handle on mobile */}
              <div className="flex items-center justify-center gap-2 text-sm sm:justify-start">
                <span className="font-mono text-muted-foreground">
                  {displayUrl}
                </span>

                <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
                  <DialogTrigger asChild>
                    <button
                      aria-label="Share profile"
                      className="group flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 transition-colors hover:bg-primary/20"
                      type="button"
                    >
                      <QrCodeIcon className="h-4 w-4 text-primary transition-transform group-hover:scale-110" />
                    </button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Share Profile</DialogTitle>
                      <DialogDescription>
                        Share your Rovierr profile to connect with other
                        students
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                      {/* QR Code */}
                      <div className="flex flex-col items-center space-y-3">
                        <div className="flex h-56 w-56 items-center justify-center rounded-2xl bg-white p-4 shadow-lg">
                          <QRCode
                            level="M"
                            size={256}
                            style={{
                              height: 'auto',
                              maxWidth: '100%',
                              width: '100%'
                            }}
                            value={profileUrl}
                            viewBox="0 0 256 256"
                          />
                        </div>
                        <p className="text-muted-foreground text-sm">
                          Scan to view profile
                        </p>
                      </div>

                      {/* Profile Link */}
                      <div className="space-y-2">
                        <label
                          className="font-medium text-sm"
                          htmlFor="profile-url"
                        >
                          Profile Link
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            className="flex-1 rounded-lg border border-border/50 bg-secondary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            id="profile-url"
                            readOnly
                            type="text"
                            value={profileUrl}
                          />
                          <Button
                            className="h-10 w-10 bg-transparent"
                            onClick={handleCopyUrl}
                            size="icon"
                            variant="outline"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="space-y-2">
                        <Button
                          className="h-11 w-full justify-start bg-background/50"
                          onClick={handleShareProfile}
                          variant="outline"
                        >
                          <Share2 className="mr-3 h-4 w-4" />
                          Share Profile
                        </Button>

                        <Button
                          className="h-11 w-full justify-start bg-background/50"
                          variant="outline"
                        >
                          <Sparkles className="mr-3 h-4 w-4" />
                          Nearby Connect
                          <Badge
                            className="ml-auto text-xs"
                            variant="secondary"
                          >
                            Coming Soon
                          </Badge>
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Upload Dialogs */}
      <ImageUploadDialog
        currentImageUrl={profileDetails.image ?? null}
        onOpenChange={setIsProfileImageDialogOpen}
        open={isProfileImageDialogOpen}
        type="profile"
      />
      <ImageUploadDialog
        currentImageUrl={profileDetails.bannerImage ?? null}
        onOpenChange={setIsBannerDialogOpen}
        open={isBannerDialogOpen}
        type="banner"
      />
    </div>
  )
}

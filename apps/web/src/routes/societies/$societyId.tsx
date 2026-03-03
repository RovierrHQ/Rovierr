import type { Treaty } from '@elysiajs/eden'
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
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Image } from '@unpic/react'
import api from '@web/lib/api-client'
import {
  CheckCircle2,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  MapPin,
  MessageCircle,
  Send,
  Twitter,
  Users
} from 'lucide-react'

export const Route = createFileRoute('/societies/$societyId')({
  component: SocietyProfilePage
})

type SocietyRoute = ReturnType<typeof api.society>
type Society = Treaty.Data<Awaited<ReturnType<SocietyRoute['get']>>>

function SocietyProfilePage() {
  const { societyId } = Route.useParams()

  // 2. Data Fetching with Suspense
  const { data: society } = useSuspenseQuery({
    queryKey: ['society', societyId],
    queryFn: async () => {
      const response = await api.society({ id: societyId }).get()
      if (!response.data) throw new Error('Society not found')
      return response.data
    }
  })

  return (
    <div className="mx-auto min-h-screen max-w-5xl">
      <div className="-mx-4 -mt-6 relative overflow-x-hidden">
        {/* Banner */}
        <div className="relative h-64 w-full overflow-hidden">
          {society.banner ? (
            <Image
              alt="Society Banner"
              className="h-full w-full object-cover"
              layout="fullWidth"
              src={society.banner}
            />
          ) : (
            <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600" />
          )}
          <div className="absolute right-0 bottom-0 left-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>

        {/* Header Content */}
        <div className="-mt-20 relative px-4 sm:px-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
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

              <div className="flex-1 space-y-3 pt-0 text-center sm:space-y-4 sm:pt-6 sm:text-left">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <h1 className="text-balance font-bold text-2xl text-foreground tracking-tight sm:text-3xl">
                      {society.name}
                    </h1>

                    {society.isVerified && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-emerald-500 transition-colors hover:bg-emerald-500/15">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span className="font-medium text-xs">
                                Verified
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs" side="bottom">
                            <p className="text-sm">
                              Official verified organization.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

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

                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  {society.tags?.slice(0, 3).map((tag) => (
                    <Badge
                      className="border border-border/50 bg-secondary/50"
                      key={tag}
                      variant="secondary"
                    >
                      {tag}
                    </Badge>
                  ))}
                  <Badge
                    className="border border-border/50 bg-secondary/50"
                    variant="secondary"
                  >
                    {society.memberCount ?? 0}{' '}
                    {society.memberCount === 1 ? 'Member' : 'Members'}
                  </Badge>
                </div>

                <div className="flex flex-col gap-2 text-muted-foreground text-xs sm:flex-row sm:flex-wrap sm:gap-4 sm:text-sm">
                  {society.institutionName && (
                    <div className="flex items-center justify-center gap-1 md:justify-start">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      {/* <Link
                        className="transition-colors hover:text-primary"
                        params={{ universityId: society.institutionId! }}
                        to="/universities/$universityId"
                      >
                        {society.institutionName}
                      </Link> */}
                    </div>
                  )}
                </div>

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

      <div className="mt-8 px-4 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-3">
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
          <div className="space-y-6">
            <SocialLinksSection society={society} />
            <StatsCard society={society} />
          </div>
        </div>
      </div>
    </div>
  )
}

const AboutSection = ({ society }: { society: Society }) => (
  <Card>
    <CardContent className="p-6">
      <h2 className="mb-4 font-semibold text-xl">About</h2>
      <p className="whitespace-pre-wrap text-muted-foreground">
        {society.description}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {society.tags?.map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>
    </CardContent>
  </Card>
)

const SocialLinksSection = ({ society }: { society: Society }) => {
  const getUrl = (val: string | null, base: string) => {
    if (!val) return null
    return val.startsWith('http') ? val : `${base}${val.replace('@', '')}`
  }

  const links = [
    {
      name: 'Instagram',
      icon: Instagram,
      url: getUrl(society.instagram, 'https://instagram.com/')
    },
    { name: 'Facebook', icon: Facebook, url: society.facebook },
    {
      name: 'Twitter',
      icon: Twitter,
      url: getUrl(society.twitter, 'https://twitter.com/')
    },
    { name: 'LinkedIn', icon: Linkedin, url: society.linkedin },
    { name: 'WhatsApp', icon: MessageCircle, url: society.whatsapp },
    { name: 'Telegram', icon: Send, url: society.telegram },
    { name: 'Website', icon: Globe, url: society.website }
  ].filter((l) => l.url)

  if (links.length === 0) return null

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="mb-4 font-semibold text-xl">Connect</h2>
        <div className="space-y-2">
          {links.map((link) => (
            <a
              className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent transition-colors"
              href={link.url!}
              key={link.name}
              rel="noreferrer"
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

const GoalsSection = ({ goals }: { goals: string }) => (
  <Card>
    <CardContent className="p-6">
      <h2 className="mb-4 font-semibold text-xl">Our Goals</h2>
      <p className="text-muted-foreground">{goals}</p>
    </CardContent>
  </Card>
)

const MeetingInfoSection = ({ schedule }: { schedule: string }) => (
  <Card>
    <CardContent className="p-6">
      <h2 className="mb-4 font-semibold text-xl">Schedule</h2>
      <p className="text-muted-foreground">{schedule}</p>
    </CardContent>
  </Card>
)

const MembershipSection = ({ requirements }: { requirements: string }) => (
  <Card>
    <CardContent className="p-6">
      <h2 className="mb-4 font-semibold text-xl">Requirements</h2>
      <p className="text-muted-foreground">{requirements}</p>
    </CardContent>
  </Card>
)

const StatsCard = ({ society }: { society: Society }) => (
  <Card>
    <CardContent className="p-6">
      <h2 className="mb-4 font-semibold text-xl">Stats</h2>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Members</span>
          <span className="font-semibold">{society.memberCount || 0}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Profile Completion</span>
          <span className="font-semibold">
            {society.profileCompletionPercentage || 0}%
          </span>
        </div>
      </div>
    </CardContent>
  </Card>
)

export default SocietyProfilePage

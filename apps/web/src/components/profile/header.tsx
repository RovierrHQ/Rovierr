import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'
import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import { Card, CardContent } from '@rov/ui/components/card'
import { useQuery } from '@tanstack/react-query'
import {
  Calendar,
  Camera,
  Mail,
  MapPin,
  Settings,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { orpc } from '@/utils/orpc'

export default function ProfileHeader() {
  const { data } = authClient.useSession()
  const {
    data: profileInfo
    // isLoading: isProfileInfoLoading
  } = useQuery(orpc.user.profileInfo.queryOptions())

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage alt="Profile" src={data?.user.image ?? ''} />
              <AvatarFallback className="text-2xl">
                {data?.user.name
                  .split(' ')
                  .map((w) => w[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <Button
              className="-right-2 -bottom-2 absolute h-8 w-8 rounded-full"
              size="icon"
              variant="outline"
            >
              <Camera />
            </Button>
          </div>
          <div className="my-auto h-full flex-1 space-y-2">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <h1 className="font-bold text-2xl">{data?.user.name}</h1>
              {profileInfo?.studentStatusVerified ? (
                <Badge variant="secondary">
                  <ShieldCheck className="size-4" />
                  Verified
                </Badge>
              ) : (
                <Link href="/profile/verify-student-status">
                  <Badge tone="soft" variant="destructive">
                    <ShieldAlert className="size-4" />
                    Verify Student Status
                  </Badge>
                </Link>
              )}
            </div>
            {profileInfo?.currentUniversity && (
              <p className="text-muted-foreground">
                {profileInfo?.currentUniversity?.name}
              </p>
            )}
            <div className="flex flex-wrap gap-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-1">
                <Mail className="size-4" />
                {data?.user.email}
              </div>
              {profileInfo?.currentUniversity && (
                <>
                  <div className="flex items-center gap-1">
                    <MapPin className="size-4" />
                    {profileInfo?.currentUniversity?.city},{' '}
                    {profileInfo?.currentUniversity?.country}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="size-4" />
                    Joined {data?.user.createdAt?.toLocaleDateString()}
                  </div>
                </>
              )}
            </div>
          </div>
          <Link href="/profile/settings">
            <Button variant="outline">
              <Settings className="size-4" />
              Settings
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

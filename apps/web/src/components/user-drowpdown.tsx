'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@rov/ui/components/dropdown-menu'
import { RainbowButton } from '@rov/ui/components/rainbow-button'
import { Skeleton } from '@rov/ui/components/skeleton'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useHotkeys } from 'react-hotkeys-hook'
import { authClient } from '@/lib/auth-client'

export default function UserDropdown() {
  const { data, isPending } = authClient.useSession()
  const router = useRouter()

  useHotkeys('meta+shift+p', () => router.push('/profile'))

  if (isPending) return <Skeleton className="size-11 rounded-full" />

  if (!data?.user)
    return (
      <Link href="/login">
        <RainbowButton className="rounded-full">Get Started</RainbowButton>
      </Link>
    )
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          <AvatarImage src={data.user.image ?? ''} />
          <AvatarFallback>
            {data.user.name
              .split(' ')
              .map((w) => w[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push('/profile')}>
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => authClient.signOut()}>
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

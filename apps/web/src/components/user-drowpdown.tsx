'use client'

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
import { authClient } from '@/lib/auth-client'

export default function UserDropdown() {
  const { data, isPending } = authClient.useSession()

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
        <RainbowButton className="aspect-square rounded-full p-0">
          {data.user.name
            .split(' ')
            .map((w) => w[0])
            .join('')
            .toUpperCase()}
        </RainbowButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
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

'use client'

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@rov/ui/components/sidebar'
import { Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function NavPeople() {
  const pathname = usePathname()
  const isActive = pathname === '/people'

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive} tooltip="People">
          <Link href="/people">
            <Users className="h-4 w-4" />
            <span>People</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

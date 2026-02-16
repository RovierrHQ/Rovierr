'use client'

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@rov/ui/components/sidebar'
import { Link, useLocation } from '@tanstack/react-router'
import { Users } from 'lucide-react'

export function NavPeople() {
  const location = useLocation()
  const isActive = location.pathname === '/people'

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton isActive={isActive} tooltip="People">
          <Link to="/people">
            <Users className="h-4 w-4" />
            <span>People</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@rov/ui/components/sidebar'
import { Link, useRouterState } from '@tanstack/react-router'
import { Users } from 'lucide-react'

export function NavPeople() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isActive = pathname === '/people'

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

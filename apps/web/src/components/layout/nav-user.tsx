import { Avatar, AvatarFallback, AvatarImage } from '@rov/ui/components/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@rov/ui/components/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@rov/ui/components/sidebar'
import { AnimatedThemeToggler } from '@rov/ui/components/theme-toggle'
import { useNavigate } from '@tanstack/react-router'
import { authClient } from '@web/lib/auth-client'
import { BadgeCheck, ChevronsUpDown, LogOut } from 'lucide-react'
import { useHotkeys } from 'react-hotkeys-hook'

export function NavUser() {
  const { isMobile } = useSidebar()
  const { data } = authClient.useSession()
  const navigate = useNavigate()

  useHotkeys('ctrl+u', () => navigate({ to: '/profile' }), {
    enabled: !!data?.user
  })

  const initials = data?.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          {/*
            Base UI's MenuPrimitive.Trigger does NOT support asChild.
            Use the `render` prop to swap the underlying element with
            SidebarMenuButton so both get merged into one DOM node.
          */}
          <DropdownMenuTrigger
            className="w-full"
            render={
              <SidebarMenuButton
                className="data-[popup-open]:bg-sidebar-accent data-[popup-open]:text-sidebar-accent-foreground"
                size="lg"
              />
            }
          >
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage
                alt={data?.user?.name ?? 'User'}
                src={data?.user?.image ?? ''}
              />
              <AvatarFallback className="rounded-lg">
                {initials ?? 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{data?.user?.name}</span>
              <span className="truncate text-xs">{data?.user?.email}</span>
            </div>

            <ChevronsUpDown className="ml-auto size-4" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            {/*
              Base UI REQUIRES DropdownMenuLabel (→ MenuPrimitive.GroupLabel)
              to live inside DropdownMenuGroup (→ MenuPrimitive.Group).
              Placing it outside throws "MenuGroupRootContext is missing".
            */}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      alt={data?.user?.name ?? 'User'}
                      src={data?.user?.image ?? ''}
                    />
                    <AvatarFallback className="rounded-lg">
                      {initials ?? 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {data?.user?.name}
                    </span>
                    <span className="truncate text-xs">
                      {data?.user?.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* ── Profile & Edit ───────────────────────────────────────── */}
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate({ to: '/profile' })}>
                <BadgeCheck className="mr-2 h-4 w-4" />
                Profile &amp; Edit
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* ── Theme toggle ─────────────────────────────────────────── */}
            <DropdownMenuGroup>
              {/*
                closeOnClick={false} prevents the menu from closing when
                the theme toggler is clicked (Base UI equivalent of
                Radix's onSelect e.preventDefault()).
              */}
              <DropdownMenuItem
                className="justify-between"
                closeOnClick={false}
              >
                <span>Theme</span>
                <AnimatedThemeToggler />
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* ── Log out ──────────────────────────────────────────────── */}
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() =>
                  authClient.signOut().then(() => navigate({ to: '/login' }))
                }
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

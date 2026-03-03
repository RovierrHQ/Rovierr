import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@rov/ui/components/dropdown-menu'
import { Kbd, KbdGroup } from '@rov/ui/components/kbd'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@rov/ui/components/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@rov/ui/components/tooltip'
import { cn } from '@rov/ui/lib/utils'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import type { ISpaces } from '@web/types/types-space-sidebar-data'
import { ChevronsUpDown, Info } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

export function SpaceSwitcher({ spaces }: { spaces: ISpaces[] }) {
  const { isMobile } = useSidebar()
  const [activeSpace, setActiveSpace] = useState(
    spaces.find((space) => space.isActive)
  )
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isInitialMount = useRef(true)
  const userChangedSpace = useRef(false)

  const cycleToNextSpace = () => {
    const currentIndex = spaces.findIndex(
      (space) => space.name === activeSpace?.name
    )
    const nextIndex = (currentIndex + 1) % spaces.length
    userChangedSpace.current = true
    setActiveSpace(spaces[nextIndex])
  }

  useHotkeys('shift+tab', cycleToNextSpace, { preventDefault: true })

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
    }
    if (userChangedSpace.current) return
    const currentSpace = spaces.find((space) => pathname.startsWith(space.url))
    if (currentSpace && currentSpace.name !== activeSpace?.name) {
      setActiveSpace(currentSpace)
    }
  }, [pathname])

  useEffect(() => {
    if (isInitialMount.current) return
    if (!userChangedSpace.current) return
    userChangedSpace.current = false
    if (activeSpace?.url && !pathname.startsWith(activeSpace.url)) {
      navigate({ to: activeSpace.url })
    }
  }, [activeSpace])

  const handleSpaceChange = (space: ISpaces) => {
    userChangedSpace.current = true
    setActiveSpace(space)
  }

  if (!activeSpace) return null

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                size="lg"
              />
            }
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <activeSpace.logo className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{activeSpace.name}</span>
              <span className="truncate text-xs">{activeSpace.plan}</span>
            </div>
            <ChevronsUpDown className="ml-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex justify-between text-muted-foreground text-xs">
                Spaces{' '}
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="size-4" />
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <KbdGroup>
                      <Kbd>Shift</Kbd>
                      <span>+</span>
                      <Kbd>Tab</Kbd>
                    </KbdGroup>{' '}
                    to cycle through spaces
                  </TooltipContent>
                </Tooltip>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuGroup>
              {spaces.map((space) => (
                <DropdownMenuItem
                  className={cn(
                    'gap-2 p-2',
                    activeSpace.url === space.url && 'border-2 border-dashed'
                  )}
                  key={space.name}
                  onClick={() => handleSpaceChange(space)}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <space.logo className="size-3.5 shrink-0" />
                  </div>
                  {space.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

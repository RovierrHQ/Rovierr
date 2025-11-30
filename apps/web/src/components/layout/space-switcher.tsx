'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
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
import { ChevronsUpDown, Info } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import type { ISpaces } from '@/types/types-space-sidebar-data'

export function SpaceSwitcher({ spaces }: { spaces: ISpaces[] }) {
  const { isMobile } = useSidebar()
  const [activeSpace, setActiveSpace] = useState(
    spaces.find((space) => space.isActive)
  )
  const router = useRouter()
  const pathname = usePathname()
  const isInitialMount = useRef(true)
  const userChangedSpace = useRef(false)

  // Cycle to next space
  const cycleToNextSpace = () => {
    const currentIndex = spaces.findIndex(
      (space) => space.name === activeSpace?.name
    )
    const nextIndex = (currentIndex + 1) % spaces.length
    userChangedSpace.current = true
    setActiveSpace(spaces[nextIndex])
  }

  useHotkeys('shift+tab', cycleToNextSpace, { preventDefault: true })

  // Sync activeSpace with current route when route changes (but don't redirect)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      // Set active space based on current route
      const currentSpace = spaces.find((space) =>
        pathname.startsWith(space.url)
      )
      if (currentSpace && currentSpace.name !== activeSpace?.name) {
        setActiveSpace(currentSpace)
      }
      return
    }

    // If user didn't explicitly change space, sync with route
    if (!userChangedSpace.current) {
      const currentSpace = spaces.find((space) =>
        pathname.startsWith(space.url)
      )
      if (currentSpace && currentSpace.name !== activeSpace?.name) {
        setActiveSpace(currentSpace)
      }
      return
    }

    // User explicitly changed space - reset flag and navigate
    userChangedSpace.current = false

    // Don't redirect if we're already on the active space URL or a child route
    if (activeSpace?.url && pathname.startsWith(activeSpace.url)) {
      return
    }

    // Navigate to the new space
    if (activeSpace?.url) {
      router.push(activeSpace.url)
    }
  }, [activeSpace, router, pathname, spaces])

  // Handle explicit space change from dropdown
  const handleSpaceChange = (space: ISpaces) => {
    userChangedSpace.current = true
    setActiveSpace(space)
  }

  if (!activeSpace) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              size="lg"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <activeSpace.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeSpace.name}</span>
                <span className="truncate text-xs">{activeSpace.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
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
                {/* <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut> */}
              </DropdownMenuItem>
            ))}
            {/* <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add space</div>
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

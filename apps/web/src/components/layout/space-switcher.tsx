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
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import type { ISpaces } from '@/data/space-sidebar-data'

export function SpaceSwitcher({ spaces }: { spaces: ISpaces[] }) {
  const { isMobile } = useSidebar()
  const [activeSpace, setActiveSpace] = useState(spaces[0])
  const router = useRouter()

  // Cycle to next space
  const cycleToNextSpace = () => {
    const currentIndex = spaces.findIndex(
      (space) => space.name === activeSpace.name
    )
    const nextIndex = (currentIndex + 1) % spaces.length
    setActiveSpace(spaces[nextIndex])
  }

  useHotkeys('shift+tab', cycleToNextSpace, { preventDefault: true })

  useEffect(() => {
    router.push(activeSpace.url)
  }, [activeSpace, router])

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
            {spaces
              .filter((space) => space.isActive)
              .map((space) => (
                <DropdownMenuItem
                  className={cn(
                    'gap-2 p-2',
                    activeSpace.url === space.url && 'border-2 border-dashed'
                  )}
                  key={space.name}
                  onClick={() => setActiveSpace(space)}
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

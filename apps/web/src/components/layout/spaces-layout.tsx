import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from '@rov/ui/components/input-group'
import { SidebarInset, SidebarProvider } from '@rov/ui/components/sidebar'
import { MicIcon, SearchIcon } from 'lucide-react'
import type { FC, PropsWithChildren } from 'react'
import { SpacesSidebar } from '@/components/layout/spaces-sidebar'
import { SpacesHeader } from './spaces-greeting'
import { SpaceSidebarItemsProvider } from './use-space-sidebar-items'

interface SpacesLayoutProps extends PropsWithChildren {
  showHeader?: boolean
}

const SpacesLayout: FC<SpacesLayoutProps> = ({
  children,
  showHeader = true
}) => {
  return (
    <SpaceSidebarItemsProvider>
      <SidebarProvider>
        <SpacesSidebar />
        <SidebarInset>
          {showHeader && (
            <header className="sticky top-0 z-50 flex items-center justify-between bg-inherit p-10 pb-6 transition-[width,height] ease-linear">
              <SpacesHeader />
              <InputGroup className="h-12 w-80 rounded-full">
                <InputGroupInput placeholder="Type a Command or Speak" />
                <InputGroupAddon>
                  <SearchIcon />
                </InputGroupAddon>
                <InputGroupAddon align="inline-end">
                  <MicIcon />
                </InputGroupAddon>
              </InputGroup>
            </header>
          )}
          {children}
        </SidebarInset>
      </SidebarProvider>
    </SpaceSidebarItemsProvider>
  )
}

export default SpacesLayout

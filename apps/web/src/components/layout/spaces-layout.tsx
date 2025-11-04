import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from '@rov/ui/components/input-group'
import { SidebarInset, SidebarProvider } from '@rov/ui/components/sidebar'
import { MicIcon, SearchIcon } from 'lucide-react'
import type { FC, PropsWithChildren } from 'react'
import { AppSidebar } from '@/components/layout/app-sidebar'

const SpacesLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 flex items-center justify-between bg-inherit p-10 pb-6 transition-[width,height] ease-linear">
          <div className="flex items-center gap-2 px-4">
            <h2 className="font-semibold text-3xl leading-normal">
              Hey Rejoan 👋
            </h2>
          </div>
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
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}

export default SpacesLayout

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from '@rov/ui/components/input-group'
import { SidebarInset, SidebarProvider } from '@rov/ui/components/sidebar'
import { MicIcon, SearchIcon } from 'lucide-react'
import type { FC, PropsWithChildren } from 'react'
import { SpacesSidebar } from '@/components/layout/spaces-sidebar'
import VerifyUniversityEmail from '../verify/email-verification-flow'
import { SpacesHeader } from './spaces-greeting'

const SpacesLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <SidebarProvider>
      <SpacesSidebar />
      <SidebarInset>
        <header className="sticky top-0 flex items-center justify-between bg-inherit p-10 pb-6 transition-[width,height] ease-linear">
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
        {children}

        <VerifyUniversityEmail />
      </SidebarInset>
    </SidebarProvider>
  )
}

export default SpacesLayout

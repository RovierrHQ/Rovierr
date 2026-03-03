import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@rov/ui/components/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '@rov/ui/components/sidebar'
import { useNavigate } from '@tanstack/react-router'
import type { ISpacesChildrenItems } from '@web/types/types-space-sidebar-data'
import { ChevronRight } from 'lucide-react'

const SpacesNav = ({
  spacesChildrenItems
}: {
  spacesChildrenItems: ISpacesChildrenItems[]
}) => {
  const navigate = useNavigate()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>My Clubs</SidebarGroupLabel>
      <SidebarMenu>
        {spacesChildrenItems?.map((item) => (
          <Collapsible
            className="group/collapsible"
            defaultOpen={item.isActive}
            key={item.title}
          >
            <SidebarMenuItem>
              <CollapsibleTrigger>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton
                        onClick={() => navigate({ to: subItem.url })}
                      >
                        <span>{subItem.title}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export default SpacesNav

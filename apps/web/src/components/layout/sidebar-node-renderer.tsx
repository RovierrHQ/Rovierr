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
import { Link, useNavigate } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import type { SidebarNode } from './use-space-sidebar-items'

function SidebarNodeRenderer({ node }: { node: SidebarNode }) {
  const navigate = useNavigate()

  if (node.type === 'group-header') {
    return (
      <SidebarGroup>
        {node.url ? (
          <SidebarGroupLabel>
            <Link className="hover:text-sidebar-foreground" to={node.url}>
              {node.title}
            </Link>
          </SidebarGroupLabel>
        ) : (
          <SidebarGroupLabel>{node.title}</SidebarGroupLabel>
        )}
        <SidebarMenu>
          {node.children?.flatMap((child) => {
            if (child.type === 'item') {
              return (
                <SidebarMenuItem key={child.id}>
                  <SidebarMenuButton
                    onClick={() => navigate({ to: child.url || '#' })}
                    tooltip={child.title}
                  >
                    {child.icon && <child.icon />}
                    <span className="truncate">{child.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            }
            if (child.type === 'empty-state' && child.emptyStateActions) {
              return child.emptyStateActions.map((action) => (
                <SidebarMenuItem key={action.url}>
                  <SidebarMenuButton
                    onClick={() => navigate({ to: action.url })}
                    tooltip={action.label}
                  >
                    {action.icon && <action.icon />}
                    <span className="truncate">{action.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))
            }
            return <SidebarNodeRenderer key={child.id} node={child} />
          })}
        </SidebarMenu>
      </SidebarGroup>
    )
  }

  if (node.type === 'empty-state') {
    return (
      <>
        {node.emptyStateActions && node.emptyStateActions.length > 0 ? (
          node.emptyStateActions.map((action) => (
            <SidebarMenuItem key={action.url}>
              <SidebarMenuButton
                onClick={() => navigate({ to: action.url })}
                tooltip={action.label}
              >
                {action.icon && <action.icon />}
                <span className="truncate">{action.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))
        ) : (
          <SidebarMenuItem>
            <div className="px-2 py-4 text-center">
              <p className="text-muted-foreground text-sm">
                {node.emptyStateMessage || node.title}
              </p>
            </div>
          </SidebarMenuItem>
        )}
      </>
    )
  }

  if (node.type === 'collapsible') {
    return (
      <Collapsible className="group/collapsible" defaultOpen={node.isActive}>
        <SidebarMenuItem>
          <CollapsibleTrigger>
            <SidebarMenuButton
              onClick={node.url ? () => navigate({ to: node.url! }) : undefined}
              tooltip={node.title}
            >
              {node.icon && <node.icon />}
              <span className="truncate">{node.title}</span>
              {node.children && (
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              )}
            </SidebarMenuButton>
          </CollapsibleTrigger>
          {node.children && (
            <CollapsibleContent>
              <SidebarMenuSub>
                {node.children.map((child) => (
                  <SidebarMenuSubItem key={child.id}>
                    <SidebarMenuSubButton
                      onClick={() => navigate({ to: child.url || '#' })}
                    >
                      <span>{child.title}</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          )}
        </SidebarMenuItem>
      </Collapsible>
    )
  }

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => navigate({ to: node.url || '#' })}
            tooltip={node.title}
          >
            {node.icon && <node.icon />}
            <span className="truncate">{node.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}

export default SidebarNodeRenderer

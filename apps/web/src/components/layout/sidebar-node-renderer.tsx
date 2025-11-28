'use client'

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
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type { SidebarNode } from './use-space-sidebar-items'

function SidebarNodeRenderer({ node }: { node: SidebarNode }) {
  if (node.type === 'group-header') {
    return (
      <SidebarGroup>
        {node.url ? (
          <SidebarGroupLabel>
            <Link className="hover:text-sidebar-foreground" href={node.url}>
              {node.title}
            </Link>
          </SidebarGroupLabel>
        ) : (
          <SidebarGroupLabel>{node.title}</SidebarGroupLabel>
        )}
        <SidebarMenu>
          {node.children?.flatMap((child) => {
            // If child is an item, render it directly as SidebarMenuItem
            if (child.type === 'item') {
              return (
                <SidebarMenuItem key={child.id}>
                  <SidebarMenuButton asChild tooltip={child.title}>
                    <Link href={child.url || '#'}>
                      {child.icon && <child.icon />}
                      <span className="truncate">{child.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            }
            // If child is an empty-state with actions, render actions as menu items
            if (child.type === 'empty-state' && child.emptyStateActions) {
              return child.emptyStateActions.map((action) => (
                <SidebarMenuItem key={action.url}>
                  <SidebarMenuButton asChild tooltip={action.label}>
                    <Link href={action.url}>
                      {action.icon && <action.icon />}
                      <span className="truncate">{action.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))
            }
            // For other types (collapsible, empty-state without actions), use the renderer
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
          // Render actions as sidebar menu items
          node.emptyStateActions.map((action) => (
            <SidebarMenuItem key={action.url}>
              <SidebarMenuButton asChild tooltip={action.label}>
                <Link href={action.url}>
                  {action.icon && <action.icon />}
                  <span className="truncate">{action.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))
        ) : (
          // Fallback: show message if no actions
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
          <CollapsibleTrigger asChild>
            <SidebarMenuButton asChild={!!node.url} tooltip={node.title}>
              {node.url ? (
                <Link href={node.url}>
                  {node.icon && <node.icon />}
                  <span className="truncate">{node.title}</span>
                  {node.children && (
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  )}
                </Link>
              ) : (
                <>
                  {node.icon && <node.icon />}
                  <span className="truncate">{node.title}</span>
                  {node.children && (
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  )}
                </>
              )}
            </SidebarMenuButton>
          </CollapsibleTrigger>
          {node.children && (
            <CollapsibleContent>
              <SidebarMenuSub>
                {node.children.map((child) => (
                  <SidebarMenuSubItem key={child.id}>
                    <SidebarMenuSubButton asChild>
                      <Link href={child.url || '#'}>
                        <span>{child.title}</span>
                      </Link>
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

  // Regular item
  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip={node.title}>
            <Link href={node.url || '#'}>
              {node.icon && <node.icon />}
              <span className="truncate">{node.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}

export default SidebarNodeRenderer

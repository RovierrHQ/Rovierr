'use client'

import { Button } from '@rov/ui/components/button'
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
        <SidebarGroupLabel>{node.title}</SidebarGroupLabel>
        <SidebarMenu>
          {node.children?.map((child) => (
            <SidebarNodeRenderer key={child.id} node={child} />
          ))}
        </SidebarMenu>
      </SidebarGroup>
    )
  }

  if (node.type === 'empty-state') {
    return (
      <SidebarMenuItem>
        <div className="px-2 py-4 text-center">
          <p className="mb-3 text-muted-foreground text-sm">
            {node.emptyStateMessage || node.title}
          </p>
          {node.emptyStateActions && node.emptyStateActions.length > 0 && (
            <div className="flex flex-col gap-2">
              {node.emptyStateActions.map((action) => (
                <Button
                  asChild
                  className="w-full"
                  key={action.url}
                  size="sm"
                  variant="outline"
                >
                  <Link href={action.url}>{action.label}</Link>
                </Button>
              ))}
            </div>
          )}
        </div>
      </SidebarMenuItem>
    )
  }

  if (node.type === 'collapsible') {
    return (
      <Collapsible
        asChild
        className="group/collapsible"
        defaultOpen={node.isActive}
      >
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton asChild={!!node.url} tooltip={node.title}>
              {node.url ? (
                <Link href={node.url}>
                  {node.icon && <node.icon />}
                  <span>{node.title}</span>
                  {node.children && (
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  )}
                </Link>
              ) : (
                <>
                  {node.icon && <node.icon />}
                  <span>{node.title}</span>
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
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip={node.title}>
        <Link href={node.url || '#'}>
          {node.icon && <node.icon />}
          <span>{node.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export default SidebarNodeRenderer

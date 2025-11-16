'use client'

import type * as lr from 'lucide-react'
import { createContext, type ReactNode, useContext, useState } from 'react'

export type SidebarNodeType =
  | 'group-header'
  | 'item'
  | 'collapsible'
  | 'empty-state'

export interface SidebarNode {
  id: string
  title: string
  type: SidebarNodeType
  url?: string
  icon?: lr.LucideIcon
  isActive?: boolean
  children?: SidebarNode[]
  emptyStateMessage?: string
  emptyStateActions?: Array<{
    label: string
    url: string
  }>
}

export interface SidebarTree {
  nodes: SidebarNode[]
}

interface SpaceSidebarItemsContextValue {
  sidebarTree: SidebarTree | null
  setSidebarTree: (tree: SidebarTree | null) => void
}

const SpaceSidebarItemsContext =
  createContext<SpaceSidebarItemsContextValue | null>(null)

export function SpaceSidebarItemsProvider({
  children
}: {
  children: ReactNode
}) {
  const [sidebarTree, setSidebarTree] = useState<SidebarTree | null>(null)

  return (
    <SpaceSidebarItemsContext.Provider
      value={{
        sidebarTree,
        setSidebarTree
      }}
    >
      {children}
    </SpaceSidebarItemsContext.Provider>
  )
}

export function useSpaceSidebarItems() {
  const context = useContext(SpaceSidebarItemsContext)
  if (!context) {
    throw new Error(
      'useSpaceSidebarItems must be used within SpaceSidebarItemsProvider'
    )
  }
  return context
}

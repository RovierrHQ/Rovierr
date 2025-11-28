'use client'

import type * as lr from 'lucide-react'
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react'

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
    icon?: lr.LucideIcon
  }>
}

export interface SidebarTree {
  nodes: SidebarNode[]
}

// Store sidebar tree in a module-level variable to persist across provider instances
// This avoids JSON serialization issues with icon functions and infinite loops
let persistedSidebarTree: SidebarTree | null = null

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
  // Initialize from persisted value - this only runs once per provider instance
  const [sidebarTree, setSidebarTreeState] = useState<SidebarTree | null>(
    () => persistedSidebarTree
  )

  const setSidebarTree = useCallback((tree: SidebarTree | null) => {
    // Only update if the tree reference has actually changed
    if (persistedSidebarTree === tree) {
      return
    }
    persistedSidebarTree = tree
    setSidebarTreeState(tree)
  }, [])

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      sidebarTree,
      setSidebarTree
    }),
    [sidebarTree, setSidebarTree]
  )

  return (
    <SpaceSidebarItemsContext.Provider value={contextValue}>
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

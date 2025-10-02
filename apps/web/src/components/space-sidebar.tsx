'use client'

import { cn } from '@rov/ui/lib/utils'
import { ChevronRight, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

export interface SidebarSection {
  id: string
  label: string
  icon: LucideIcon
  href: string
}

interface SpaceSidebarProps {
  sections: SidebarSection[]
  spaceColor: string
}

export function SpaceSidebar({ sections, spaceColor }: SpaceSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <aside
      className={cn(
        'sticky top-20 h-[calc(100vh-5rem)] border-border border-r bg-card/50 backdrop-blur-sm transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col p-4">
        <button
          className="mb-6 flex items-center justify-end text-muted-foreground transition-colors hover:text-foreground"
          onClick={() => setCollapsed(!collapsed)}
          type="button"
        >
          <ChevronRight
            className={cn(
              'h-5 w-5 transition-transform',
              !collapsed && 'rotate-180'
            )}
          />
        </button>

        <nav className="flex-1 space-y-2">
          {sections.map((section) => {
            const Icon = section.icon
            const isActive = pathname === section.href

            return (
              <Link
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-sm transition-all',
                  isActive
                    ? `bg-gradient-to-r ${spaceColor} text-white shadow-md`
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
                href={section.href}
                key={section.id}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && (
                  <span className="truncate">{section.label}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {!collapsed && (
          <div className="mt-auto rounded-lg border border-border bg-card p-3">
            <p className="text-muted-foreground text-xs">
              Press{' '}
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-semibold text-xs">
                ⌘K
              </kbd>{' '}
              for quick navigation
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}

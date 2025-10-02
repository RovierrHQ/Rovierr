'use client'

import { AnimatedThemeToggler } from '@rov/ui/components/theme-toggle'
import Link from 'next/link'
import { SpaceSwitcher } from './space-switcher'
import UserDropdown from './user-drowpdown'

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-border border-b bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
          href="/"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <span className="font-bold text-lg text-primary">R</span>
          </div>
          <h1 className="hidden font-semibold text-foreground text-xl sm:block">
            Dashboard
          </h1>
        </Link>

        <SpaceSwitcher variant="compact" />
        <div className="flex items-center gap-2">
          <AnimatedThemeToggler />
          <UserDropdown />
        </div>
      </div>
    </nav>
  )
}

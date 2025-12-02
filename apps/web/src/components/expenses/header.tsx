'use client'

import { Avatar, AvatarFallback } from '@rov/ui/components/avatar'
import { Button } from '@rov/ui/components/button'
import { Input } from '@rov/ui/components/input'
import { Bell, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { CreateExpenseModal } from './create-expense-modal'

export function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-border border-b bg-card px-6">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative w-96">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="bg-background pl-10"
              placeholder="Search expenses..."
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            className="gap-2"
            onClick={() => setIsModalOpen(true)}
            size="sm"
          >
            <Plus className="h-4 w-4" />
            New Expense
          </Button>

          <Button className="relative" size="icon" variant="ghost">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
          </Button>

          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              JD
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      <CreateExpenseModal onOpenChange={setIsModalOpen} open={isModalOpen} />
    </>
  )
}

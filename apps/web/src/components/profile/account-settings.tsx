'use client'

import { Card } from '@rov/ui/components/card'
import {
  Bell,
  ChevronRight,
  HelpCircle,
  Lock,
  LogOut,
  Settings
} from 'lucide-react'

export function AccountSettings() {
  return (
    <Card className="space-y-6 border-border/50 bg-card/50 p-6 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Account Settings</h3>
        </div>
      </div>

      <div className="space-y-2">
        <button className="flex w-full items-center justify-between rounded-lg bg-secondary/30 p-3 transition-colors hover:bg-secondary/50">
          <div className="flex items-center gap-3">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">Privacy Settings</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>

        <button className="flex w-full items-center justify-between rounded-lg bg-secondary/30 p-3 transition-colors hover:bg-secondary/50">
          <div className="flex items-center gap-3">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">Notifications</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>

        <button className="flex w-full items-center justify-between rounded-lg bg-secondary/30 p-3 transition-colors hover:bg-secondary/50">
          <div className="flex items-center gap-3">
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">Help & Support</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>

        <button className="flex w-full items-center justify-between rounded-lg bg-destructive/10 p-3 text-destructive transition-colors hover:bg-destructive/20">
          <div className="flex items-center gap-3">
            <LogOut className="h-4 w-4" />
            <span className="font-medium text-sm">Sign Out</span>
          </div>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </Card>
  )
}

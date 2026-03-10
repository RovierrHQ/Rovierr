'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'
import { ActiveSessions, SecuritySettings } from './settings/security-settings'
import { VerificationSettings } from './settings/verification-settings'

export function SettingsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Manage your account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Security Card */}
          <SecuritySettings />

          {/* Verification Card */}
          <VerificationSettings />

          {/* Active Sessions */}
          <ActiveSessions />
        </CardContent>
      </Card>
    </div>
  )
}

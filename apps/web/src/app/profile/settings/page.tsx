'use client'

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@rov/ui/components/tabs'
import { CornerUpLeft } from 'lucide-react'
import Link from 'next/link'
import { ProfileSettings } from '@/components/profile/tabs/settings/profile-settings'
import { SecuritySettings } from '@/components/profile/tabs/settings/security-settings'
import { VerificationSettings } from '@/components/profile/tabs/settings/verification-settings'

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link
        className="mb-6 flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
        href="/profile"
      >
        <CornerUpLeft className="size-4" />
        <span className="text-sm">Back to Profile</span>
      </Link>

      <div className="mb-8">
        <h1 className="mb-2 font-bold text-4xl text-foreground tracking-tight">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs className="space-y-6" defaultValue="student">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="student">Student Status</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        {/* Student Status Tab */}
        <TabsContent className="space-y-6" value="student">
          <VerificationSettings />
        </TabsContent>

        {/* Security Tab */}
        <TabsContent className="space-y-6" value="security">
          <SecuritySettings />
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent className="space-y-6" value="profile">
          <ProfileSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}

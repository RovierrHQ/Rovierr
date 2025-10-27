'use client'

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@rov/ui/components/tabs'
import { CornerUpLeft } from 'lucide-react'
import Link from 'next/link'
import Profile from '@/components/profile/settings/profile'
import Security from '@/components/profile/settings/security'
import VerifyStudentStatus from '@/components/profile/settings/verify-student-status'

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
          <VerifyStudentStatus />
        </TabsContent>

        {/* Security Tab */}
        <TabsContent className="space-y-6" value="security">
          <Security />
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent className="space-y-6" value="profile">
          <Profile />
        </TabsContent>
      </Tabs>
    </div>
  )
}

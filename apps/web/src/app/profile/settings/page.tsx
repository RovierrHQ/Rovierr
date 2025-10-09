'use client'

import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'
import { Dropzone } from '@rov/ui/components/dropzone'
import { Input } from '@rov/ui/components/input'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot
} from '@rov/ui/components/input-otp'
import { Label } from '@rov/ui/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@rov/ui/components/select'
import { Separator } from '@rov/ui/components/separator'
import { Switch } from '@rov/ui/components/switch'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@rov/ui/components/tabs'
import {
  CheckCircle2,
  Chrome,
  CornerUpLeft,
  Github,
  Monitor,
  Shield,
  Smartphone,
  Trash2,
  XCircle
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function SettingsPage() {
  const [studentVerified, setStudentVerified] = useState(false)
  const [showVerificationForm, setShowVerificationForm] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const [showPhoneOTP, setShowPhoneOTP] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  // Form states
  const [university, setUniversity] = useState('')
  const [startDate, setStartDate] = useState('')
  const [universityEmail, setUniversityEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [idDocument, setIdDocument] = useState<File | null>(null)

  // Mock active sessions
  const [sessions, setSessions] = useState([
    {
      id: 1,
      device: 'MacBook Pro',
      location: 'San Francisco, US',
      lastActive: '2 minutes ago',
      current: true
    },
    {
      id: 2,
      device: 'iPhone 14',
      location: 'San Francisco, US',
      lastActive: '1 hour ago',
      current: false
    },
    {
      id: 3,
      device: 'Chrome on Windows',
      location: 'New York, US',
      lastActive: '2 days ago',
      current: false
    }
  ])

  const handleSendOTP = () => {
    setShowOTP(true)
  }

  const handleVerifyOTP = (otp: string) => {
    console.log('Verifying OTP:', otp)
    // Simulate verification
    setTimeout(() => {
      setStudentVerified(true)
      setShowVerificationForm(false)
      setShowOTP(false)
    }, 1000)
  }

  const handleSendPhoneOTP = () => {
    setShowPhoneOTP(true)
  }

  const handleVerifyPhoneOTP = (otp: string) => {
    console.log('Verifying phone OTP:', otp)
    // Simulate verification
    setTimeout(() => {
      setShowPhoneOTP(false)
    }, 1000)
  }

  const handleRevokeSession = (id: number) => {
    setSessions(sessions.filter((s) => s.id !== id))
  }

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
          
        </TabsContent>

        {/* Security Tab */}
        <TabsContent className="space-y-6" value="security">
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Enable 2FA</div>
                  <div className="text-muted-foreground text-sm">
                    Require a verification code in addition to your password
                  </div>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={setTwoFactorEnabled}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connected Accounts</CardTitle>
              <CardDescription>
                Manage your linked social accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-muted p-2">
                    <Chrome className="size-5" />
                  </div>
                  <div>
                    <div className="font-medium">Google</div>
                    <div className="text-muted-foreground text-sm">
                      Not connected
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Connect
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-muted p-2">
                    <Github className="size-5" />
                  </div>
                  <div>
                    <div className="font-medium">GitHub</div>
                    <div className="text-muted-foreground text-sm">
                      Not connected
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Connect
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                Manage devices where you're currently logged in
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessions.map((session) => (
                <div
                  className="flex items-center justify-between rounded-lg border p-4"
                  key={session.id}
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-muted p-2">
                      {session.device.includes('iPhone') ? (
                        <Smartphone className="size-5" />
                      ) : (
                        <Monitor className="size-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{session.device}</span>
                        {session.current && (
                          <Badge className="text-xs" variant="secondary">
                            Current
                          </Badge>
                        )}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {session.location} • {session.lastActive}
                      </div>
                    </div>
                  </div>
                  {!session.current && (
                    <Button
                      onClick={() => handleRevokeSession(session.id)}
                      size="sm"
                      variant="ghost"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent className="space-y-6" value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" placeholder="johndoe" />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    type="tel"
                    value={phoneNumber}
                  />
                </div>

                {!showPhoneOTP && (
                  <Button onClick={handleSendPhoneOTP} variant="outline">
                    Send Verification Code
                  </Button>
                )}

                {showPhoneOTP && (
                  <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
                    <div className="space-y-2">
                      <Label>Enter Verification Code</Label>
                      <p className="text-muted-foreground text-sm">
                        We sent a code to {phoneNumber || 'your phone'}
                      </p>
                      {/* <OTPInput length={6} onComplete={handleVerifyPhoneOTP} /> */}
                    </div>
                    <Button
                      onClick={handleSendPhoneOTP}
                      size="sm"
                      variant="ghost"
                    >
                      Resend Code
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

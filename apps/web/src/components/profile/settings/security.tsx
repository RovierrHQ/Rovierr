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
import { useQuery } from '@tanstack/react-query'
import { Monitor, Smartphone, Trash2 } from 'lucide-react'
import { UAParser } from 'ua-parser-js'
import { authClient } from '@/lib/auth-client'

function Security() {
  const { data: sessions } = useQuery({
    queryFn: () => authClient.listSessions(),
    queryKey: ['active-sessions']
  })
  const currentSession = authClient.useSession()
  return (
    <>
      {/* <Card>
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
              checked={authClient.twoFactor.}
              onCheckedChange={setTwoFactorEnabled}
            />
          </div>
        </CardContent>
      </Card> */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>Manage your linked social accounts</CardDescription>
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
      </Card> */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Manage devices where you're currently logged in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessions?.data?.map((session) => (
            <div
              className="flex items-center justify-between rounded-lg border p-4"
              key={session.id}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-muted p-2">
                  {new UAParser(session.userAgent ?? '').getDevice().type ===
                  'mobile' ? (
                    <Smartphone className="size-5" />
                  ) : (
                    <Monitor className="size-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {new UAParser(session.userAgent || '').getOS().name ||
                        session.userAgent}
                      ,{' '}
                      {new UAParser(session.userAgent || '').getBrowser().name}
                    </span>
                    {session.id === currentSession.data?.session.id && (
                      <Badge className="text-xs" variant="secondary">
                        Current
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              {session.id !== currentSession.data?.session.id && (
                <Button
                  onClick={() =>
                    authClient.revokeSession({ token: session.token })
                  }
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
    </>
  )
}

export default Security

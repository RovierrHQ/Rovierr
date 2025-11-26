'use client'

import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import { Card, CardContent } from '@rov/ui/components/card'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Monitor, Smartphone, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { UAParser } from 'ua-parser-js'
import { authClient } from '@/lib/auth-client'

export function SecuritySettings() {
  const queryClient = useQueryClient()
  const { data: currentSession } = authClient.useSession()
  const { data: sessions, isLoading } = useQuery({
    queryFn: () => authClient.listSessions(),
    queryKey: ['active-sessions']
  })

  const revokeMutation = useMutation({
    mutationFn: (token: string) => authClient.revokeSession({ token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] })
      toast.success('Session revoked successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to revoke session')
    }
  })

  const handleRevoke = (sessionId: string, token: string) => {
    if (sessionId === currentSession?.session.id) {
      toast.error('Cannot revoke your current session')
      return
    }
    revokeMutation.mutate(token)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-4">
      <div>
        <h3 className="font-medium text-sm">Active Sessions</h3>
        <p className="text-muted-foreground text-xs">
          Manage devices where you're currently logged in
        </p>
      </div>

      <div className="space-y-4">
        {sessions?.data?.map((session) => {
          const parser = new UAParser(session.userAgent ?? '')
          const device = parser.getDevice()
          const os = parser.getOS()
          const browser = parser.getBrowser()
          const isCurrent = session.id === currentSession?.session.id

          return (
            <Card key={session.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-muted p-2">
                      {device.type === 'mobile' ? (
                        <Smartphone className="h-5 w-5" />
                      ) : (
                        <Monitor className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {os.name || 'Unknown OS'},{' '}
                          {browser.name || 'Unknown Browser'}
                        </span>
                        {isCurrent && (
                          <Badge className="text-xs" variant="secondary">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {session.ipAddress || 'Unknown location'}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Last active:{' '}
                        {new Date(session.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!isCurrent && (
                    <Button
                      disabled={revokeMutation.isPending}
                      onClick={() => handleRevoke(session.id, session.token)}
                      size="sm"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {(!sessions?.data || sessions.data.length === 0) && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Monitor className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground text-sm">
                  No active sessions found
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

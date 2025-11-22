'use client'

import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@rov/ui/components/dialog'
import { useAppForm } from '@rov/ui/components/form/index'
import { Label } from '@rov/ui/components/label'
import { Switch } from '@rov/ui/components/switch'
import { Textarea } from '@rov/ui/components/textarea'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, UserPlus, XCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { authClient } from '@/lib/auth-client'

interface InviteMemberDialogProps {
  organizationId: string
  trigger?: React.ReactNode
}

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.string().min(1, 'Role is required')
})

interface ParsedInvite {
  email: string
  role: string
  isValid: boolean
  error?: string
}

// Email regex defined at top level for performance
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function parseBulkInvites(text: string, validRoles: string[]): ParsedInvite[] {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  return lines.map((line) => {
    // Handle tab-separated values (Excel default)
    const parts = line.split('\t').map((p) => p.trim())
    // Handle comma-separated values
    const partsComma = line.split(',').map((p) => p.trim())

    // Use whichever has exactly 2 parts, prefer tab
    let columns: string[]
    if (parts.length === 2) {
      columns = parts
    } else if (partsComma.length === 2) {
      columns = partsComma
    } else {
      columns = [line]
    }

    if (columns.length !== 2) {
      return {
        email: columns[0] ?? '',
        role: '',
        isValid: false,
        error: 'Must have exactly 2 columns (email and role)'
      }
    }

    const [email, role] = columns

    if (!(email && EMAIL_REGEX.test(email))) {
      return {
        email: email ?? '',
        role: role ?? '',
        isValid: false,
        error: 'Invalid email format'
      }
    }

    if (!role || role.length === 0) {
      return {
        email,
        role: '',
        isValid: false,
        error: 'Role is required'
      }
    }

    const normalizedRole = role.toLowerCase().trim()
    if (!validRoles.includes(normalizedRole)) {
      return {
        email,
        role: normalizedRole,
        isValid: false,
        error: `Invalid role. Valid roles: ${validRoles.join(', ')}`
      }
    }

    return {
      email,
      role: normalizedRole,
      isValid: true
    }
  })
}

export function InviteMemberDialog({
  organizationId,
  trigger
}: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false)
  const [isBulkMode, setIsBulkMode] = useState(false)
  const [bulkText, setBulkText] = useState('')
  const [progress, setProgress] = useState<{
    sent: number
    total: number
    isProcessing: boolean
  }>({ sent: 0, total: 0, isProcessing: false })
  const queryClient = useQueryClient()

  // Fetch available roles
  const { data: rolesData } = useQuery({
    queryKey: ['organization-roles', organizationId],
    queryFn: async () => {
      const result = await authClient.organization.listRoles({
        query: {
          organizationId
        }
      })
      return result
    }
  })

  const roles = rolesData?.data ?? []
  const validRoles = useMemo(() => {
    return roles.map((r) => r.role.toLowerCase().trim())
  }, [roles])

  const parsedInvites = useMemo(() => {
    if (!(isBulkMode && bulkText.trim())) return []
    return parseBulkInvites(bulkText, validRoles)
  }, [bulkText, isBulkMode, validRoles])

  const validInvites = useMemo(() => {
    return parsedInvites.filter((invite) => invite.isValid)
  }, [parsedInvites])

  const form = useAppForm({
    validators: {
      onSubmit: inviteSchema
    },
    defaultValues: {
      email: '',
      role: 'member'
    } as z.infer<typeof inviteSchema>,
    onSubmit: async ({ value }) => {
      if (isBulkMode) {
        if (validInvites.length === 0) {
          toast.error('No valid invites to send')
          return
        }
        try {
          await bulkInviteMutation.mutateAsync(validInvites)
          setOpen(false)
          setBulkText('')
          setIsBulkMode(false)
          form.reset()
        } catch (_error) {
          // Error handled in mutation
        }
      } else {
        try {
          await inviteMutation.mutateAsync({
            email: value.email,
            role: value.role
          })
          setOpen(false)
          form.reset()
        } catch (_error) {
          // Error handled in mutation
        }
      }
    }
  })

  const inviteMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      await authClient.organization.inviteMember({
        email,
        role: role as 'member' | 'admin' | 'owner',
        organizationId
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['organization-members', organizationId]
      })
      queryClient.invalidateQueries({
        queryKey: ['organization-invitations', organizationId]
      })
      toast.success('Invitation sent successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send invitation')
    }
  })

  const bulkInviteMutation = useMutation({
    mutationFn: async (invites: ParsedInvite[]) => {
      // Better Auth default rate limit: 100 requests per 60 seconds
      // Using conservative batching: 5 requests per batch with 1 second delay
      // This keeps us well under the limit (~50 requests per minute max)
      const BATCH_SIZE = 5
      const BATCH_DELAY_MS = 1000 // 1 second between batches

      setProgress({ sent: 0, total: invites.length, isProcessing: true })

      const processInvite = async (
        invite: ParsedInvite
      ): Promise<{ success: boolean; email: string; error?: string }> => {
        try {
          await authClient.organization.inviteMember({
            email: invite.email,
            role: invite.role as 'member' | 'admin' | 'owner',
            organizationId
          })
          return { success: true, email: invite.email }
        } catch (error) {
          return {
            success: false,
            email: invite.email,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }

      const results: Array<{
        success: boolean
        email: string
        error?: string
      }> = []

      // Process batches sequentially to respect rate limits
      const processBatch = async (
        batchIndex: number
      ): Promise<
        Array<{ success: boolean; email: string; error?: string }>
      > => {
        const startIndex = batchIndex * BATCH_SIZE
        const batch = invites.slice(startIndex, startIndex + BATCH_SIZE)

        if (batch.length === 0) {
          return []
        }

        // Process batch items in parallel
        const batchResults = await Promise.allSettled(
          batch.map((invite) => processInvite(invite))
        )

        // Collect results
        const batchOutput: Array<{
          success: boolean
          email: string
          error?: string
        }> = []
        for (const result of batchResults) {
          if (result.status === 'fulfilled') {
            batchOutput.push(result.value)
          } else {
            batchOutput.push({
              success: false,
              email: 'unknown',
              error: result.reason?.message ?? 'Unknown error'
            })
          }
        }

        // Update progress
        const sent = Math.min(startIndex + BATCH_SIZE, invites.length)
        setProgress({ sent, total: invites.length, isProcessing: true })

        return batchOutput
      }

      // Process all batches sequentially using recursive helper
      const totalBatches = Math.ceil(invites.length / BATCH_SIZE)
      const processAllBatches = async (
        currentBatch: number
      ): Promise<
        Array<{ success: boolean; email: string; error?: string }>
      > => {
        if (currentBatch >= totalBatches) {
          return []
        }

        const batchResults = await processBatch(currentBatch)

        // Wait before next batch (except for the last batch)
        if (currentBatch < totalBatches - 1) {
          await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS))
        }

        const remainingResults = await processAllBatches(currentBatch + 1)
        return [...batchResults, ...remainingResults]
      }

      const allResults = await processAllBatches(0)
      results.push(...allResults)

      setProgress((prev) => ({ ...prev, isProcessing: false }))
      return results
    },
    onSuccess: (results) => {
      const successCount = results.filter((r) => r.success).length
      const failCount = results.length - successCount

      setProgress({ sent: 0, total: 0, isProcessing: false })

      queryClient.invalidateQueries({
        queryKey: ['organization-members', organizationId]
      })
      queryClient.invalidateQueries({
        queryKey: ['organization-invitations', organizationId]
      })

      if (failCount === 0) {
        toast.success(
          `Successfully sent ${successCount} invitation${successCount > 1 ? 's' : ''}`
        )
        setOpen(false)
        setBulkText('')
        setIsBulkMode(false)
        form.reset()
      } else {
        toast.warning(
          `Sent ${successCount} invitation${successCount > 1 ? 's' : ''}, ${failCount} failed`
        )
      }
    },
    onError: (error: Error) => {
      setProgress({ sent: 0, total: 0, isProcessing: false })
      toast.error(error.message || 'Failed to send bulk invitations')
    }
  })

  const handleClose = () => {
    if (progress.isProcessing) {
      toast.warning('Please wait for invitations to finish processing')
      return
    }
    setOpen(false)
    setIsBulkMode(false)
    setBulkText('')
    setProgress({ sent: 0, total: 0, isProcessing: false })
    form.reset()
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="flex max-h-[calc(100vh-4rem)] max-w-2xl flex-col overflow-hidden p-0">
        <DialogHeader className="sticky top-0 z-10 border-b bg-background px-6 pt-6 pb-4">
          <DialogTitle>Invite Member{isBulkMode ? 's' : ''}</DialogTitle>
          <DialogDescription>
            {isBulkMode
              ? 'Paste your Excel data with email and role columns. Copy all rows from Excel and paste here.'
              : 'Send an invitation to join this organization. The user will receive an email with instructions.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {/* Toggle between individual and bulk */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="bulk-mode">Bulk Invite Mode</Label>
              <p className="text-muted-foreground text-sm">
                {isBulkMode
                  ? 'Paste multiple emails and roles from Excel'
                  : 'Invite one member at a time'}
              </p>
            </div>
            <Switch
              checked={isBulkMode}
              id="bulk-mode"
              onCheckedChange={setIsBulkMode}
            />
          </div>

          {isBulkMode ? (
            <div className="space-y-4">
              {/* Instructions */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
                <h4 className="mb-2 font-semibold text-sm">
                  Excel Format Instructions:
                </h4>
                <ul className="list-inside list-disc space-y-1 text-sm">
                  <li>Your Excel sheet should have exactly 2 columns</li>
                  <li>
                    Column 1: <strong>Email</strong> (e.g., user@example.com)
                  </li>
                  <li>
                    Column 2: <strong>Role</strong> (e.g., member,
                    vice-president, president)
                  </li>
                  <li>
                    Select all rows (excluding header) and copy (Ctrl+C / Cmd+C)
                  </li>
                  <li>Paste into the text area below</li>
                </ul>
                <div className="mt-3 rounded border bg-white p-2 text-xs dark:bg-gray-900">
                  <div className="font-mono">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-semibold">Email</div>
                      <div className="font-semibold">Role</div>
                      <div>john@example.com</div>
                      <div>member</div>
                      <div>jane@example.com</div>
                      <div>vice-president</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bulk textarea */}
              <div className="space-y-2">
                <Label htmlFor="bulk-text">Paste Excel Data</Label>
                <Textarea
                  id="bulk-text"
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder="Paste your Excel data here (email and role columns)..."
                  rows={10}
                  value={bulkText}
                />
                {bulkText && (
                  <div className="text-muted-foreground text-xs">
                    {parsedInvites.length} row
                    {parsedInvites.length !== 1 ? 's' : ''} detected •{' '}
                    {validInvites.length} valid •{' '}
                    {parsedInvites.length - validInvites.length} invalid
                  </div>
                )}
              </div>

              {/* Preview */}
              {parsedInvites.length > 0 && (
                <div className="space-y-2">
                  <Label>Preview ({validInvites.length} valid)</Label>
                  <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border p-4">
                    {parsedInvites.map((invite) => (
                      <div
                        className="flex items-start justify-between gap-2 rounded border p-2"
                        key={`${invite.email}-${invite.role}`}
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            {invite.isValid ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span className="font-medium">{invite.email}</span>
                            {invite.isValid && (
                              <Badge className="text-xs" variant="secondary">
                                {invite.role}
                              </Badge>
                            )}
                          </div>
                          {invite.error && (
                            <p className="text-destructive text-xs">
                              {invite.error}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
              }}
            >
              <div className="space-y-4">
                <form.AppField
                  children={(field) => (
                    <field.Text
                      label="Email Address"
                      placeholder="user@example.com"
                      type="email"
                    />
                  )}
                  name="email"
                />

                <form.AppField
                  children={(field) => (
                    <field.Select
                      label="Role"
                      options={[
                        { label: 'Member', value: 'member' },
                        { label: 'Vice President', value: 'vice-president' },
                        { label: 'President', value: 'president' }
                      ]}
                      placeholder="Select a role"
                    />
                  )}
                  name="role"
                />
              </div>
            </form>
          )}

          {/* Progress indicator for bulk invites */}
          {progress.isProcessing && (
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
                  <span className="font-medium">Processing invitations...</span>
                </div>
                <span className="text-muted-foreground">
                  {progress.sent} / {progress.total}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{
                    width: `${(progress.sent / progress.total) * 100}%`
                  }}
                />
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
                <p className="text-amber-900 text-sm dark:text-amber-100">
                  <strong>Please don't close this window</strong> while
                  invitations are being sent. This may take a few minutes for
                  large batches.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="sticky bottom-0 border-t bg-background px-6 py-4">
          <Button
            disabled={
              form.state.isSubmitting ||
              bulkInviteMutation.isPending ||
              progress.isProcessing ||
              (isBulkMode && validInvites.length === 0)
            }
            onClick={handleClose}
            type="button"
            variant="outline"
          >
            {progress.isProcessing ? 'Processing...' : 'Cancel'}
          </Button>
          <Button
            disabled={
              form.state.isSubmitting ||
              bulkInviteMutation.isPending ||
              progress.isProcessing ||
              (isBulkMode && validInvites.length === 0)
            }
            onClick={() => {
              if (isBulkMode) {
                if (validInvites.length === 0) {
                  toast.error('No valid invites to send')
                  return
                }
                bulkInviteMutation.mutate(validInvites)
              } else {
                form.handleSubmit()
              }
            }}
            type="button"
          >
            {(() => {
              const isSubmitting =
                form.state.isSubmitting ||
                bulkInviteMutation.isPending ||
                progress.isProcessing
              if (isSubmitting) {
                if (progress.isProcessing) {
                  return `Sending... (${progress.sent}/${progress.total})`
                }
                return isBulkMode
                  ? `Sending ${validInvites.length} invitation${validInvites.length > 1 ? 's' : ''}...`
                  : 'Sending...'
              }
              return isBulkMode
                ? `Send ${validInvites.length} Invitation${validInvites.length > 1 ? 's' : ''}`
                : 'Send Invitation'
            })()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

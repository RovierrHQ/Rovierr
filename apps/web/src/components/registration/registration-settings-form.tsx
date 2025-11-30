'use client'

import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import { Input } from '@rov/ui/components/input'
import { Label } from '@rov/ui/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@rov/ui/components/select'
import { Switch } from '@rov/ui/components/switch'
import { Textarea } from '@rov/ui/components/textarea'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ExternalLink, Loader2, Plus, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { orpc } from '@/utils/orpc'

interface RegistrationSettings {
  id: string
  societyId: string
  isEnabled: boolean
  approvalMode: 'auto' | 'manual'
  formId?: string | null
  maxCapacity?: number | null
  startDate?: string | null
  endDate?: string | null
  welcomeMessage?: string | null
  isPaused: boolean
}

interface RegistrationSettingsFormProps {
  societyId: string
  settings?: RegistrationSettings | null
}

export const RegistrationSettingsForm = ({
  societyId,
  settings
}: RegistrationSettingsFormProps) => {
  const queryClient = useQueryClient()
  const router = useRouter()

  // Form state
  const [isEnabled, setIsEnabled] = useState(settings?.isEnabled ?? false)
  const [approvalMode, setApprovalMode] = useState<'auto' | 'manual'>(
    settings?.approvalMode ?? 'manual'
  )
  const [formId, setFormId] = useState(settings?.formId ?? '')
  const [maxCapacity, setMaxCapacity] = useState(
    settings?.maxCapacity?.toString() ?? ''
  )
  const [startDate, setStartDate] = useState(
    settings?.startDate
      ? new Date(settings.startDate).toISOString().slice(0, 16)
      : ''
  )
  const [endDate, setEndDate] = useState(
    settings?.endDate
      ? new Date(settings.endDate).toISOString().slice(0, 16)
      : ''
  )
  const [welcomeMessage, setWelcomeMessage] = useState(
    settings?.welcomeMessage ?? ''
  )
  const [isPaused, setIsPaused] = useState(settings?.isPaused ?? false)

  // Update form when settings change
  useEffect(() => {
    if (settings) {
      setIsEnabled(settings.isEnabled ?? false)
      setApprovalMode(settings.approvalMode ?? 'manual')
      setFormId(settings.formId ?? '')
      setMaxCapacity(settings.maxCapacity?.toString() ?? '')
      setStartDate(
        settings.startDate
          ? new Date(settings.startDate).toISOString().slice(0, 16)
          : ''
      )
      setEndDate(
        settings.endDate
          ? new Date(settings.endDate).toISOString().slice(0, 16)
          : ''
      )
      setWelcomeMessage(settings.welcomeMessage ?? '')
      setIsPaused(settings.isPaused ?? false)
    }
  }, [settings])

  // Fetch available forms for this society
  const { data: formsData, isLoading: isLoadingForms } = useQuery(
    orpc.form.list.queryOptions({
      input: {
        entityType: 'society',
        entityId: societyId,
        status: 'published',
        limit: 100,
        offset: 0
      }
    })
  )

  // Create settings mutation
  const createMutation = useMutation(
    orpc.societyRegistration.settings.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['societyRegistration', 'settings']
        })
        toast.success('Registration settings created successfully!')
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to create settings')
      }
    })
  )

  // Update settings mutation
  const updateMutation = useMutation(
    orpc.societyRegistration.settings.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['societyRegistration', 'settings']
        })
        toast.success('Settings updated successfully!')
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to update settings')
      }
    })
  )

  const handleSave = () => {
    const data = {
      societyId,
      isEnabled,
      approvalMode,
      formId: formId || undefined,
      maxCapacity: maxCapacity ? Number.parseInt(maxCapacity, 10) : undefined,
      startDate: startDate ? new Date(startDate).toISOString() : undefined,
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
      welcomeMessage: welcomeMessage || undefined,
      isPaused
    }

    if (settings) {
      updateMutation.mutate({
        id: settings.id,
        ...data
      })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleCreateForm = () => {
    // Navigate to form builder
    router.push(`/spaces/societies/mine/${societyId}/forms/create`)
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      {/* Basic Settings */}
      <Card className="p-6">
        <h2 className="mb-4 font-semibold text-lg">Basic Settings</h2>
        <div className="space-y-4">
          {/* Enable Registration */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">Enable Registration</Label>
              <p className="text-muted-foreground text-sm">
                Allow new members to register for your society
              </p>
            </div>
            <Switch
              checked={isEnabled}
              id="enabled"
              onCheckedChange={setIsEnabled}
            />
          </div>

          {/* Approval Mode */}
          <div className="space-y-2">
            <Label htmlFor="approvalMode">Approval Mode</Label>
            <Select
              onValueChange={(value) =>
                setApprovalMode(value as 'auto' | 'manual')
              }
              value={approvalMode}
            >
              <SelectTrigger id="approvalMode">
                <SelectValue placeholder="Select approval mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual Review</SelectItem>
                <SelectItem value="auto">Auto-Approve</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-sm">
              {approvalMode === 'auto'
                ? 'New members will be automatically approved'
                : 'You will review and approve each application'}
            </p>
          </div>

          {/* Pause Registration */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="paused">Pause Registration</Label>
              <p className="text-muted-foreground text-sm">
                Temporarily stop accepting new registrations
              </p>
            </div>
            <Switch
              checked={isPaused}
              id="paused"
              onCheckedChange={setIsPaused}
            />
          </div>
        </div>
      </Card>

      {/* Capacity Settings */}
      <Card className="p-6">
        <h2 className="mb-4 font-semibold text-lg">Capacity Settings</h2>
        <div className="space-y-2">
          <Label htmlFor="maxCapacity">Maximum Capacity (Optional)</Label>
          <Input
            id="maxCapacity"
            min="1"
            onChange={(e) => setMaxCapacity(e.target.value)}
            placeholder="Leave empty for unlimited"
            type="number"
            value={maxCapacity}
          />
          <p className="text-muted-foreground text-sm">
            Registration will automatically close when capacity is reached
          </p>
        </div>
      </Card>

      {/* Registration Period */}
      <Card className="p-6">
        <h2 className="mb-4 font-semibold text-lg">Registration Period</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date (Optional)</Label>
            <Input
              id="startDate"
              onChange={(e) => setStartDate(e.target.value)}
              type="datetime-local"
              value={startDate}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date (Optional)</Label>
            <Input
              id="endDate"
              onChange={(e) => setEndDate(e.target.value)}
              type="datetime-local"
              value={endDate}
            />
          </div>
        </div>
        <p className="mt-2 text-muted-foreground text-sm">
          Registration will only be open during this period
        </p>
      </Card>

      {/* Customization */}
      <Card className="p-6">
        <h2 className="mb-4 font-semibold text-lg">Customization</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="welcomeMessage">Welcome Message (Optional)</Label>
            <Textarea
              id="welcomeMessage"
              onChange={(e) => setWelcomeMessage(e.target.value)}
              placeholder="Welcome to our society! We're excited to have you join us..."
              rows={4}
              value={welcomeMessage}
            />
            <p className="text-muted-foreground text-sm">
              This message will be displayed on your registration page
            </p>
          </div>
        </div>
      </Card>

      {/* Form Selection */}
      <Card className="p-6">
        <h2 className="mb-4 font-semibold text-lg">Registration Form</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="formId">Select Form (Optional)</Label>
            <Select
              disabled={isLoadingForms}
              onValueChange={(value) =>
                setFormId(value === 'none' ? '' : value)
              }
              value={formId || 'none'}
            >
              <SelectTrigger id="formId">
                <SelectValue placeholder="No form selected" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No form</SelectItem>
                {formsData?.forms?.map((form) => (
                  <SelectItem key={form.id} value={form.id}>
                    {form.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-sm">
              Select a form to collect additional information from applicants
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCreateForm} type="button" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Create New Form
            </Button>

            {formId && formId !== 'none' && (
              <Button
                onClick={() =>
                  router.push(
                    `/spaces/societies/mine/${societyId}/forms/${formId}`
                  )
                }
                type="button"
                variant="ghost"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Form
              </Button>
            )}
          </div>

          {formsData?.forms && formsData.forms.length === 0 && (
            <p className="text-muted-foreground text-sm italic">
              No forms available. Create a form to collect custom information
              from applicants.
            </p>
          )}
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button disabled={isSaving} onClick={handleSave} size="lg">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

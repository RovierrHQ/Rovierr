'use client'

import { Button } from '@rov/ui/components/button'
import { Checkbox } from '@rov/ui/components/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@rov/ui/components/dialog'
import { Input } from '@rov/ui/components/input'
import { Label } from '@rov/ui/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@rov/ui/components/select'
import { Textarea } from '@rov/ui/components/textarea'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import { orpc } from '@/utils/orpc'
import { AssigneeSelector } from './assignee-selector'
import type { TaskPriority } from './types'

interface CreateTaskDialogProps {
  open: boolean
  organizationId: string
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateTaskDialog({
  open,
  organizationId,
  onOpenChange,
  onSuccess
}: CreateTaskDialogProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [isAllDay, setIsAllDay] = useState(false)
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [selectedAssignees, setSelectedAssignees] = useState<Set<string>>(
    new Set()
  )

  // Fetch organization members (filtered to exclude 'member' role)
  const { data: membersData, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['organization-members', organizationId],
    queryFn: async () => {
      const result = await authClient.organization.listMembers({
        query: {
          limit: 1000,
          offset: 0,
          organizationId
        }
      })
      return result
    },
    enabled: !!organizationId && open
  })

  // Extract and filter members (exclude 'member' role)
  const availableAssignees = useMemo(() => {
    if (!membersData?.data) return []
    const members = membersData.data.members || []
    return members.filter((member: { role?: string | string[] }) => {
      const role = Array.isArray(member.role) ? member.role[0] : member.role
      return role && role !== 'member'
    })
  }, [membersData])

  const createTaskMutation = useMutation(
    orpc.tasks.createTask.mutationOptions({
      onSuccess: () => {
        toast.success('Task created successfully')
        handleClose()
        onSuccess()
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to create task')
      }
    })
  )

  const handleClose = () => {
    setIsAllDay(false)
    setPriority('medium')
    setSelectedAssignees(new Set())
    onOpenChange(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const title = formData.get('title') as string
    const description = (formData.get('description') as string) || undefined
    const dueAt = formData.get('dueAt') as string
    const startAt = formData.get('startAt') as string

    if (!title) {
      toast.error('Please fill in the task title')
      return
    }

    try {
      await createTaskMutation.mutateAsync({
        title,
        description,
        contextType: 'club',
        contextId: organizationId,
        priority,
        visibility: 'club',
        dueAt: dueAt || undefined,
        startAt: startAt || undefined,
        isAllDay,
        assigneeIds:
          selectedAssignees.size > 0 ? Array.from(selectedAssignees) : undefined
      })
      // Reset form if it still exists (before dialog closes)
      if (form) {
        form.reset()
      }
    } catch {
      // Error is handled by mutation onError callback
    }
  }

  return (
    <Dialog onOpenChange={handleClose} open={open}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>Add a new task for the club</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit} ref={formRef}>
          <div className="space-y-2">
            <Label htmlFor="create-title">Title *</Label>
            <Input
              id="create-title"
              name="title"
              placeholder="Task title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-description">Description</Label>
            <Textarea
              id="create-description"
              name="description"
              placeholder="Task description"
              rows={4}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="create-priority">Priority</Label>
              <Select
                onValueChange={(value) => setPriority(value as TaskPriority)}
                value={priority}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-dueAt">Due Date</Label>
              <Input id="create-dueAt" name="dueAt" type="datetime-local" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-startAt">Start Date (optional)</Label>
            <Input id="create-startAt" name="startAt" type="datetime-local" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isAllDay}
              id="create-isAllDay"
              onCheckedChange={(checked) => setIsAllDay(checked === true)}
            />
            <Label
              className="cursor-pointer font-normal text-sm"
              htmlFor="create-isAllDay"
            >
              All-day task
            </Label>
          </div>
          <AssigneeSelector
            availableAssignees={availableAssignees}
            isLoading={isLoadingMembers}
            onSelectionChange={setSelectedAssignees}
            organizationId={organizationId}
            selectedAssignees={selectedAssignees}
          />
          <DialogFooter>
            <Button onClick={handleClose} type="button" variant="outline">
              Cancel
            </Button>
            <Button disabled={createTaskMutation.isPending} type="submit">
              {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import { Checkbox } from '@rov/ui/components/checkbox'
import { Input } from '@rov/ui/components/input'
import { Label } from '@rov/ui/components/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@rov/ui/components/popover'
import { Search, UserPlus, X } from 'lucide-react'
import { useMemo, useState } from 'react'

interface Member {
  userId?: string
  user?: {
    id?: string
    name?: string
    email?: string
  }
  role?: string | string[]
}

interface AssigneeSelectorProps {
  organizationId: string
  availableAssignees: Member[]
  isLoading: boolean
  selectedAssignees: Set<string>
  onSelectionChange: (assignees: Set<string>) => void
}

export function AssigneeSelector({
  availableAssignees,
  isLoading,
  selectedAssignees,
  onSelectionChange
}: AssigneeSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [popoverOpen, setPopoverOpen] = useState(false)

  const filteredAssignees = useMemo(() => {
    if (!searchQuery) return availableAssignees
    const query = searchQuery.toLowerCase()
    return availableAssignees.filter((member: Member) => {
      const name = member.user?.name?.toLowerCase() ?? ''
      const email = member.user?.email?.toLowerCase() ?? ''
      return name.includes(query) || email.includes(query)
    })
  }, [availableAssignees, searchQuery])

  const toggleAssignee = (userId: string, checked: boolean) => {
    const newSelection = new Set(selectedAssignees)
    if (checked) {
      newSelection.add(userId)
    } else {
      newSelection.delete(userId)
    }
    onSelectionChange(newSelection)
  }

  const removeAssignee = (userId: string) => {
    const newSelection = new Set(selectedAssignees)
    newSelection.delete(userId)
    onSelectionChange(newSelection)
  }

  return (
    <div className="space-y-2">
      <Label>Assignees</Label>
      <Popover onOpenChange={setPopoverOpen} open={popoverOpen}>
        <PopoverTrigger asChild>
          <Button
            className="w-full justify-start"
            type="button"
            variant="outline"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {selectedAssignees.size > 0
              ? `${selectedAssignees.size} assignee${
                  selectedAssignees.size === 1 ? '' : 's'
                } selected`
              : 'Select assignees (optional)'}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[300px] p-0">
          <div className="space-y-2 p-3">
            <div className="relative">
              <Search className="-translate-y-1/2 absolute top-1/2 left-2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search members..."
                value={searchQuery}
              />
            </div>
            {isLoading && (
              <div className="py-4 text-center text-muted-foreground text-sm">
                Loading members...
              </div>
            )}
            {!isLoading && filteredAssignees.length === 0 && (
              <div className="py-4 text-center text-muted-foreground text-sm">
                {searchQuery
                  ? 'No members found'
                  : 'No assignable members available'}
              </div>
            )}
            {!isLoading && filteredAssignees.length > 0 && (
              <div className="max-h-[300px] overflow-y-auto">
                {filteredAssignees.map((member: Member) => {
                  const userId = member.userId ?? member.user?.id ?? ''
                  const displayName =
                    member.user?.name ?? member.user?.email ?? 'Unknown User'
                  const role = Array.isArray(member.role)
                    ? member.role[0]
                    : member.role
                  const isSelected = selectedAssignees.has(userId)

                  return (
                    <div
                      className="flex items-center gap-2 rounded-sm p-2 hover:bg-accent"
                      key={userId}
                    >
                      <Checkbox
                        checked={isSelected}
                        id={`assignee-${userId}`}
                        onCheckedChange={(checked) =>
                          toggleAssignee(userId, checked === true)
                        }
                      />
                      <Label
                        className="flex-1 cursor-pointer text-sm"
                        htmlFor={`assignee-${userId}`}
                      >
                        <div className="font-medium">{displayName}</div>
                        {role && (
                          <div className="text-muted-foreground text-xs">
                            {role}
                          </div>
                        )}
                      </Label>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      {selectedAssignees.size > 0 && (
        <div className="flex flex-wrap gap-2">
          {Array.from(selectedAssignees).map((userId) => {
            const selectedMember = availableAssignees.find(
              (m: Member) => (m.userId ?? m.user?.id) === userId
            )
            const displayName =
              selectedMember?.user?.name ??
              selectedMember?.user?.email ??
              userId

            return (
              <Badge className="gap-1 pr-1" key={userId} variant="secondary">
                {displayName}
                <button
                  className="ml-1 rounded-full hover:bg-muted"
                  onClick={() => removeAssignee(userId)}
                  type="button"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}

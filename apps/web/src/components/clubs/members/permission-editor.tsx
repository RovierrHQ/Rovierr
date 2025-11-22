'use client'

import { statement } from '@rov/auth'
import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'
import { Checkbox } from '@rov/ui/components/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@rov/ui/components/collapsible'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'

interface PermissionEditorProps {
  permissions: Record<string, string[]>
  onChange: (permissions: Record<string, string[]>) => void
  initialPermissions?: Record<string, string[]>
}

// Use the statement from permissions.ts to ensure we only show valid permissions
// Convert readonly arrays to mutable arrays for compatibility
const defaultResources: Record<string, string[]> = Object.fromEntries(
  Object.entries(statement).map(([key, value]) => [key, [...value]])
) as Record<string, string[]>

export function PermissionEditor({
  permissions,
  onChange,
  initialPermissions
}: PermissionEditorProps) {
  const [localPermissions, setLocalPermissions] = useState<
    Record<string, string[]>
  >(initialPermissions ?? permissions)
  const [expandedResources, setExpandedResources] = useState<Set<string>>(
    new Set()
  )

  useEffect(() => {
    if (initialPermissions) {
      setLocalPermissions(initialPermissions)
    }
  }, [initialPermissions])

  const togglePermission = (
    resource: string,
    action: string,
    checked: boolean
  ) => {
    const newPermissions = { ...localPermissions }
    if (!newPermissions[resource]) {
      newPermissions[resource] = []
    }

    if (checked) {
      if (!newPermissions[resource].includes(action)) {
        newPermissions[resource] = [...newPermissions[resource], action]
      }
    } else {
      newPermissions[resource] = newPermissions[resource].filter(
        (a) => a !== action
      )
    }

    // Remove resource if no permissions
    if (newPermissions[resource].length === 0) {
      delete newPermissions[resource]
    }

    setLocalPermissions(newPermissions)
    onChange(newPermissions)
  }

  const toggleResource = (resource: string) => {
    const newExpanded = new Set(expandedResources)
    if (newExpanded.has(resource)) {
      newExpanded.delete(resource)
    } else {
      newExpanded.add(resource)
    }
    setExpandedResources(newExpanded)
  }

  const selectAllInResource = (resource: string) => {
    const actions = defaultResources[resource] ?? []
    const newPermissions = { ...localPermissions }
    newPermissions[resource] = [...actions]
    setLocalPermissions(newPermissions)
    onChange(newPermissions)
  }

  const deselectAllInResource = (resource: string) => {
    const newPermissions = { ...localPermissions }
    delete newPermissions[resource]
    setLocalPermissions(newPermissions)
    onChange(newPermissions)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Select Permissions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Object.entries(defaultResources).map(([resource, actions]) => {
            const resourcePermissions = localPermissions[resource] ?? []
            const allSelected =
              resourcePermissions.length === actions.length &&
              actions.every((action) => resourcePermissions.includes(action))
            const someSelected = resourcePermissions.length > 0 && !allSelected
            const isExpanded = expandedResources.has(resource)

            return (
              <Collapsible
                key={resource}
                onOpenChange={() => toggleResource(resource)}
                open={isExpanded}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50">
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <span className="font-medium capitalize">{resource}</span>
                      {someSelected && (
                        <Badge className="text-xs" variant="secondary">
                          {resourcePermissions.length}/{actions.length}
                        </Badge>
                      )}
                      {allSelected && (
                        <Badge className="text-xs" variant="default">
                          All
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {allSelected ? (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            deselectAllInResource(resource)
                          }}
                          size="sm"
                          variant="ghost"
                        >
                          Deselect All
                        </Button>
                      ) : (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            selectAllInResource(resource)
                          }}
                          size="sm"
                          variant="ghost"
                        >
                          Select All
                        </Button>
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-2 border-muted border-l-2 pt-2 pl-4">
                    {actions.map((action) => {
                      const isChecked = resourcePermissions.includes(action)
                      return (
                        <div className="flex items-center gap-2" key={action}>
                          <Checkbox
                            checked={isChecked}
                            id={`${resource}-${action}`}
                            onCheckedChange={(checked) =>
                              togglePermission(
                                resource,
                                action,
                                checked === true
                              )
                            }
                          />
                          <label
                            className="flex-1 cursor-pointer font-normal text-sm"
                            htmlFor={`${resource}-${action}`}
                          >
                            {action.charAt(0).toUpperCase() + action.slice(1)}
                          </label>
                        </div>
                      )
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </div>

        {Object.keys(localPermissions).length === 0 && (
          <div className="mt-4 rounded-lg border border-dashed p-4 text-center">
            <p className="text-muted-foreground text-sm">
              No permissions selected. Select permissions above to grant access.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

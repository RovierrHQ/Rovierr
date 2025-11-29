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
import { Separator } from '@rov/ui/components/separator'
import { Switch } from '@rov/ui/components/switch'
import { Textarea } from '@rov/ui/components/textarea'
import { GitBranch, X } from 'lucide-react'
import type { Page, Question } from './form-builder'

interface PageSettingsProps {
  page: Page
  allPages: Page[]
  allQuestions: Question[]
  onUpdate: (updates: Partial<Page>) => void
  onClose: () => void
}

export function PageSettings({
  page,
  allPages,
  allQuestions,
  onUpdate,
  onClose
}: PageSettingsProps) {
  const toggleConditionalLogic = (enabled: boolean) => {
    if (enabled) {
      onUpdate({
        conditionalLogicEnabled: true,
        condition: 'equals'
      })
    } else {
      onUpdate({
        conditionalLogicEnabled: false,
        sourceQuestionId: undefined,
        condition: undefined,
        conditionValue: undefined
      })
    }
  }

  const updateConditionalLogic = (updates: {
    sourceQuestionId?: string
    condition?: 'equals' | 'not_equals' | 'contains' | 'not_contains'
    conditionValue?: string
  }) => {
    onUpdate({
      conditionalLogicEnabled: true,
      ...updates
    })
  }

  const currentPageIndex = allPages.findIndex((p) => p.id === page.id)

  // Get all questions from previous pages
  const availableSourceQuestions = allQuestions.filter((q) => {
    const questionPageIndex = allPages.findIndex((p) => p.id === q.pageId)
    return (
      questionPageIndex < currentPageIndex &&
      [
        'multiple-choice',
        'checkboxes',
        'dropdown',
        'short-text',
        'email'
      ].includes(q.type)
    )
  })

  const sourceQuestion = allQuestions.find(
    (q) => q.id === page.sourceQuestionId
  )

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Page Settings</h3>
        <Button onClick={onClose} size="icon" variant="ghost">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="page-title">Page Title</Label>
          <Input
            id="page-title"
            onChange={(e) => onUpdate({ title: e.target.value })}
            value={page.title}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="page-description">Page Description (Optional)</Label>
          <Textarea
            id="page-description"
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Add a description for this page"
            rows={3}
            value={page.description || ''}
          />
        </div>

        {currentPageIndex > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    <Label>Conditional Page</Label>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Show this page based on previous answers
                  </p>
                </div>
                <Switch
                  checked={page.conditionalLogicEnabled}
                  disabled={availableSourceQuestions.length === 0}
                  onCheckedChange={toggleConditionalLogic}
                />
              </div>

              {page.conditionalLogicEnabled && (
                <div className="space-y-3 rounded-lg bg-muted/50 p-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Show this page when</Label>
                    <Select
                      onValueChange={(value) =>
                        updateConditionalLogic({ sourceQuestionId: value })
                      }
                      value={page.sourceQuestionId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a question" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSourceQuestions.map((q) => (
                          <SelectItem key={q.id} value={q.id}>
                            {q.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {page.sourceQuestionId && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-xs">Condition</Label>
                        <Select
                          onValueChange={(value) =>
                            updateConditionalLogic({
                              condition: value as
                                | 'equals'
                                | 'not_equals'
                                | 'contains'
                                | 'not_contains'
                            })
                          }
                          value={page.condition}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">equals</SelectItem>
                            <SelectItem value="not_equals">
                              does not equal
                            </SelectItem>
                            {sourceQuestion?.type === 'short-text' && (
                              <>
                                <SelectItem value="contains">
                                  contains
                                </SelectItem>
                                <SelectItem value="not_contains">
                                  does not contain
                                </SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Value</Label>
                        {sourceQuestion &&
                        ['multiple-choice', 'dropdown'].includes(
                          sourceQuestion.type
                        ) ? (
                          <Select
                            onValueChange={(value) =>
                              updateConditionalLogic({ conditionValue: value })
                            }
                            value={page.conditionValue}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                            <SelectContent>
                              {sourceQuestion.options?.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            onChange={(e) =>
                              updateConditionalLogic({
                                conditionValue: e.target.value
                              })
                            }
                            placeholder="Enter value"
                            value={page.conditionValue || ''}
                          />
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {availableSourceQuestions.length === 0 && (
                <p className="text-muted-foreground text-xs">
                  Add questions with options on previous pages to enable
                  conditional logic
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </Card>
  )
}

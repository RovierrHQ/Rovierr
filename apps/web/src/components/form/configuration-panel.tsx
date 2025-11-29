'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@rov/ui/components/accordion'
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
import { GitBranch, Plus, ShieldCheck, Trash2, X } from 'lucide-react'
import type { Question } from './form-builder'

interface ConfigurationPanelProps {
  question: Question
  allQuestions: Question[]
  onUpdate: (updates: Partial<Question>) => void
  onClose: () => void
}

export function ConfigurationPanel({
  question,
  allQuestions,
  onUpdate,
  onClose
}: ConfigurationPanelProps) {
  const hasOptions = ['multiple-choice', 'checkboxes', 'dropdown'].includes(
    question.type
  )

  const addOption = () => {
    const newOptions = [
      ...(question.options || []),
      `Option ${(question.options?.length || 0) + 1}`
    ]
    onUpdate({ options: newOptions })
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(question.options || [])]
    newOptions[index] = value
    onUpdate({ options: newOptions })
  }

  const deleteOption = (index: number) => {
    const newOptions = question.options?.filter((_, i) => i !== index)
    onUpdate({ options: newOptions })
  }

  const updateValidationRule = (
    updates: Partial<Question['validationRules']>
  ) => {
    onUpdate({
      validationRules: {
        ...question.validationRules,
        ...updates
      }
    })
  }

  return (
    <Card className="max-h-full space-y-6 overflow-y-auto p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Question Settings</h3>
        <Button onClick={onClose} size="icon" variant="ghost">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="question-title">Question Title</Label>
          <Input
            id="question-title"
            onChange={(e) => onUpdate({ title: e.target.value })}
            value={question.title}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="question-description">Description (Optional)</Label>
          <Textarea
            id="question-description"
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Add a description to help users understand this question"
            rows={3}
            value={question.description || ''}
          />
        </div>

        {(question.type === 'short-text' ||
          question.type === 'long-text' ||
          question.type === 'email' ||
          question.type === 'phone' ||
          question.type === 'number') && (
          <div className="space-y-2">
            <Label htmlFor="placeholder">Placeholder Text</Label>
            <Input
              id="placeholder"
              onChange={(e) => onUpdate({ placeholder: e.target.value })}
              placeholder="e.g., Enter your answer here"
              value={question.placeholder || ''}
            />
          </div>
        )}

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Required Question</Label>
            <p className="text-muted-foreground text-xs">
              Users must answer this question
            </p>
          </div>
          <Switch
            checked={question.required}
            onCheckedChange={(checked) => onUpdate({ required: checked })}
          />
        </div>

        {hasOptions && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Options</Label>
                <Button onClick={addOption} size="sm" variant="outline">
                  <Plus className="mr-1 h-3 w-3" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {question.options?.map((option, index) => (
                  <div
                    className="flex items-center gap-2"
                    // biome-ignore lint/suspicious/noArrayIndexKey: Index is needed for option management
                    key={`${option}-${index}`}
                  >
                    <Input
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      value={option}
                    />
                    <Button
                      disabled={(question.options?.length || 0) <= 1}
                      onClick={() => deleteOption(index)}
                      size="icon"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator />
        <Accordion className="w-full" collapsible type="single">
          <AccordionItem value="validation">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                <span>Validation Rules</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              {(question.type === 'short-text' ||
                question.type === 'long-text') && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Min Length</Label>
                      <Input
                        onChange={(e) =>
                          updateValidationRule({
                            minLength:
                              Number.parseInt(e.target.value, 10) || undefined
                          })
                        }
                        placeholder="0"
                        type="number"
                        value={question.validationRules?.minLength || ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Max Length</Label>
                      <Input
                        onChange={(e) =>
                          updateValidationRule({
                            maxLength:
                              Number.parseInt(e.target.value, 10) || undefined
                          })
                        }
                        placeholder="∞"
                        type="number"
                        value={question.validationRules?.maxLength || ''}
                      />
                    </div>
                  </div>
                  {question.type === 'short-text' && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-xs">Pattern (RegEx)</Label>
                        <Input
                          onChange={(e) =>
                            updateValidationRule({ pattern: e.target.value })
                          }
                          placeholder="e.g., ^[A-Z].*"
                          value={question.validationRules?.pattern || ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Pattern Error Message</Label>
                        <Input
                          onChange={(e) =>
                            updateValidationRule({
                              patternMessage: e.target.value
                            })
                          }
                          placeholder="Custom error message"
                          value={question.validationRules?.patternMessage || ''}
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              {question.type === 'number' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Minimum Value</Label>
                    <Input
                      onChange={(e) =>
                        updateValidationRule({
                          min: Number.parseFloat(e.target.value) || undefined
                        })
                      }
                      placeholder="-∞"
                      type="number"
                      value={question.validationRules?.min ?? ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Maximum Value</Label>
                    <Input
                      onChange={(e) =>
                        updateValidationRule({
                          max: Number.parseFloat(e.target.value) || undefined
                        })
                      }
                      placeholder="∞"
                      type="number"
                      value={question.validationRules?.max ?? ''}
                    />
                  </div>
                </div>
              )}

              {question.type === 'checkboxes' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Min Selections</Label>
                    <Input
                      onChange={(e) =>
                        updateValidationRule({
                          minSelect:
                            Number.parseInt(e.target.value, 10) || undefined
                        })
                      }
                      placeholder="0"
                      type="number"
                      value={question.validationRules?.minSelect || ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Max Selections</Label>
                    <Input
                      onChange={(e) =>
                        updateValidationRule({
                          maxSelect:
                            Number.parseInt(e.target.value, 10) || undefined
                        })
                      }
                      placeholder="∞"
                      type="number"
                      value={question.validationRules?.maxSelect || ''}
                    />
                  </div>
                </div>
              )}

              {!['short-text', 'long-text', 'number', 'checkboxes'].includes(
                question.type
              ) && (
                <p className="text-muted-foreground text-xs">
                  No additional validation rules for this question type
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Separator />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                <Label>Conditional Logic</Label>
              </div>
              <p className="text-muted-foreground text-xs">
                Show this question based on previous answers
              </p>
            </div>
            <Switch
              checked={question.conditionalLogicEnabled}
              disabled={
                allQuestions.filter((q) => {
                  const currentIndex = allQuestions.findIndex(
                    (quest) => quest.id === question.id
                  )
                  const qIndex = allQuestions.findIndex(
                    (quest) => quest.id === q.id
                  )
                  return (
                    qIndex < currentIndex &&
                    [
                      'multiple-choice',
                      'checkboxes',
                      'dropdown',
                      'short-text',
                      'email'
                    ].includes(q.type)
                  )
                }).length === 0
              }
              onCheckedChange={(enabled) => {
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
              }}
            />
          </div>

          {question.conditionalLogicEnabled && (
            <div className="space-y-3 rounded-lg bg-muted/50 p-3">
              <div className="space-y-2">
                <Label className="text-xs">Show this question when</Label>
                <Select
                  onValueChange={(value) =>
                    onUpdate({
                      conditionalLogicEnabled: true,
                      sourceQuestionId: value
                    })
                  }
                  value={question.sourceQuestionId ?? undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a question" />
                  </SelectTrigger>
                  <SelectContent>
                    {allQuestions
                      .filter((q) => {
                        const currentIndex = allQuestions.findIndex(
                          (quest) => quest.id === question.id
                        )
                        const qIndex = allQuestions.findIndex(
                          (quest) => quest.id === q.id
                        )
                        return (
                          qIndex < currentIndex &&
                          [
                            'multiple-choice',
                            'checkboxes',
                            'dropdown',
                            'short-text',
                            'email'
                          ].includes(q.type)
                        )
                      })
                      .map((q) => (
                        <SelectItem key={q.id} value={q.id}>
                          {q.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {question.sourceQuestionId && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs">Condition</Label>
                    <Select
                      onValueChange={(value: string) =>
                        onUpdate({
                          conditionalLogicEnabled: true,
                          condition: value as
                            | 'equals'
                            | 'not_equals'
                            | 'contains'
                            | 'not_contains'
                        })
                      }
                      value={question.condition ?? undefined}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">equals</SelectItem>
                        <SelectItem value="not_equals">
                          does not equal
                        </SelectItem>
                        {allQuestions.find(
                          (q) => q.id === question.sourceQuestionId
                        )?.type === 'short-text' && (
                          <>
                            <SelectItem value="contains">contains</SelectItem>
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
                    {(() => {
                      const sourceQuestion = allQuestions.find(
                        (q) => q.id === question.sourceQuestionId
                      )
                      return sourceQuestion &&
                        ['multiple-choice', 'dropdown'].includes(
                          sourceQuestion.type
                        ) ? (
                        <Select
                          onValueChange={(value) =>
                            onUpdate({
                              conditionalLogicEnabled: true,
                              conditionValue: value
                            })
                          }
                          value={question.conditionValue ?? undefined}
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
                            onUpdate({
                              conditionalLogicEnabled: true,
                              conditionValue: e.target.value
                            })
                          }
                          placeholder="Enter value"
                          value={question.conditionValue || ''}
                        />
                      )
                    })()}
                  </div>
                </>
              )}
            </div>
          )}

          {allQuestions.filter((q) => {
            const currentIndex = allQuestions.findIndex(
              (quest) => quest.id === question.id
            )
            const qIndex = allQuestions.findIndex((quest) => quest.id === q.id)
            return (
              qIndex < currentIndex &&
              [
                'multiple-choice',
                'checkboxes',
                'dropdown',
                'short-text',
                'email'
              ].includes(q.type)
            )
          }).length === 0 && (
            <p className="text-muted-foreground text-xs">
              Add questions with options above this one to enable conditional
              logic
            </p>
          )}
        </div>

        <Separator />

        <div className="rounded-lg bg-muted p-4">
          <p className="mb-1 font-medium text-sm">Question Type</p>
          <p className="text-muted-foreground text-sm capitalize">
            {question.type.replace('-', ' ')}
          </p>
        </div>
      </div>
    </Card>
  )
}

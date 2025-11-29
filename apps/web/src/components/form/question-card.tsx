'use client'

import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import { Input } from '@rov/ui/components/input'
import { Label } from '@rov/ui/components/label'
import { Switch } from '@rov/ui/components/switch'
import { Textarea } from '@rov/ui/components/textarea'
import { Asterisk, Copy, GripVertical, Trash2 } from 'lucide-react'
import type { Question } from './form-builder'
import { QuestionPreview } from './question-preview'

interface QuestionCardProps {
  question: Question
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<Question>) => void
  onDelete: () => void
  onDuplicate: () => void
}

export function QuestionCard({
  question,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate
}: QuestionCardProps) {
  return (
    <Card
      className={`cursor-pointer p-6 transition-all ${
        isSelected ? 'shadow-lg ring-2 ring-primary' : 'hover:shadow-md'
      }`}
      onClick={onSelect}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <button
            className="mt-2 cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
            type="button"
          >
            <GripVertical className="h-5 w-5" />
          </button>
          <div className="flex-1 space-y-3">
            <div className="flex items-start gap-2">
              <Input
                className="font-medium"
                onChange={(e) => {
                  e.stopPropagation()
                  onUpdate({ title: e.target.value })
                }}
                onClick={(e) => e.stopPropagation()}
                placeholder="Question title"
                value={question.title}
              />
              {question.required && (
                <Asterisk className="mt-3 h-4 w-4 flex-shrink-0 text-destructive" />
              )}
            </div>
            {question.description !== undefined && (
              <Textarea
                className="text-sm"
                onChange={(e) => {
                  e.stopPropagation()
                  onUpdate({ description: e.target.value })
                }}
                onClick={(e) => e.stopPropagation()}
                placeholder="Question description (optional)"
                rows={2}
                value={question.description}
              />
            )}
            <QuestionPreview question={question} />
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={question.required}
              onCheckedChange={(checked) => onUpdate({ required: checked })}
              onClick={(e) => e.stopPropagation()}
            />
            <Label
              className="cursor-pointer text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              Required
            </Label>
          </div>
          <div className="flex items-center gap-1">
            <Button
              onClick={(e) => {
                e.stopPropagation()
                onDuplicate()
              }}
              size="icon"
              variant="ghost"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              size="icon"
              variant="ghost"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

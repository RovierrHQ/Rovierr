'use client'

import type { QuestionType } from '@rov/shared'
import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import {
  AlignLeft,
  Calendar,
  CheckSquare,
  ChevronDown,
  Clock,
  Hash,
  ListChecks,
  Mail,
  Phone,
  Star,
  Type,
  Upload,
  X
} from 'lucide-react'
import type React from 'react'

interface QuestionTypeSelectorProps {
  onSelect: (type: QuestionType) => void
  onCancel: () => void
}

const questionTypes: {
  type: QuestionType
  label: string
  icon: React.ReactNode
}[] = [
  {
    type: 'short-text',
    label: 'Short Text',
    icon: <Type className="h-5 w-5" />
  },
  {
    type: 'long-text',
    label: 'Long Text',
    icon: <AlignLeft className="h-5 w-5" />
  },
  {
    type: 'multiple-choice',
    label: 'Multiple Choice',
    icon: <ListChecks className="h-5 w-5" />
  },
  {
    type: 'checkboxes',
    label: 'Checkboxes',
    icon: <CheckSquare className="h-5 w-5" />
  },
  {
    type: 'dropdown',
    label: 'Dropdown',
    icon: <ChevronDown className="h-5 w-5" />
  },
  { type: 'date', label: 'Date', icon: <Calendar className="h-5 w-5" /> },
  { type: 'time', label: 'Time', icon: <Clock className="h-5 w-5" /> },
  { type: 'email', label: 'Email', icon: <Mail className="h-5 w-5" /> },
  { type: 'phone', label: 'Phone', icon: <Phone className="h-5 w-5" /> },
  { type: 'number', label: 'Number', icon: <Hash className="h-5 w-5" /> },
  { type: 'rating', label: 'Rating', icon: <Star className="h-5 w-5" /> },
  {
    type: 'file-upload',
    label: 'File Upload',
    icon: <Upload className="h-5 w-5" />
  }
]

export function QuestionTypeSelector({
  onSelect,
  onCancel
}: QuestionTypeSelectorProps) {
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">Select Question Type</h3>
        <Button onClick={onCancel} size="icon" variant="ghost">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {questionTypes.map((qt) => (
          <button
            className="flex flex-col items-center gap-2 rounded-lg border bg-card p-4 transition-all hover:border-primary hover:bg-accent"
            key={qt.type}
            onClick={() => onSelect(qt.type)}
            type="button"
          >
            <div className="text-primary">{qt.icon}</div>
            <span className="text-center font-medium text-sm">{qt.label}</span>
          </button>
        ))}
      </div>
    </Card>
  )
}

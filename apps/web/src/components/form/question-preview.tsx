import { Checkbox } from '@rov/ui/components/checkbox'
import { Input } from '@rov/ui/components/input'
import { Label } from '@rov/ui/components/label'
import { RadioGroup, RadioGroupItem } from '@rov/ui/components/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@rov/ui/components/select'
import { Textarea } from '@rov/ui/components/textarea'
import { Star } from 'lucide-react'
import type { Question } from './form-builder'

interface QuestionPreviewProps {
  question: Question
}

export function QuestionPreview({ question }: QuestionPreviewProps) {
  switch (question.type) {
    case 'short-text':
    case 'email':
    case 'phone':
    case 'number':
      return (
        <Input
          className="bg-muted/50"
          disabled
          placeholder={question.placeholder || 'Your answer'}
        />
      )

    case 'long-text':
      return (
        <Textarea
          className="bg-muted/50"
          disabled
          placeholder={question.placeholder || 'Your answer'}
          rows={3}
        />
      )

    case 'multiple-choice':
      return (
        <RadioGroup disabled>
          {question.options?.map((option) => (
            <div className="flex items-center gap-2" key={option}>
              <RadioGroupItem id={`${question.id}-${option}`} value={option} />
              <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>
      )

    case 'checkboxes':
      return (
        <div className="space-y-3">
          {question.options?.map((option) => (
            <div className="flex items-center gap-2" key={option}>
              <Checkbox disabled id={`${question.id}-${option}`} />
              <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
            </div>
          ))}
        </div>
      )

    case 'dropdown':
      return (
        <Select disabled>
          <SelectTrigger className="bg-muted/50">
            <SelectValue placeholder="Choose an option" />
          </SelectTrigger>
          <SelectContent>
            {question.options?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )

    case 'date':
      return <Input className="bg-muted/50" disabled type="date" />

    case 'time':
      return <Input className="bg-muted/50" disabled type="time" />

    case 'rating':
      return (
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star className="h-8 w-8 text-muted-foreground" key={star} />
          ))}
        </div>
      )

    case 'file-upload':
      return (
        <div className="rounded-lg border-2 border-dashed bg-muted/50 p-8 text-center">
          <p className="text-muted-foreground text-sm">
            Click to upload or drag and drop
          </p>
        </div>
      )

    default:
      return null
  }
}

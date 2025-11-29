'use client'

import { Alert, AlertDescription } from '@rov/ui/components/alert'
import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
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
import {
  AlertCircle,
  Asterisk,
  ChevronLeft,
  ChevronRight,
  Star
} from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import type { FormData, Page, Question } from './form-builder'
import { createFormSchema } from './validation-schema'

interface FormPreviewProps {
  formData: FormData
}

export function FormPreview({ formData }: FormPreviewProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [errors, setErrors] = useState<Record<string, string>>({}) // Added error state for validation

  const shouldShowPage = (page: Page): boolean => {
    if (!page.conditionalLogicEnabled) return true

    const { sourceQuestionId, condition, conditionValue } = page
    if (!(sourceQuestionId && condition && conditionValue)) return true

    const sourceAnswer = answers[sourceQuestionId]
    if (!sourceAnswer) return false

    switch (condition) {
      case 'equals':
        return sourceAnswer === conditionValue
      case 'not_equals':
        return sourceAnswer !== conditionValue
      case 'contains':
        return String(sourceAnswer)
          .toLowerCase()
          .includes(String(conditionValue).toLowerCase())
      case 'not_contains':
        return !String(sourceAnswer)
          .toLowerCase()
          .includes(String(conditionValue).toLowerCase())
      default:
        return true
    }
  }

  const shouldShowQuestion = (question: Question): boolean => {
    if (!question.conditionalLogicEnabled) return true

    const { sourceQuestionId, condition, conditionValue } = question
    if (!(sourceQuestionId && condition && conditionValue)) return true

    const sourceAnswer = answers[sourceQuestionId]
    if (!sourceAnswer) return false

    switch (condition) {
      case 'equals':
        return sourceAnswer === conditionValue
      case 'not_equals':
        return sourceAnswer !== conditionValue
      case 'contains':
        return String(sourceAnswer)
          .toLowerCase()
          .includes(String(conditionValue).toLowerCase())
      case 'not_contains':
        return !String(sourceAnswer)
          .toLowerCase()
          .includes(String(conditionValue).toLowerCase())
      default:
        return true
    }
  }

  const visiblePages = formData.pages.filter((page, index) => {
    if (index === 0) return true // Always show first page
    return shouldShowPage(page)
  })

  const currentPage = visiblePages[currentPageIndex]

  const visibleQuestions = formData.questions
    .filter((q) => q.pageId === currentPage?.id)
    .filter(shouldShowQuestion)

  const handleAnswer = (questionId: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
    // Clear error when user updates answer
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[questionId]
        return newErrors
      })
    }
  }

  const validateCurrentPage = (): boolean => {
    const pageQuestions = visibleQuestions.filter((q) => q.required)
    const newErrors: Record<string, string> = {}

    for (const question of pageQuestions) {
      const answer = answers[question.id]
      if (!answer || (Array.isArray(answer) && answer.length === 0)) {
        newErrors[question.id] = 'This field is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    try {
      const schema = createFormSchema(
        formData.questions.filter(shouldShowQuestion)
      )
      schema.parse(answers)
      alert('Form submitted successfully!')
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        for (const err of error.issues) {
          const questionId = err.path[0] as string
          newErrors[questionId] = err.message
        }
        setErrors(newErrors)
      }
    }
  }

  const renderQuestion = (question: Question) => {
    const error = errors[question.id]
    const commonClasses = error ? 'border-destructive' : ''

    switch (question.type) {
      case 'short-text':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <div className="space-y-2">
            <Input
              className={commonClasses}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              placeholder={question.placeholder || 'Your answer'}
              type={(() => {
                if (question.type === 'email') return 'email'
                if (question.type === 'phone') return 'tel'
                if (question.type === 'number') return 'number'
                return 'text'
              })()}
              value={(answers[question.id] as string) || ''}
            />
            {error && <p className="text-destructive text-xs">{error}</p>}
          </div>
        )

      case 'long-text':
        return (
          <div className="space-y-2">
            <Textarea
              className={commonClasses}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              placeholder={question.placeholder || 'Your answer'}
              rows={4}
              value={(answers[question.id] as string) || ''}
            />
            {error && <p className="text-destructive text-xs">{error}</p>}
          </div>
        )

      case 'multiple-choice':
        return (
          <div className="space-y-2">
            <RadioGroup
              onValueChange={(value) => handleAnswer(question.id, value)}
              value={(answers[question.id] as string) || undefined}
            >
              {question.options?.map((option) => (
                <div className="flex items-center gap-2" key={option}>
                  <RadioGroupItem
                    id={`preview-${question.id}-${option}`}
                    value={option}
                  />
                  <Label htmlFor={`preview-${question.id}-${option}`}>
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {error && <p className="text-destructive text-xs">{error}</p>}
          </div>
        )

      case 'checkboxes':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <div className="flex items-center gap-2" key={option}>
                <Checkbox
                  checked={(answers[question.id] as string[])?.includes(option)}
                  id={`preview-${question.id}-${option}`}
                  onCheckedChange={(checked) => {
                    const current = (answers[question.id] as string[]) || []
                    const updated = checked
                      ? [...current, option]
                      : current.filter((v: string) => v !== option)
                    handleAnswer(question.id, updated)
                  }}
                />
                <Label htmlFor={`preview-${question.id}-${option}`}>
                  {option}
                </Label>
              </div>
            ))}
            {error && <p className="text-destructive text-xs">{error}</p>}
          </div>
        )

      case 'dropdown':
        return (
          <div className="space-y-2">
            <Select
              onValueChange={(value) => handleAnswer(question.id, value)}
              value={(answers[question.id] as string) || undefined}
            >
              <SelectTrigger className={commonClasses}>
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
            {error && <p className="text-destructive text-xs">{error}</p>}
          </div>
        )

      case 'date':
        return (
          <div className="space-y-2">
            <Input
              className={commonClasses}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              type="date"
              value={(answers[question.id] as string) || ''}
            />
            {error && <p className="text-destructive text-xs">{error}</p>}
          </div>
        )

      case 'time':
        return (
          <div className="space-y-2">
            <Input
              className={commonClasses}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              type="time"
              value={(answers[question.id] as string) || ''}
            />
            {error && <p className="text-destructive text-xs">{error}</p>}
          </div>
        )

      case 'rating':
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  className="transition-transform hover:scale-110"
                  key={star}
                  onClick={() => handleAnswer(question.id, star)}
                  type="button"
                >
                  <Star
                    className={`h-8 w-8 ${
                      (answers[question.id] as number) >= star
                        ? 'fill-primary text-primary'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            {error && <p className="text-destructive text-xs">{error}</p>}
          </div>
        )

      case 'file-upload':
        return (
          <div className="space-y-2">
            <div
              className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:border-primary ${error ? 'border-destructive' : ''}`}
            >
              <p className="text-muted-foreground text-sm">
                Click to upload or drag and drop
              </p>
              <p className="mt-1 text-muted-foreground text-xs">
                PDF, PNG, JPG up to 10MB
              </p>
            </div>
            {error && <p className="text-destructive text-xs">{error}</p>}
          </div>
        )

      default:
        return null
    }
  }

  if (formData.questions.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <p className="text-muted-foreground">No questions added yet</p>
          <p className="mt-1 text-muted-foreground text-sm">
            Switch to Build tab to add questions
          </p>
        </div>
      </Card>
    )
  }

  const isLastPage = currentPageIndex === visiblePages.length - 1
  const isFirstPage = currentPageIndex === 0

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="space-y-8 p-8">
        {visiblePages.length > 1 && (
          <div className="space-y-2 border-b pb-6">
            <div className="flex items-center justify-between text-muted-foreground text-sm">
              <span>
                Page {currentPageIndex + 1} of {visiblePages.length}
              </span>
              <span>{currentPage?.title}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${((currentPageIndex + 1) / visiblePages.length) * 100}%`
                }}
              />
            </div>
          </div>
        )}

        {isFirstPage && (
          <div className="space-y-2 border-b pb-6">
            <h1 className="text-balance font-bold text-3xl">
              {formData.title}
            </h1>
            <p className="text-pretty text-muted-foreground">
              {formData.description}
            </p>
          </div>
        )}

        {currentPage?.description && (
          <div className="pb-4">
            <p className="text-pretty text-muted-foreground">
              {currentPage.description}
            </p>
          </div>
        )}

        {Object.keys(errors).length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please fix the errors below before continuing.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-8">
          {visibleQuestions.map((question, index) => (
            <div className="space-y-3" key={question.id}>
              <div className="flex items-start gap-2">
                <span className="mt-1 font-medium text-muted-foreground text-sm">
                  {index + 1}.
                </span>
                <div className="flex-1">
                  <div className="flex items-start gap-1">
                    <Label className="text-balance font-medium text-base">
                      {question.title}
                    </Label>
                    {question.required && (
                      <Asterisk className="h-4 w-4 flex-shrink-0 text-destructive" />
                    )}
                  </div>
                  {question.description && (
                    <p className="mt-1 text-pretty text-muted-foreground text-sm">
                      {question.description}
                    </p>
                  )}
                  {question.conditionalLogicEnabled && (
                    <p className="mt-1 text-muted-foreground text-xs italic">
                      Conditional question
                    </p>
                  )}
                </div>
              </div>
              <div className="ml-6">{renderQuestion(question)}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t pt-6">
          {isFirstPage ? (
            <div />
          ) : (
            <Button
              onClick={() => setCurrentPageIndex((prev) => prev - 1)}
              variant="outline"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
          )}

          {isLastPage ? (
            <Button onClick={handleSubmit} size="lg">
              Submit Form
            </Button>
          ) : (
            <Button
              onClick={() => {
                if (validateCurrentPage()) {
                  setCurrentPageIndex((prev) => prev + 1)
                }
              }}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

'use client'

import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import { Input } from '@rov/ui/components/input'
import { Label } from '@rov/ui/components/label'
import { Textarea } from '@rov/ui/components/textarea'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { orpc } from '@/utils/orpc'

interface RegistrationFormProps {
  form: {
    id: string
    title: string
    description: string | null
    paymentEnabled: boolean
    paymentAmount: string | null
  }
  society: {
    id: string
    name: string
  }
  user: {
    id: string
    name: string
    email: string
  }
  onSubmit: (formResponseId: string) => void
}

export const RegistrationForm = ({
  form,
  society: _society,
  user,
  onSubmit
}: RegistrationFormProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({
    name: user.name,
    email: user.email
  })

  // Submit form response mutation
  const submitFormMutation = useMutation(
    orpc.form.response.submit.mutationOptions({
      onSuccess: (response) => {
        onSubmit(response.id)
      },
      onError: () => {
        toast.error('Failed to submit form')
      }
    })
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!(formData.name && formData.email)) {
      toast.error('Please fill in all required fields')
      return
    }

    submitFormMutation.mutate({
      formId: form.id,
      answers: formData
    })
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Card className="p-6">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <h2 className="mb-2 font-semibold text-xl">{form.title}</h2>
          {form.description && (
            <p className="text-muted-foreground text-sm">{form.description}</p>
          )}
        </div>

        {/* Auto-filled fields */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Your full name"
              required
              value={formData.name || ''}
            />
            <p className="mt-1 text-muted-foreground text-xs">
              Auto-filled from your profile
            </p>
          </div>

          <div>
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="your.email@example.com"
              required
              type="email"
              value={formData.email || ''}
            />
            <p className="mt-1 text-muted-foreground text-xs">
              Auto-filled from your profile
            </p>
          </div>
        </div>

        {/* Additional fields */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (555) 000-0000"
              type="tel"
              value={formData.phone || ''}
            />
          </div>

          <div>
            <Label htmlFor="studentId">Student ID</Label>
            <Input
              id="studentId"
              onChange={(e) => handleChange('studentId', e.target.value)}
              placeholder="Your student ID"
              value={formData.studentId || ''}
            />
          </div>

          <div>
            <Label htmlFor="major">Major/Program</Label>
            <Input
              id="major"
              onChange={(e) => handleChange('major', e.target.value)}
              placeholder="e.g., Computer Science"
              value={formData.major || ''}
            />
          </div>

          <div>
            <Label htmlFor="year">Year of Study</Label>
            <Input
              id="year"
              onChange={(e) => handleChange('year', e.target.value)}
              placeholder="e.g., 2nd Year"
              value={formData.year || ''}
            />
          </div>

          <div>
            <Label htmlFor="motivation">
              Why do you want to join?{' '}
              <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="motivation"
              onChange={(e) => handleChange('motivation', e.target.value)}
              placeholder="Tell us why you're interested in joining..."
              required
              rows={4}
              value={formData.motivation || ''}
            />
          </div>

          <div>
            <Label htmlFor="experience">Relevant Experience (Optional)</Label>
            <Textarea
              id="experience"
              onChange={(e) => handleChange('experience', e.target.value)}
              placeholder="Any relevant experience or skills..."
              rows={3}
              value={formData.experience || ''}
            />
          </div>
        </div>

        {/* Payment info */}
        {form.paymentEnabled && form.paymentAmount && (
          <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-2 font-semibold text-sm">Membership Fee</h3>
            <p className="mb-2 font-bold text-2xl">${form.paymentAmount}</p>
            <p className="text-muted-foreground text-sm">
              Payment will be required after your application is submitted.
              You'll receive instructions on how to pay.
            </p>
          </div>
        )}

        {/* Submit button */}
        <div className="flex justify-end gap-2">
          <Button
            disabled={submitFormMutation.isPending}
            size="lg"
            type="submit"
          >
            {submitFormMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}

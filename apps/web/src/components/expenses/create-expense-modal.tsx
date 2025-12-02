'use client'

import { Button } from '@rov/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { CalendarIcon, Upload } from 'lucide-react'
import type React from 'react'
import { useState } from 'react'

interface CreateExpenseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateExpenseModal({
  open,
  onOpenChange
}: CreateExpenseModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    onOpenChange(false)
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Expense</DialogTitle>
          <DialogDescription>
            Fill in the details to submit a new expense for approval.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                className="bg-background"
                id="description"
                placeholder="e.g., Client Meeting Lunch"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <div className="relative">
                <span className="-translate-y-1/2 absolute top-1/2 left-3 text-muted-foreground">
                  $
                </span>
                <Input
                  className="bg-background pl-7"
                  id="amount"
                  placeholder="0.00"
                  required
                  step="0.01"
                  type="number"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select required>
                <SelectTrigger className="bg-background" id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="meals">Meals & Entertainment</SelectItem>
                  <SelectItem value="supplies">Office Supplies</SelectItem>
                  <SelectItem value="software">
                    Software & Subscriptions
                  </SelectItem>
                  <SelectItem value="marketing">
                    Marketing & Advertising
                  </SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <div className="relative">
                <Input
                  className="bg-background"
                  id="date"
                  required
                  type="date"
                />
                <CalendarIcon className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="merchant">Merchant *</Label>
              <Input
                className="bg-background"
                id="merchant"
                placeholder="e.g., Starbucks"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method *</Label>
              <Select required>
                <SelectTrigger className="bg-background" id="payment-method">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company-card">Company Card</SelectItem>
                  <SelectItem value="personal-card">Personal Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              className="resize-none bg-background"
              id="notes"
              placeholder="Add any additional details..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt">Receipt Attachment</Label>
            <div className="flex items-center gap-2">
              <Button
                className="gap-2 bg-transparent"
                type="button"
                variant="outline"
              >
                <Upload className="h-4 w-4" />
                Upload Receipt
              </Button>
              <span className="text-muted-foreground text-sm">
                PDF, PNG, JPG (Max 5MB)
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Submitting...' : 'Submit Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

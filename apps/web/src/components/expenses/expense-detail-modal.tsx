'use client'

import { Badge } from '@rov/ui/components/badge'
import { Button } from '@rov/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@rov/ui/components/dialog'
import { Label } from '@rov/ui/components/label'
import { Separator } from '@rov/ui/components/separator'
import { Textarea } from '@rov/ui/components/textarea'
import {
  Calendar,
  CheckCircle,
  CreditCard,
  DollarSign,
  FileText,
  Receipt,
  Users,
  XCircle
} from 'lucide-react'
import { useState } from 'react'

interface SplitMember {
  name: string
  amount: number
}

interface Expense {
  id: string
  description: string
  category: string
  amount: number
  date: string
  merchant: string
  status: 'pending' | 'approved' | 'rejected' | 'paid'
  submittedBy: string
  submittedByTeam?: string
  receiptUrl?: string
  notes?: string
  paymentMethod: string
  splitBetween?: SplitMember[]
  reimbursementStatus?: 'pending' | 'processing' | 'completed'
  reimbursementDate?: string
  approvedBy?: string
  approvedDate?: string
  rejectionReason?: string
}

interface ExpenseDetailModalProps {
  expense: Expense
  isOpen: boolean
  onClose: () => void
}

export function ExpenseDetailModal({
  expense,
  isOpen,
  onClose
}: ExpenseDetailModalProps) {
  const [isExecutive] = useState(true) // Mock: Set to true to simulate executive access
  const [approvalComment, setApprovalComment] = useState('')
  const [showApprovalActions] = useState(expense.status === 'pending')

  const handleApprove = () => {
    // In a real app, this would call an API to approve the expense
    alert(`Expense ${expense.id} approved!`)
    onClose()
  }

  const handleReject = () => {
    // In a real app, this would call an API to reject the expense
    alert(`Expense ${expense.id} rejected with reason: ${approvalComment}`)
    onClose()
  }

  const handleMarkPaid = () => {
    alert(`Expense ${expense.id} marked as paid!`)
    onClose()
  }

  const statusColors = {
    pending: 'bg-[var(--status-pending)] text-background',
    approved: 'bg-[var(--status-approved)] text-background',
    rejected: 'bg-[var(--status-rejected)] text-background',
    paid: 'bg-[var(--status-paid)] text-background'
  }

  return (
    <Dialog onOpenChange={onClose} open={isOpen}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Expense Details - {expense.id}</span>
            <Badge className={statusColors[expense.status]} variant="secondary">
              {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground text-xs">
                Description
              </Label>
              <p className="font-medium text-base">{expense.description}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Amount</Label>
              <p className="font-bold text-2xl text-primary">
                ${expense.amount.toFixed(2)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <Label className="text-muted-foreground text-xs">Date</Label>
                <p className="text-sm">
                  {new Date(expense.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Receipt className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <Label className="text-muted-foreground text-xs">
                  Merchant
                </Label>
                <p className="text-sm">{expense.merchant}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <Label className="text-muted-foreground text-xs">
                  Category
                </Label>
                <p className="text-sm">{expense.category}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CreditCard className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <Label className="text-muted-foreground text-xs">
                  Payment Method
                </Label>
                <p className="text-sm">{expense.paymentMethod}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Submitter Information */}
          <div>
            <Label className="mb-2 block text-muted-foreground text-xs">
              Submitted By
            </Label>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-medium text-sm">
                {expense.submittedBy.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-sm">{expense.submittedBy}</p>
                {expense.submittedByTeam && (
                  <p className="text-muted-foreground text-xs">
                    {expense.submittedByTeam}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Split Bill Information */}
          {expense.splitBetween && expense.splitBetween.length > 0 && (
            <>
              <Separator />
              <div>
                <Label className="mb-3 flex items-center gap-2 text-muted-foreground text-xs">
                  <Users className="h-4 w-4" />
                  Split Between {expense.splitBetween.length} Members
                </Label>
                <div className="space-y-2 rounded-lg bg-muted/30 p-4">
                  {expense.splitBetween.map((member) => (
                    <div
                      className="flex items-center justify-between"
                      key={member.name}
                    >
                      <span className="text-sm">{member.name}</span>
                      <span className="font-medium text-sm">
                        ${member.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-muted-foreground text-xs">
                  Each member will be reimbursed their portion after approval
                </p>
              </div>
            </>
          )}

          {/* Reimbursement Information */}
          {expense.reimbursementStatus && (
            <>
              <Separator />
              <div>
                <Label className="mb-2 flex items-center gap-2 text-muted-foreground text-xs">
                  <DollarSign className="h-4 w-4" />
                  Reimbursement Status
                </Label>
                <div className="rounded-lg bg-muted/30 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm">Status</span>
                    <Badge variant="outline">
                      {expense.reimbursementStatus === 'completed' &&
                        'Completed'}
                      {expense.reimbursementStatus === 'processing' &&
                        'Processing'}
                      {expense.reimbursementStatus === 'pending' && 'Pending'}
                    </Badge>
                  </div>
                  {expense.reimbursementDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Reimbursed On</span>
                      <span className="font-medium text-sm">
                        {new Date(
                          expense.reimbursementDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {expense.splitBetween &&
                    expense.reimbursementStatus === 'pending' && (
                      <p className="mt-2 text-muted-foreground text-xs">
                        Finance team will process individual reimbursements
                        after approval
                      </p>
                    )}
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          {expense.notes && (
            <>
              <Separator />
              <div>
                <Label className="mb-2 block text-muted-foreground text-xs">
                  Notes
                </Label>
                <p className="rounded-lg bg-muted/30 p-3 text-sm">
                  {expense.notes}
                </p>
              </div>
            </>
          )}

          {/* Approval Information */}
          {expense.approvedBy && (
            <>
              <Separator />
              <div>
                <Label className="mb-2 block text-muted-foreground text-xs">
                  Approval Information
                </Label>
                <div className="rounded-lg bg-green-500/10 p-3">
                  <p className="text-sm">
                    Approved by{' '}
                    <span className="font-medium">{expense.approvedBy}</span> on{' '}
                    {expense.approvedDate &&
                      new Date(expense.approvedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Rejection Reason */}
          {expense.rejectionReason && (
            <>
              <Separator />
              <div>
                <Label className="mb-2 block text-muted-foreground text-xs">
                  Rejection Reason
                </Label>
                <div className="rounded-lg bg-destructive/10 p-3">
                  <p className="text-sm">{expense.rejectionReason}</p>
                </div>
              </div>
            </>
          )}

          {/* Executive Actions */}
          {isExecutive &&
            showApprovalActions &&
            expense.status === 'pending' && (
              <>
                <Separator />
                <div className="space-y-3">
                  <Label className="text-muted-foreground text-xs">
                    Executive Actions
                  </Label>
                  <div className="space-y-3">
                    <div>
                      <Label
                        className="mb-2 block text-sm"
                        htmlFor="approval-comment"
                      >
                        Comments (Optional)
                      </Label>
                      <Textarea
                        className="min-h-20"
                        id="approval-comment"
                        onChange={(e) => setApprovalComment(e.target.value)}
                        placeholder="Add a comment or reason..."
                        value={approvalComment}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={handleApprove}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve Expense
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={handleReject}
                        variant="destructive"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject Expense
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}

          {/* Finance Team Actions - Mark as Paid */}
          {isExecutive &&
            expense.status === 'approved' &&
            expense.reimbursementStatus === 'pending' && (
              <>
                <Separator />
                <div className="space-y-3">
                  <Label className="text-muted-foreground text-xs">
                    Finance Team Actions
                  </Label>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleMarkPaid}
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Mark as Paid / Reimbursed
                  </Button>
                  {expense.splitBetween && (
                    <p className="text-muted-foreground text-xs">
                      This will mark all {expense.splitBetween.length}{' '}
                      reimbursements as completed
                    </p>
                  )}
                </div>
              </>
            )}
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

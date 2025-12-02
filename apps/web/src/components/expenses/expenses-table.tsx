'use client'

import { Badge } from '@rov/ui/components/badge'
import { Card } from '@rov/ui/components/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@rov/ui/components/table'
import { useState } from 'react'
import { ExpenseDetailModal } from './expense-detail-modal'

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
  splitBetween?: { name: string; amount: number }[]
  reimbursementStatus?: 'pending' | 'processing' | 'completed'
  reimbursementDate?: string
  approvedBy?: string
  approvedDate?: string
  rejectionReason?: string
}

const mockExpenses: Expense[] = [
  {
    id: 'EXP-001',
    description: 'Client Meeting Lunch',
    category: 'Meals',
    amount: 142.5,
    date: '2025-01-08',
    merchant: 'The Bistro',
    status: 'approved',
    submittedBy: 'John Doe',
    submittedByTeam: 'Marketing Team',
    paymentMethod: 'Personal Card',
    reimbursementStatus: 'pending',
    approvedBy: 'Finance Director',
    approvedDate: '2025-01-09',
    notes: 'Quarterly client review meeting'
  },
  {
    id: 'EXP-002',
    description: 'Team Event Supplies',
    category: 'Events',
    amount: 485.0,
    date: '2025-01-07',
    merchant: 'Party Supplies Co',
    status: 'pending',
    submittedBy: 'Sarah Smith',
    submittedByTeam: 'Events Team',
    paymentMethod: 'Personal Card',
    splitBetween: [
      { name: 'Sarah Smith', amount: 97.0 },
      { name: 'Mike Johnson', amount: 97.0 },
      { name: 'Emily Chen', amount: 97.0 },
      { name: 'David Lee', amount: 97.0 },
      { name: 'Anna Wong', amount: 97.0 }
    ],
    notes: 'Annual club social event - split equally among 5 organizers'
  },
  {
    id: 'EXP-003',
    description: 'Office Supplies - Q1',
    category: 'Office Supplies',
    amount: 78.25,
    date: '2025-01-06',
    merchant: 'Staples',
    status: 'paid',
    submittedBy: 'Mike Johnson',
    paymentMethod: 'Personal Card',
    reimbursementStatus: 'completed',
    reimbursementDate: '2025-01-10',
    approvedBy: 'Finance Director',
    approvedDate: '2025-01-07'
  },
  {
    id: 'EXP-004',
    description: 'Workshop Registration Fees',
    category: 'Professional Development',
    amount: 599.88,
    date: '2025-01-05',
    merchant: 'Tech Conference 2025',
    status: 'approved',
    submittedBy: 'Emily Chen',
    submittedByTeam: 'Technical Team',
    paymentMethod: 'Personal Card',
    reimbursementStatus: 'processing',
    approvedBy: 'President',
    approvedDate: '2025-01-06',
    notes: '3 members attending workshop',
    splitBetween: [
      { name: 'Emily Chen', amount: 199.96 },
      { name: 'James Park', amount: 199.96 },
      { name: 'Lisa Kumar', amount: 199.96 }
    ]
  },
  {
    id: 'EXP-005',
    description: 'Marketing Campaign Materials',
    category: 'Marketing',
    amount: 1250.0,
    date: '2025-01-04',
    merchant: 'Print Shop',
    status: 'pending',
    submittedBy: 'David Lee',
    submittedByTeam: 'Marketing Team',
    paymentMethod: 'Personal Card',
    notes: 'Promotional materials for recruitment drive'
  },
  {
    id: 'EXP-006',
    description: 'Travel to Regional Competition',
    category: 'Travel',
    amount: 320.0,
    date: '2025-01-03',
    merchant: 'Greyhound Bus',
    status: 'rejected',
    submittedBy: 'John Doe',
    submittedByTeam: 'Competition Team',
    paymentMethod: 'Personal Card',
    rejectionReason:
      'Travel expenses should be pre-approved. Please submit travel request before booking.'
  },
  {
    id: 'EXP-007',
    description: 'Team Dinner After Event',
    category: 'Meals',
    amount: 425.5,
    date: '2025-01-02',
    merchant: 'Sushi Palace',
    status: 'approved',
    submittedBy: 'Sarah Smith',
    submittedByTeam: 'Events Team',
    paymentMethod: 'Personal Card',
    reimbursementStatus: 'pending',
    approvedBy: 'Treasurer',
    approvedDate: '2025-01-03',
    splitBetween: [
      { name: 'Sarah Smith', amount: 106.375 },
      { name: 'Tom Brady', amount: 106.375 },
      { name: 'Alice Cooper', amount: 106.375 },
      { name: 'Bob Martin', amount: 106.375 }
    ]
  },
  {
    id: 'EXP-008',
    description: 'Taxi to University Event',
    category: 'Travel',
    amount: 45.0,
    date: '2025-01-01',
    merchant: 'Uber',
    status: 'paid',
    submittedBy: 'Mike Johnson',
    paymentMethod: 'Personal Card',
    reimbursementStatus: 'completed',
    reimbursementDate: '2025-01-02',
    approvedBy: 'Finance Director',
    approvedDate: '2025-01-01'
  }
]

const statusColors = {
  pending: 'bg-[var(--status-pending)] text-background',
  approved: 'bg-[var(--status-approved)] text-background',
  rejected: 'bg-[var(--status-rejected)] text-background',
  paid: 'bg-[var(--status-paid)] text-background'
}

interface ExpensesTableProps {
  filterStatus?: 'all' | 'pending' | 'approved' | 'rejected' | 'paid'
}

export function ExpensesTable({ filterStatus = 'all' }: ExpensesTableProps) {
  const [expenses] = useState<Expense[]>(mockExpenses)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredExpenses =
    filterStatus === 'all'
      ? expenses
      : expenses.filter((exp) => exp.status === filterStatus)

  const handleRowClick = (expense: Expense) => {
    setSelectedExpense(expense)
    setIsModalOpen(true)
  }

  return (
    <>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Submitted By</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reimbursement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses.map((expense) => (
              <TableRow
                className="cursor-pointer hover:bg-muted/50"
                key={expense.id}
                onClick={() => handleRowClick(expense)}
              >
                <TableCell className="font-medium text-card-foreground">
                  {expense.id}
                </TableCell>
                <TableCell className="text-card-foreground">
                  <div>
                    {expense.description}
                    {expense.splitBetween && (
                      <div className="mt-1 text-muted-foreground text-xs">
                        Split between {expense.splitBetween.length} members
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {expense.category}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {expense.submittedBy}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {expense.submittedByTeam || (
                    <span className="text-muted-foreground/50">Individual</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(expense.date).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right font-medium text-card-foreground">
                  ${expense.amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge
                    className={statusColors[expense.status]}
                    variant="secondary"
                  >
                    {expense.status.charAt(0).toUpperCase() +
                      expense.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {expense.reimbursementStatus && (
                    <Badge className="text-xs" variant="outline">
                      {expense.reimbursementStatus === 'completed' &&
                        'Reimbursed'}
                      {expense.reimbursementStatus === 'processing' &&
                        'Processing'}
                      {expense.reimbursementStatus === 'pending' && 'Pending'}
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {selectedExpense && (
        <ExpenseDetailModal
          expense={selectedExpense}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedExpense(null)
          }}
        />
      )}
    </>
  )
}

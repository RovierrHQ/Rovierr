'use client'

import { Button } from '@rov/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@rov/ui/components/card'
import { Input } from '@rov/ui/components/input'
import { Label } from '@rov/ui/components/label'
import { Skeleton } from '@rov/ui/components/skeleton'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import {
  DollarSign,
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp
} from 'lucide-react'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { orpc } from '@/utils/orpc'

const ExpensesPage = () => {
  const params = useParams()
  const clubID = params?.clubID as string
  const queryClient = useQueryClient()
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Fetch transactions
  const { data: transactionsData, isLoading: isLoadingTransactions } = useQuery(
    orpc.expenses.listTransactions.queryOptions({
      input: {
        query: {
          clubId: clubID,
          limit: 50
        }
      }
    })
  )

  // Fetch accounts
  const { data: accountsData } = useQuery(
    orpc.expenses.listAccounts.queryOptions({
      input: {
        query: {
          clubId: clubID
        }
      }
    })
  )

  // Fetch categories
  const { data: categoriesData } = useQuery(
    orpc.expenses.listCategories.queryOptions({
      input: {
        query: {
          clubId: clubID
        }
      }
    })
  )

  // Fetch club ledger
  const { data: ledgerData, isLoading: isLoadingLedger } = useQuery(
    orpc.expenses.getClubLedger.queryOptions({
      input: {
        clubId: clubID
      }
    })
  )

  // Create expense mutation
  const createExpenseMutation = useMutation(
    orpc.expenses.createExpense.mutationOptions()
  )

  const handleCreateExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const description = formData.get('description') as string
    const amount = Number.parseFloat(formData.get('amount') as string)
    const accountId = formData.get('accountId') as string
    const categoryId = (formData.get('categoryId') as string) || undefined

    if (!description || Number.isNaN(amount) || !accountId) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      await createExpenseMutation.mutateAsync({
        description,
        totalAmount: amount,
        accountId,
        clubId: clubID,
        categoryId,
        currency: 'HKD'
      })
      toast.success('Expense created successfully')
      setShowCreateForm(false)
      e.currentTarget.reset()
      queryClient.invalidateQueries({
        queryKey: orpc.expenses.listTransactions.queryKey({
          input: { query: { clubId: clubID } }
        })
      })
      queryClient.invalidateQueries({
        queryKey: orpc.expenses.getClubLedger.queryKey({
          input: { clubId: clubID }
        })
      })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create expense'
      )
    }
  }

  const transactions = transactionsData?.data || []
  const accounts = accountsData?.data || []
  const categories = categoriesData?.data || []

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-2xl sm:text-3xl">
            Expense Tracking
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Manage club expenses and track finances
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Summary Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Total Expenses
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingLedger ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="font-bold text-2xl">
                {ledgerData?.summary?.totalExpenses
                  ? `HKD ${Number.parseFloat(ledgerData.summary.totalExpenses).toLocaleString()}`
                  : 'HKD 0'}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingLedger ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="font-bold text-2xl">
                {ledgerData?.summary?.totalIncome
                  ? `HKD ${Number.parseFloat(ledgerData.summary.totalIncome).toLocaleString()}`
                  : 'HKD 0'}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Net Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingLedger ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="font-bold text-2xl">
                {ledgerData?.summary?.netBalance
                  ? `HKD ${Number.parseFloat(ledgerData.summary.netBalance).toLocaleString()}`
                  : 'HKD 0'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Expense Form */}
      {showCreateForm && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Create New Expense</CardTitle>
            <CardDescription>
              Add a new expense to the club ledger
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreateExpense}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    name="description"
                    placeholder="What was this expense for?"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (HKD) *</Label>
                  <Input
                    id="amount"
                    name="amount"
                    placeholder="0.00"
                    required
                    step="0.01"
                    type="number"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="accountId">Account *</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    id="accountId"
                    name="accountId"
                    required
                  >
                    <option value="">Select an account</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    id="categoryId"
                    name="categoryId"
                  >
                    <option value="">No category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  disabled={createExpenseMutation.isPending}
                  type="submit"
                >
                  {createExpenseMutation.isPending
                    ? 'Creating...'
                    : 'Create Expense'}
                </Button>
                <Button
                  onClick={() => setShowCreateForm(false)}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Transactions Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            View all club expenses and transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTransactions && (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton className="h-12 w-full" key={i} />
              ))}
            </div>
          )}
          {!isLoadingTransactions && transactions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Receipt className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 font-medium text-muted-foreground">
                No transactions yet
              </p>
              <p className="text-muted-foreground text-sm">
                Create your first expense to get started
              </p>
            </div>
          )}
          {!isLoadingTransactions && transactions.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left font-medium text-sm">Date</th>
                    <th className="p-4 text-left font-medium text-sm">
                      Description
                    </th>
                    <th className="p-4 text-left font-medium text-sm">Type</th>
                    <th className="p-4 text-left font-medium text-sm">
                      Amount
                    </th>
                    <th className="p-4 text-left font-medium text-sm">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => {
                    let statusClass = 'bg-yellow-100 text-yellow-800'
                    if (transaction.reimbursementStatus === 'paid') {
                      statusClass = 'bg-green-100 text-green-800'
                    } else if (transaction.reimbursementStatus === 'approved') {
                      statusClass = 'bg-blue-100 text-blue-800'
                    }

                    return (
                      <tr className="border-b" key={transaction.id}>
                        <td className="p-4 text-sm">
                          {format(
                            new Date(transaction.createdAt),
                            'MMM d, yyyy'
                          )}
                        </td>
                        <td className="p-4 text-sm">
                          {transaction.description || '-'}
                        </td>
                        <td className="p-4 text-sm">
                          <span className="rounded-full bg-muted px-2 py-1 text-xs">
                            {transaction.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4 font-medium text-sm">
                          HKD{' '}
                          {Number.parseFloat(
                            transaction.totalAmount
                          ).toLocaleString()}
                        </td>
                        <td className="p-4 text-sm">
                          {transaction.reimbursementStatus !== 'none' && (
                            <span
                              className={`rounded-full px-2 py-1 text-xs ${statusClass}`}
                            >
                              {transaction.reimbursementStatus}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ExpensesPage

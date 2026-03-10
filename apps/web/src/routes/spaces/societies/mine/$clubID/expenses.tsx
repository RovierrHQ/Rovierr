import { Alert, AlertDescription } from '@rov/ui/components/alert'
import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import { Tabs, TabsContent } from '@rov/ui/components/tabs'
import { createFileRoute } from '@tanstack/react-router'
import { ActivityFeed } from '@web/components/expenses/activity-feed'
import { ExpensesTable } from '@web/components/expenses/expenses-table'
import { Header } from '@web/components/expenses/header'
import { ReportsCharts } from '@web/components/expenses/reports-charts'
import { ReportsFilters } from '@web/components/expenses/reports-filters'
import { StatCard } from '@web/components/expenses/stat-card'
import {
  BarChart3,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Info,
  LayoutDashboard,
  Receipt
} from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/spaces/societies/mine/$clubID/expenses')(
  {
    component: ExpensesPage
  }
)

// Summary Card Component
function SummaryCard({
  title,
  value,
  icon: Icon,
  isActive,
  onClick,
  variant = 'default'
}: {
  title: string
  value: string
  icon: React.ElementType
  isActive?: boolean
  onClick?: () => void
  variant?: 'default' | 'warning' | 'success'
}) {
  const variantStyles = {
    default: 'bg-card hover:bg-accent',
    warning:
      'bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/50 border-amber-200 dark:border-amber-800',
    success:
      'bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-950/50 border-green-200 dark:border-green-800'
  }

  const iconColors = {
    default: 'text-primary',
    warning: 'text-amber-600 dark:text-amber-400',
    success: 'text-green-600 dark:text-green-400'
  }

  return (
    <button
      className={`flex flex-col items-start rounded-lg border p-4 text-left transition-all ${variantStyles[variant]} ${isActive ? 'ring-2 ring-primary' : ''}`}
      onClick={onClick}
    >
      <div className="flex w-full items-center justify-between">
        <div
          className={`rounded-full p-2 ${variant === 'default' ? 'bg-primary/10' : variant === 'warning' ? 'bg-amber-100 dark:bg-amber-900/50' : 'bg-green-100 dark:bg-green-900/50'}`}
        >
          <Icon className={`h-5 w-5 ${iconColors[variant]}`} />
        </div>
        <span className="text-3xl font-bold">{value}</span>
      </div>
      <p className="mt-2 text-sm font-medium text-muted-foreground">{title}</p>
    </button>
  )
}

function ExpensesPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [expenseFilter, setExpenseFilter] = useState('all')

  return (
    <div className="flex h-screen flex-col">
      <Header />

      <main className="flex-1 overflow-y-auto p-6">
        <Alert className="mb-6">
          <Info className="size-4" />
          <AlertDescription>
            <strong>Demonstration purposes only.</strong> This feature is not
            connected to any backend database. All data shown is for demo
            purposes only.
          </AlertDescription>
        </Alert>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={LayoutDashboard}
            isActive={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
            title="Dashboard"
            value="Overview"
          />
          <SummaryCard
            icon={Receipt}
            isActive={activeTab === 'expenses'}
            onClick={() => setActiveTab('expenses')}
            title="Expenses"
            value="Manage"
          />
          <SummaryCard
            icon={BarChart3}
            isActive={activeTab === 'reports'}
            onClick={() => setActiveTab('reports')}
            title="Reports"
            value="Analytics"
          />
        </div>

        <Tabs className="w-full" onValueChange={setActiveTab} value={activeTab}>
          {/* Dashboard Tab */}
          <TabsContent className="mt-0" value="dashboard">
            <div className="mb-6">
              <h1 className="mb-2 font-bold text-3xl text-foreground">
                Dashboard
              </h1>
              <p className="text-muted-foreground">
                Welcome back! Here&apos;s your expense overview.
              </p>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                change="+12.5% from last month"
                changeType="positive"
                icon={DollarSign}
                title="Total Spent This Month"
                value="$24,580"
              />
              <StatCard
                change="3 urgent"
                changeType="negative"
                icon={Clock}
                title="Pending Approvals"
                value="8"
              />
              <StatCard
                change="+8 from last week"
                changeType="positive"
                icon={CheckCircle}
                title="Approved This Week"
                value="42"
              />
              <StatCard
                change="5 pending"
                changeType="negative"
                icon={CreditCard}
                title="Outstanding Reimbursements"
                value="$3,240"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ActivityFeed />
              </div>

              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="mb-4 font-semibold text-card-foreground text-lg">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <Button
                      className="w-full justify-start bg-transparent"
                      variant="outline"
                    >
                      Submit New Expense
                    </Button>
                    <Button
                      className="w-full justify-start bg-transparent"
                      variant="outline"
                    >
                      Request Reimbursement
                    </Button>
                    <Button
                      className="w-full justify-start bg-transparent"
                      variant="outline"
                    >
                      Export Monthly Report
                    </Button>
                    <Button
                      className="w-full justify-start bg-transparent"
                      variant="outline"
                    >
                      View Budget Status
                    </Button>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="mb-4 font-semibold text-card-foreground text-lg">
                    Budget Usage
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-muted-foreground">Marketing</span>
                        <span className="font-medium text-card-foreground">
                          $18,450 / $25,000
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full bg-primary"
                          style={{ width: '73.8%' }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-muted-foreground">Travel</span>
                        <span className="font-medium text-card-foreground">
                          $12,300 / $15,000
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full bg-accent"
                          style={{ width: '82%' }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Operations
                        </span>
                        <span className="font-medium text-card-foreground">
                          $8,920 / $20,000
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full bg-chart-3"
                          style={{ width: '44.6%' }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent className="mt-0" value="expenses">
            <div className="mb-6">
              <h1 className="mb-2 font-bold text-3xl text-foreground">
                Expenses
              </h1>
            </div>

            {/* Filter Buttons */}
            <div className="mb-4 flex gap-2">
              <Button
                onClick={() => setExpenseFilter('all')}
                variant={expenseFilter === 'all' ? 'default' : 'outline'}
              >
                All
              </Button>
              <Button
                onClick={() => setExpenseFilter('pending')}
                variant={expenseFilter === 'pending' ? 'default' : 'outline'}
              >
                Pending
              </Button>
              <Button
                onClick={() => setExpenseFilter('approved')}
                variant={expenseFilter === 'approved' ? 'default' : 'outline'}
              >
                Approved
              </Button>
              <Button
                onClick={() => setExpenseFilter('rejected')}
                variant={expenseFilter === 'rejected' ? 'default' : 'outline'}
              >
                Rejected
              </Button>
              <Button
                onClick={() => setExpenseFilter('paid')}
                variant={expenseFilter === 'paid' ? 'default' : 'outline'}
              >
                Paid
              </Button>
            </div>

            {/* Filter Description */}
            <p className="mb-6 text-muted-foreground">
              {expenseFilter === 'all' &&
                'Showing all expense reports in the system.'}
              {expenseFilter === 'pending' &&
                'Expenses waiting for approval from administrators.'}
              {expenseFilter === 'approved' &&
                'Expenses that have been approved and are ready for processing.'}
              {expenseFilter === 'rejected' &&
                'Expenses that were not approved.'}
              {expenseFilter === 'paid' &&
                'Expenses that have been reimbursed or paid.'}
            </p>

            {/* Expenses Table based on filter */}
            {expenseFilter === 'all' && <ExpensesTable filterStatus="all" />}
            {expenseFilter === 'pending' && (
              <ExpensesTable filterStatus="pending" />
            )}
            {expenseFilter === 'approved' && (
              <ExpensesTable filterStatus="approved" />
            )}
            {expenseFilter === 'rejected' && (
              <ExpensesTable filterStatus="rejected" />
            )}
            {expenseFilter === 'paid' && <ExpensesTable filterStatus="paid" />}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent className="mt-0" value="reports">
            <div className="mb-6">
              <h1 className="mb-2 font-bold text-3xl text-foreground">
                Reports & Analytics
              </h1>
              <p className="text-muted-foreground">
                Visualize spending trends and generate expense reports.
              </p>
            </div>

            <ReportsFilters />
            <ReportsCharts />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

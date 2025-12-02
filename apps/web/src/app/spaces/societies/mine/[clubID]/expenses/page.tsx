'use client'

import { Alert, AlertDescription } from '@rov/ui/components/alert'
import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@rov/ui/components/tabs'
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
import { ActivityFeed } from '@/components/expenses/activity-feed'
import { ExpensesTable } from '@/components/expenses/expenses-table'
import { Header } from '@/components/expenses/header'
import { ReportsCharts } from '@/components/expenses/reports-charts'
import { ReportsFilters } from '@/components/expenses/reports-filters'
import { StatCard } from '@/components/expenses/stat-card'

export default function HomePage() {
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

        <Tabs className="w-full" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="mb-6 h-12">
            <TabsTrigger className="gap-2 px-6" value="dashboard">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger className="gap-2 px-6" value="expenses">
              <Receipt className="h-4 w-4" />
              Expenses
            </TabsTrigger>
            <TabsTrigger className="gap-2 px-6" value="reports">
              <BarChart3 className="h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="mb-6">
              <h1 className="mb-2 font-bold text-3xl text-foreground">
                Dashboard
              </h1>
              <p className="text-muted-foreground">
                Welcome back! Here's your expense overview.
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
          <TabsContent value="expenses">
            <div className="mb-6">
              <h1 className="mb-2 font-bold text-3xl text-foreground">
                Expenses
              </h1>
              <p className="text-muted-foreground">
                View and manage all your expense reports.
              </p>
            </div>

            <Tabs
              className="w-full"
              onValueChange={setExpenseFilter}
              value={expenseFilter}
            >
              <TabsList className="mb-6">
                <TabsTrigger value="all">All Expenses</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <ExpensesTable filterStatus="all" />
              </TabsContent>
              <TabsContent value="pending">
                <ExpensesTable filterStatus="pending" />
              </TabsContent>
              <TabsContent value="approved">
                <ExpensesTable filterStatus="approved" />
              </TabsContent>
              <TabsContent value="rejected">
                <ExpensesTable filterStatus="rejected" />
              </TabsContent>
              <TabsContent value="paid">
                <ExpensesTable filterStatus="paid" />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
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

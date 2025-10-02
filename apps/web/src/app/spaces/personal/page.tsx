'use client'
import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import {
  Activity,
  Apple,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Heart,
  Home,
  PiggyBank,
  Plus,
  TrendingUp
} from 'lucide-react'
import { type SidebarSection, SpaceSidebar } from '@/components/space-sidebar'
import { Navbar } from '@/components/spaces-top-nav'

const sidebarSections: SidebarSection[] = [
  {
    id: 'finance',
    label: 'Finance Management',
    icon: DollarSign,
    href: '/personal#finance'
  },
  {
    id: 'health',
    label: 'Health & Wellness',
    icon: Heart,
    href: '/personal#health'
  },
  {
    id: 'habits',
    label: 'Daily Habits',
    icon: TrendingUp,
    href: '/personal#habits'
  },
  {
    id: 'living',
    label: 'Living Essentials',
    icon: Home,
    href: '/personal#living'
  }
]

export default function PersonalPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex">
        <SpaceSidebar
          sections={sidebarSections}
          spaceColor="from-amber-500 to-orange-500"
        />

        <main className="flex-1 px-6 py-8">
          <div className="mb-8">
            <h2 className="mb-2 font-bold text-3xl text-foreground">
              Personal
            </h2>
            <p className="text-muted-foreground">
              Manage your finances, health, and personal life
            </p>
          </div>

          {/* Quick Stats */}
          <div className="mb-8 grid gap-6 md:grid-cols-4">
            <Card className="border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">
                    Monthly Budget
                  </p>
                  <p className="mt-1 font-bold text-3xl text-foreground">
                    $2,450
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-chart-1" />
              </div>
            </Card>

            <Card className="border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Savings Goal</p>
                  <p className="mt-1 font-bold text-3xl text-foreground">68%</p>
                </div>
                <PiggyBank className="h-8 w-8 text-chart-2" />
              </div>
            </Card>

            <Card className="border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">
                    Workout Streak
                  </p>
                  <p className="mt-1 font-bold text-3xl text-foreground">12</p>
                </div>
                <Activity className="h-8 w-8 text-chart-3" />
              </div>
            </Card>

            <Card className="border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">
                    Habits Tracked
                  </p>
                  <p className="mt-1 font-bold text-3xl text-foreground">8</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-chart-4" />
              </div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Finance Management */}
            <Card
              className="border-border bg-card p-6 lg:col-span-2"
              id="finance"
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-semibold text-foreground text-lg">
                  Finance Management
                </h3>
                <Button className="gap-2" size="sm">
                  <Plus className="h-4 w-4" />
                  Add Transaction
                </Button>
              </div>

              <div className="mb-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-border bg-card/50 p-4">
                  <p className="text-muted-foreground text-sm">Total Balance</p>
                  <p className="mt-1 font-bold text-2xl text-foreground">
                    $8,450
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-green-500 text-xs">
                    <ArrowUpRight className="h-3 w-3" />
                    +12% from last month
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-card/50 p-4">
                  <p className="text-muted-foreground text-sm">
                    Monthly Income
                  </p>
                  <p className="mt-1 font-bold text-2xl text-foreground">
                    $3,200
                  </p>
                  <p className="mt-1 text-muted-foreground text-xs">
                    From part-time work
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-card/50 p-4">
                  <p className="text-muted-foreground text-sm">
                    Monthly Expenses
                  </p>
                  <p className="mt-1 font-bold text-2xl text-foreground">
                    $2,150
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-red-500 text-xs">
                    <ArrowDownRight className="h-3 w-3" />
                    +5% from last month
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-foreground text-sm">
                  Recent Transactions
                </h4>

                <div className="rounded-lg border border-border bg-card/50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                        <CreditCard className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          Grocery Shopping
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Today, 2:30 PM
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-red-500">-$85.50</p>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card/50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                        <ArrowUpRight className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          Part-time Salary
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Yesterday, 9:00 AM
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-green-500">+$800.00</p>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card/50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                        <Home className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          Rent Payment
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Dec 1, 2024
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-red-500">-$650.00</p>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card/50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                        <CreditCard className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Textbooks</p>
                        <p className="text-muted-foreground text-xs">
                          Nov 28, 2024
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-red-500">-$245.00</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Budget Breakdown */}
            <Card className="border-border bg-card p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-semibold text-foreground text-lg">
                  Budget Breakdown
                </h3>
                <DollarSign className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex justify-between">
                    <span className="text-muted-foreground text-sm">
                      Housing
                    </span>
                    <span className="font-medium text-foreground text-sm">
                      $650 / $700
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[93%] rounded-full bg-chart-1" />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between">
                    <span className="text-muted-foreground text-sm">Food</span>
                    <span className="font-medium text-foreground text-sm">
                      $420 / $500
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[84%] rounded-full bg-chart-2" />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between">
                    <span className="text-muted-foreground text-sm">
                      Transportation
                    </span>
                    <span className="font-medium text-foreground text-sm">
                      $180 / $200
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[90%] rounded-full bg-chart-3" />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between">
                    <span className="text-muted-foreground text-sm">
                      Entertainment
                    </span>
                    <span className="font-medium text-foreground text-sm">
                      $95 / $150
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[63%] rounded-full bg-chart-4" />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between">
                    <span className="text-muted-foreground text-sm">
                      Utilities
                    </span>
                    <span className="font-medium text-foreground text-sm">
                      $120 / $150
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[80%] rounded-full bg-chart-1" />
                  </div>
                </div>

                <div className="mt-6 rounded-lg border border-chart-2/20 bg-chart-2/5 p-4">
                  <p className="text-muted-foreground text-sm">
                    Remaining Budget
                  </p>
                  <p className="mt-1 font-bold text-2xl text-foreground">
                    $785
                  </p>
                </div>
              </div>
            </Card>

            {/* Health & Wellness */}
            <Card
              className="border-border bg-card p-6 lg:col-span-2"
              id="health"
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-semibold text-foreground text-lg">
                  Health & Wellness
                </h3>
                <Button
                  className="gap-2 bg-transparent"
                  size="sm"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                  Log Activity
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-border bg-card/50 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
                      <Activity className="h-5 w-5 text-chart-3" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Workout Streak
                      </p>
                      <p className="text-muted-foreground text-xs">
                        12 days in a row
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Keep it up! You're doing great.
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-card/50 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/10">
                      <Apple className="h-5 w-5 text-chart-1" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Nutrition</p>
                      <p className="text-muted-foreground text-xs">
                        2,150 / 2,400 cal
                      </p>
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[90%] rounded-full bg-chart-1" />
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card/50 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
                      <Heart className="h-5 w-5 text-chart-2" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Sleep Quality
                      </p>
                      <p className="text-muted-foreground text-xs">
                        7.5 hours avg
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Good sleep pattern this week
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-card/50 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
                      <Activity className="h-5 w-5 text-chart-4" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Steps Today</p>
                      <p className="text-muted-foreground text-xs">
                        8,450 / 10,000
                      </p>
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[85%] rounded-full bg-chart-4" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Daily Habits */}
            <Card className="border-border bg-card p-6" id="habits">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-semibold text-foreground text-lg">
                  Daily Habits
                </h3>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-green-500/20 bg-green-500/5 p-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-foreground text-sm">
                      Morning Meditation
                    </span>
                  </div>
                  <span className="text-green-500 text-xs">12 day streak</span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-green-500/20 bg-green-500/5 p-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-foreground text-sm">
                      Drink 8 Glasses Water
                    </span>
                  </div>
                  <span className="text-green-500 text-xs">8 day streak</span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border bg-card/50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                    <span className="font-medium text-foreground text-sm">
                      Read 30 Minutes
                    </span>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    Not yet today
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-green-500/20 bg-green-500/5 p-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-foreground text-sm">
                      Exercise
                    </span>
                  </div>
                  <span className="text-green-500 text-xs">12 day streak</span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border bg-card/50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                    <span className="font-medium text-foreground text-sm">
                      Journal Entry
                    </span>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    Not yet today
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-green-500/20 bg-green-500/5 p-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-foreground text-sm">
                      No Social Media
                    </span>
                  </div>
                  <span className="text-green-500 text-xs">5 day streak</span>
                </div>
              </div>
            </Card>

            {/* Living Essentials */}
            <Card
              className="border-border bg-card p-6 lg:col-span-3"
              id="living"
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-semibold text-foreground text-lg">
                  Living Essentials
                </h3>
                <Button
                  className="gap-2 bg-transparent"
                  size="sm"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-border bg-card/50 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/10">
                      <Home className="h-5 w-5 text-chart-1" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Rent</p>
                      <p className="text-muted-foreground text-xs">
                        Due: 1st of month
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    $650/month • Paid for December
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-card/50 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
                      <Activity className="h-5 w-5 text-chart-2" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Utilities</p>
                      <p className="text-muted-foreground text-xs">
                        Electricity & Water
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    ~$120/month • Auto-pay enabled
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-card/50 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
                      <CreditCard className="h-5 w-5 text-chart-3" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Internet</p>
                      <p className="text-muted-foreground text-xs">
                        High-speed fiber
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    $60/month • Paid until Jan 15
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-card/50 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
                      <Apple className="h-5 w-5 text-chart-4" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Groceries</p>
                      <p className="text-muted-foreground text-xs">
                        Weekly shopping
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    ~$100/week • Last shopped 2 days ago
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-card/50 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/10">
                      <Activity className="h-5 w-5 text-chart-1" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Laundry</p>
                      <p className="text-muted-foreground text-xs">
                        Laundromat card
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    $25 balance • Refill when low
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-card/50 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
                      <Heart className="h-5 w-5 text-chart-2" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Health Insurance
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Student plan
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Covered by university
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

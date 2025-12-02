'use client'

import { Card } from '@rov/ui/components/card'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

const monthlyData = [
  { month: 'Jan', amount: 24_580 },
  { month: 'Feb', amount: 31_240 },
  { month: 'Mar', amount: 28_920 },
  { month: 'Apr', amount: 35_680 },
  { month: 'May', amount: 29_450 },
  { month: 'Jun', amount: 33_210 }
]

const categoryData = [
  { name: 'Travel', value: 12_500, color: 'var(--chart-1)' },
  { name: 'Meals', value: 8200, color: 'var(--chart-2)' },
  { name: 'Supplies', value: 4300, color: 'var(--chart-3)' },
  { name: 'Software', value: 6800, color: 'var(--chart-4)' },
  { name: 'Marketing', value: 9200, color: 'var(--chart-5)' }
]

const trendData = [
  { date: 'Week 1', approved: 8400, pending: 2100, rejected: 500 },
  { date: 'Week 2', approved: 9200, pending: 1800, rejected: 600 },
  { date: 'Week 3', approved: 7800, pending: 2400, rejected: 400 },
  { date: 'Week 4', approved: 10_200, pending: 1900, rejected: 700 }
]

const topSpenders = [
  { name: 'Sarah Smith', amount: 8450, expenses: 23 },
  { name: 'John Doe', amount: 7320, expenses: 18 },
  { name: 'Mike Johnson', amount: 6890, expenses: 21 },
  { name: 'Emily Chen', amount: 5670, expenses: 15 },
  { name: 'David Lee', amount: 5240, expenses: 12 }
]

export function ReportsCharts() {
  return (
    <div className="space-y-6">
      {/* Monthly Spending */}
      <Card className="p-6">
        <h3 className="mb-4 font-semibold text-card-foreground text-lg">
          Monthly Spending Trend
        </h3>
        <ResponsiveContainer height={300} width="100%">
          <BarChart data={monthlyData}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="month" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--card-foreground)'
              }}
              formatter={(value: number) => `$${value.toLocaleString()}`}
            />
            <Bar dataKey="amount" fill="var(--primary)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Category Breakdown */}
        <Card className="p-6">
          <h3 className="mb-4 font-semibold text-card-foreground text-lg">
            Expenses by Category
          </h3>
          <ResponsiveContainer height={300} width="100%">
            <PieChart>
              <Pie
                cx="50%"
                cy="50%"
                data={categoryData}
                dataKey="value"
                fill="var(--primary)"
                label={({ name, percent }) =>
                  `${name} ${(percent ?? 0 * 100).toFixed(0)}%`
                }
                labelLine={false}
                outerRadius={100}
              >
                {categoryData.map((entry) => (
                  <Cell fill={entry.color} key={`cell-${entry.name}`} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--card-foreground)'
                }}
                formatter={(value: number) => `$${value.toLocaleString()}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Approval Status Trend */}
        <Card className="p-6">
          <h3 className="mb-4 font-semibold text-card-foreground text-lg">
            Approval Status Trend
          </h3>
          <ResponsiveContainer height={300} width="100%">
            <LineChart data={trendData}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--card-foreground)'
                }}
                formatter={(value: number) => `$${value.toLocaleString()}`}
              />
              <Legend />
              <Line
                dataKey="approved"
                dot={{ r: 4 }}
                stroke="var(--chart-2)"
                strokeWidth={2}
                type="monotone"
              />
              <Line
                dataKey="pending"
                dot={{ r: 4 }}
                stroke="var(--chart-3)"
                strokeWidth={2}
                type="monotone"
              />
              <Line
                dataKey="rejected"
                dot={{ r: 4 }}
                stroke="var(--chart-4)"
                strokeWidth={2}
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Spenders */}
      <Card className="p-6">
        <h3 className="mb-4 font-semibold text-card-foreground text-lg">
          Top Spenders
        </h3>
        <div className="space-y-4">
          {topSpenders.map((spender, index) => (
            <div className="flex items-center gap-4" key={spender.name}>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary text-sm">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-medium text-card-foreground">
                    {spender.name}
                  </span>
                  <span className="font-semibold text-card-foreground">
                    ${spender.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    {spender.expenses} expenses
                  </span>
                  <div className="h-2 w-48 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(spender.amount / 10_000) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

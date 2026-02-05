'use client'

import { Button } from '@rov/ui/components/button'
import { Card } from '@rov/ui/components/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@rov/ui/components/select'
import { Calendar, Download } from 'lucide-react'

export function ReportsFilters() {
  return (
    <Card className="mb-6 p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-card-foreground text-sm">
            Time Period:
          </span>
        </div>

        <Select defaultValue="30">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
            <SelectItem value="custom">Custom range</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="engineering">Engineering</SelectItem>
            <SelectItem value="operations">Operations</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex gap-2">
          <Button className="gap-2 bg-transparent" size="sm" variant="outline">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
          <Button className="gap-2 bg-transparent" size="sm" variant="outline">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>
    </Card>
  )
}

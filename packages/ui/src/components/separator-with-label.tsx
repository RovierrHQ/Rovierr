'use client'

import { cn } from '@rov/ui/lib/utils'
import { Separator } from './separator'

interface SeparatorWithLabelProps {
  label: string
  className?: string
}

export function SeparatorWithLabel({
  label,
  className
}: SeparatorWithLabelProps) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <Separator className="flex-1" />

      <span className="select-none text-muted-foreground text-sm">{label}</span>

      <Separator className="flex-1" />
    </div>
  )
}

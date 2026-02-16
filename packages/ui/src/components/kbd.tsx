import { cn } from '@rov/ui/lib/utils'
import type { HTMLAttributes } from 'react'
import { forwardRef } from 'react'

const Kbd = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <kbd
      className={cn(
        'inline-flex min-h-[20px] items-center justify-center rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground',
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Kbd.displayName = 'Kbd'

const KbdGroup = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      className={cn('inline-flex items-center gap-1', className)}
      ref={ref}
      {...props}
    />
  )
)
KbdGroup.displayName = 'KbdGroup'

export { Kbd, KbdGroup }

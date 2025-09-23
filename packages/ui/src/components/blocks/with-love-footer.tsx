import { cn } from '@rov/ui/lib/utils'
import type React from 'react'

interface WithLoveFooterProps extends React.HTMLAttributes<HTMLElement> {
  className?: string
}

export const WithLoveFooter = ({
  className,
  ...props
}: WithLoveFooterProps) => {
  return (
    <div
      className={cn(
        'flex items-center justify-center border-border border-t py-4 text-muted-foreground text-sm',
        className
      )}
      {...props}
    >
      <p>With ❤️ from Rovierr</p>
    </div>
  )
}

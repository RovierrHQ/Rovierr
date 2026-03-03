import { cn } from '@rov/ui/lib/utils'
import { Link } from '@tanstack/react-router'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean
  href?: string
}

export function MdxCard({
  href,
  className,
  children,
  disabled,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'group relative rounded-lg border p-6 shadow-md transition-shadow hover:shadow-lg',
        disabled && 'cursor-not-allowed opacity-60',
        className
      )}
      {...props}
    >
      <div className="flex flex-col justify-between space-y-4">
        <div className="space-y-2 [&>h3]:!mt-0 [&>h4]:!mt-0 [&>p]:text-muted-foreground">
          {children}
        </div>
      </div>
      {href && (
        <Link className="absolute inset-0" to={disabled ? '#' : href}>
          <span className="sr-only">View</span>
        </Link>
      )}
    </div>
  )
}

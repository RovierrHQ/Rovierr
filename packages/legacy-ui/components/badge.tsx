import { Slot } from '@radix-ui/react-slot'
import { cn } from '@rov/ui/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-md border px-2 py-0.5 font-medium text-xs transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'border-transparent bg-destructive text-white focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90',
        outline:
          'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground'
      },
      tone: {
        default: '',
        soft: `
          rounded-full
          bg-opacity-20
          shadow-none
        `
      }
    },
    compoundVariants: [
      {
        variant: 'default',
        tone: 'soft',
        class:
          'border-transparent bg-primary/10 text-primary hover:bg-primary/20'
      },
      {
        variant: 'secondary',
        tone: 'soft',
        class:
          'border-transparent bg-secondary/10 text-secondary-foreground hover:bg-secondary/20'
      },
      {
        variant: 'destructive',
        tone: 'soft',
        class:
          'border-transparent bg-destructive/10 text-destructive hover:bg-destructive/20'
      },
      {
        variant: 'outline',
        tone: 'soft',
        class: 'bg-accent/10 text-foreground hover:bg-accent/20'
      }
    ],
    defaultVariants: {
      variant: 'default',
      tone: 'default'
    }
  }
)

function Badge({
  className,
  variant,
  tone,
  asChild = false,
  ...props
}: React.ComponentPropsWithoutRef<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      className={cn(badgeVariants({ variant, tone }), className)}
      data-slot="badge"
      {...props}
    />
  )
}

export { Badge, badgeVariants }

'use client'

import { Button, type ButtonProps } from '@rov/ui/components/ui/button'
import { cn } from '@rov/ui/lib/utils'
import { motion } from 'framer-motion'
import { forwardRef } from 'react'

interface HeroProps extends React.HTMLAttributes<HTMLElement> {
  gradient?: boolean
  blur?: boolean
  title: string
  subtitle?: string
  actions?: { label: string; href: string; variant?: ButtonProps['variant'] }[]
  titleClassName?: string
  subtitleClassName?: string
  actionsClassName?: string
}

const Hero = forwardRef<HTMLElement, HeroProps>(
  (
    {
      className,
      gradient = true,
      blur = true,
      title,
      subtitle,
      actions,
      titleClassName,
      subtitleClassName,
      actionsClassName,
      ...props
    },
    ref
  ) => {
    return (
      <section
        className={cn(
          'relative z-0 flex min-h-[80vh] w-full flex-col items-center justify-center overflow-hidden rounded-md bg-background',
          className
        )}
        ref={ref}
        {...props}
      >
        {gradient && (
          <div className="absolute top-0 isolate z-0 flex w-screen flex-1 items-start justify-center">
            {blur && (
              <div className="absolute top-0 z-50 h-48 w-screen bg-transparent opacity-10 backdrop-blur-md" />
            )}

            {/* Main glow */}
            <div className="-translate-y-[-30%] absolute inset-auto z-50 h-36 w-[28rem] rounded-full bg-primary/60 opacity-80 blur-3xl" />

            {/* Lamp effect */}
            <motion.div
              className="-translate-y-[20%] absolute top-0 z-30 h-36 rounded-full bg-primary/60 blur-2xl"
              initial={{ width: '8rem' }}
              transition={{ ease: 'easeInOut', delay: 0.3, duration: 0.8 }}
              viewport={{ once: true }}
              whileInView={{ width: '16rem' }}
            />

            {/* Top line */}
            <motion.div
              className="-translate-y-[-10%] absolute inset-auto z-50 h-0.5 bg-primary/60"
              initial={{ width: '15rem' }}
              transition={{ ease: 'easeInOut', delay: 0.3, duration: 0.8 }}
              viewport={{ once: true }}
              whileInView={{ width: '30rem' }}
            />

            {/* Left gradient cone */}
            <motion.div
              className="absolute inset-auto right-1/2 h-56 w-[30rem] overflow-visible bg-gradient-conic from-primary/60 via-transparent to-transparent [--conic-position:from_70deg_at_center_top]"
              initial={{ opacity: 0.5, width: '15rem' }}
              style={{
                backgroundImage:
                  'conic-gradient(var(--conic-position), var(--tw-gradient-stops))'
              }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: 'easeInOut'
              }}
              whileInView={{ opacity: 1, width: '30rem' }}
            >
              <div className="absolute bottom-0 left-0 z-20 h-40 w-[100%] bg-background [mask-image:linear-gradient(to_top,white,transparent)]" />
              <div className="absolute bottom-0 left-0 z-20 h-[100%] w-40 bg-background [mask-image:linear-gradient(to_right,white,transparent)]" />
            </motion.div>

            {/* Right gradient cone */}
            <motion.div
              className="absolute inset-auto left-1/2 h-56 w-[30rem] bg-gradient-conic from-transparent via-transparent to-primary/60 [--conic-position:from_290deg_at_center_top]"
              initial={{ opacity: 0.5, width: '15rem' }}
              style={{
                backgroundImage:
                  'conic-gradient(var(--conic-position), var(--tw-gradient-stops))'
              }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: 'easeInOut'
              }}
              whileInView={{ opacity: 1, width: '30rem' }}
            >
              <div className="absolute right-0 bottom-0 z-20 h-[100%] w-40 bg-background [mask-image:linear-gradient(to_left,white,transparent)]" />
              <div className="absolute right-0 bottom-0 z-20 h-40 w-[100%] bg-background [mask-image:linear-gradient(to_top,white,transparent)]" />
            </motion.div>
          </div>
        )}

        <motion.div
          className="-translate-y-20 container relative z-50 flex flex-1 flex-col justify-center gap-4 px-5 md:px-10"
          initial={{ y: 100, opacity: 0.5 }}
          transition={{ ease: 'easeInOut', delay: 0.3, duration: 0.8 }}
          viewport={{ once: true }}
          whileInView={{ y: 0, opacity: 1 }}
        >
          <div className="flex flex-col items-center space-y-4 text-center">
            <h1
              className={cn(
                'font-bold text-4xl tracking-tight sm:text-5xl md:text-6xl lg:text-7xl',
                titleClassName
              )}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className={cn(
                  'text-muted-foreground text-xl',
                  subtitleClassName
                )}
              >
                {subtitle}
              </p>
            )}
            {actions && actions.length > 0 && (
              <div className={cn('flex gap-4', actionsClassName)}>
                {actions.map((action, _index) => (
                  <Button
                    asChild
                    key={action.href}
                    variant={action.variant || 'default'}
                  >
                    <a href={action.href}>{action.label}</a>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </section>
    )
  }
)
Hero.displayName = 'Hero'

export { Hero }

import { Progress as ProgressPrimitive } from '@base-ui/react/progress'
import { cn } from '@rov/ui/lib/utils'
import type { ComponentType } from 'react'

const ProgressRoot =
  ProgressPrimitive.Root as ComponentType<ProgressPrimitive.Root.Props>
const ProgressTrackPrimitive =
  ProgressPrimitive.Track as ComponentType<ProgressPrimitive.Track.Props>
const ProgressIndicatorPrimitive =
  ProgressPrimitive.Indicator as ComponentType<ProgressPrimitive.Indicator.Props>
const ProgressLabelPrimitive =
  ProgressPrimitive.Label as ComponentType<ProgressPrimitive.Label.Props>
const ProgressValuePrimitive =
  ProgressPrimitive.Value as ComponentType<ProgressPrimitive.Value.Props>

function Progress({
  className,
  children,
  value,
  ...props
}: ProgressPrimitive.Root.Props) {
  return (
    <ProgressRoot
      className={cn('flex flex-wrap gap-3', className)}
      data-slot="progress"
      value={value}
      {...props}
    >
      {children}
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </ProgressRoot>
  )
}

function ProgressTrack({ className, ...props }: ProgressPrimitive.Track.Props) {
  return (
    <ProgressTrackPrimitive
      className={cn(
        'relative flex h-3 w-full items-center overflow-x-hidden rounded-4xl bg-muted',
        className
      )}
      data-slot="progress-track"
      {...props}
    />
  )
}

function ProgressIndicator({
  className,
  ...props
}: ProgressPrimitive.Indicator.Props) {
  return (
    <ProgressIndicatorPrimitive
      className={cn('h-full bg-primary transition-all', className)}
      data-slot="progress-indicator"
      {...props}
    />
  )
}

function ProgressLabel({ className, ...props }: ProgressPrimitive.Label.Props) {
  return (
    <ProgressLabelPrimitive
      className={cn('text-sm font-medium', className)}
      data-slot="progress-label"
      {...props}
    />
  )
}

function ProgressValue({ className, ...props }: ProgressPrimitive.Value.Props) {
  return (
    <ProgressValuePrimitive
      className={cn(
        'ml-auto text-sm text-muted-foreground tabular-nums',
        className
      )}
      data-slot="progress-value"
      {...props}
    />
  )
}

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue
}

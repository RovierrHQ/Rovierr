'use client'

import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel
} from '@rov/ui/components/field'
import { Slider as SliderBase } from '@rov/ui/components/slider'
import { cn } from 'lib/utils'
import { useMemo } from 'react'
import { useFieldContext } from '../context'

type Props = {
  label?: string
} & React.ComponentProps<typeof SliderBase>

function Slider({
  label,
  min = 0,
  max = 100,
  className,
  disabled,
  ...props
}: Props) {
  const field = useFieldContext<number[]>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  const value = useMemo<number[]>(() => {
    const v = field.state.value
    if (Array.isArray(v) && v.length === 2) return v
    return [min, max]
  }, [field.state.value, min, max])

  return (
    <Field data-invalid={isInvalid} orientation="responsive">
      <FieldContent>
        {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
        <SliderBase
          aria-invalid={isInvalid}
          className={cn('w-full', className)}
          disabled={disabled}
          id={field.name}
          max={max}
          min={min}
          onValueChange={field.handleChange}
          value={value}
          {...props}
        />
        <div
          aria-hidden="true"
          className={cn(
            'mt-2 flex w-full select-none items-center justify-between text-xs',
            { 'text-muted-foreground': Boolean(disabled) }
          )}
        >
          <span>{value[0]}</span>
          <span>{value[1]}</span>
        </div>
      </FieldContent>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}

export default Slider

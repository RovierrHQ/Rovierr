'use client'

import { Field, FieldError, FieldLabel } from '@rov/ui/components/field'
import { Switch as SwitchBase } from '@rov/ui/components/switch'
import { useFieldContext } from '../context'

type Props = {
  label?: string
  containerClassName?: string
  orientation?: 'horizontal' | 'vertical' | 'responsive'
} & React.ComponentProps<typeof SwitchBase>

function Switch({
  label,
  containerClassName = 'border rounded-lg p-4',
  orientation = 'horizontal',
  ...props
}: Props) {
  const field = useFieldContext<boolean>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  return (
    <Field
      className={containerClassName}
      data-invalid={isInvalid}
      orientation={orientation}
    >
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <SwitchBase
        checked={field.state.value}
        disabled={props.disabled}
        onCheckedChange={field.handleChange}
        {...props}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}

export default Switch

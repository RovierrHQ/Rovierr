'use client'

import { Checkbox as CheckboxBase } from '@rov/ui/components/checkbox'
import { Field, FieldError, FieldLabel } from '@rov/ui/components/field'
import { useFieldContext } from '../context'

type Props = {
  label?: string
  containerClassName?: string
  orientation?: 'horizontal' | 'vertical' | 'responsive'
} & React.ComponentProps<typeof CheckboxBase>

function Checkbox({
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
      <CheckboxBase
        checked={field.state.value}
        disabled={props.disabled}
        onCheckedChange={(checked) => {
          if (typeof checked === 'boolean') {
            field.handleChange(checked)
          }
        }}
        {...props}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}

export default Checkbox

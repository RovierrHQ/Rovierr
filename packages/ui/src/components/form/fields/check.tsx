'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { useFieldContext } from '../context'

type Props = {
  label?: string
}

function Check({ label }: Props) {
  const field = useFieldContext<boolean>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  return (
    <Field data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <Checkbox
        checked={field.state.value}
        onCheckedChange={(checked) => field.handleChange(checked === true)}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}

export default Check

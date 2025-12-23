'use client'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel
} from '@rov/ui/components/field'
import { PhoneInput } from '@rov/ui/components/phone-input'
import type { ComponentProps } from 'react'
import { useFieldContext } from '../context'

type Props = {
  label?: string
  description?: string
} & ComponentProps<typeof PhoneInput>

function Phone({ label, placeholder, description, ...props }: Props) {
  const field = useFieldContext<string | undefined>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  return (
    <Field data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <PhoneInput
        aria-invalid={isInvalid}
        autoComplete={field.name}
        id={field.name}
        name={field.name}
        onBlur={field.handleBlur}
        onChange={(value) => field.handleChange(value || undefined)}
        placeholder={placeholder}
        value={field.state.value || undefined}
        {...props}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
export default Phone

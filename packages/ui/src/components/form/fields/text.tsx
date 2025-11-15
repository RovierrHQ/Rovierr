'use client'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel
} from '@rov/ui/components/field'
import { Input } from '@rov/ui/components/input'
import type { ComponentProps } from 'react'
import { useFieldContext } from '../context'

type Props = {
  label?: string
  description?: string
} & ComponentProps<'input'>

function Text({ label, placeholder, description, ...props }: Props) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  return (
    <Field data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <Input
        aria-invalid={isInvalid}
        autoComplete={field.name}
        id={field.name}
        name={field.name}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder={placeholder}
        value={field.state.value}
        {...props}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
export default Text

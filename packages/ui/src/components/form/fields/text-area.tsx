'use client'

import type { ComponentProps } from 'react'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel
} from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { useFieldContext } from '../context'

type Props = {
  label?: string
  description?: string
} & ComponentProps<'textarea'>

function TextArea({ label, placeholder, description, ...props }: Props) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  return (
    <Field data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <Textarea
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
export default TextArea

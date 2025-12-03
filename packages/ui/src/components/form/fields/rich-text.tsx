'use client'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel
} from '@rov/ui/components/field'
import { RichTextEditor } from '../../rich-text-editor'
import { useFieldContext } from '../context'

type Props = {
  label?: string
  description?: string
  placeholder?: string
  maxLength?: number
}

function RichText({ label, placeholder, description, maxLength }: Props) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <RichTextEditor
        maxLength={maxLength}
        onChange={(html: string) => field.handleChange(html)}
        placeholder={placeholder}
        value={field.state.value || ''}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}

export default RichText

'use client'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel
} from '@rov/ui/components/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText
} from '@rov/ui/components/input-group'
import { useFieldContext } from '../context'

type Props = {
  label?: string
  placeholder?: string
  description?: string
  unit?: string
  onValueChange?: (value: string) => void
}

export default function TextWithUnit({
  label,
  placeholder,
  description,
  unit,
  onValueChange
}: Props) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  const handleChange = (val: string) => {
    if (typeof onValueChange === 'function') {
      onValueChange(val)
    } else {
      field.handleChange(val)
    }
  }

  return (
    <Field data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <InputGroup>
        <InputGroupInput
          aria-invalid={isInvalid}
          autoComplete={field.name}
          id={field.name}
          name={field.name}
          onBlur={field.handleBlur}
          onChange={(e) => {
            handleChange(e.target.value)
          }}
          placeholder={placeholder}
          value={field.state.value}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupText>{unit}</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}

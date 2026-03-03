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
import type { ComponentProps } from 'react'
import { useFieldContext } from '../context'

type Props = {
  label?: string
  description?: string
  start?: string | React.ReactNode | (() => React.ReactNode)
  end?: string | React.ReactNode | (() => React.ReactNode)
} & ComponentProps<'input'>

function Text({
  label,
  placeholder,
  end,
  start,
  description,
  ...props
}: Props) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
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
          onChange={(e) => field.handleChange(e.target.value)}
          placeholder={placeholder}
          value={field.state.value}
          {...props}
        />
        {end && (
          <InputGroupAddon align="inline-end">
            {typeof end === 'string' ? (
              <InputGroupText>{end}</InputGroupText>
            ) : typeof end === 'function' ? (
              end()
            ) : (
              end
            )}
          </InputGroupAddon>
        )}
        {start && (
          <InputGroupAddon align="inline-start">
            {typeof start === 'string' ? (
              <InputGroupText>{start}</InputGroupText>
            ) : typeof start === 'function' ? (
              start()
            ) : (
              start
            )}
          </InputGroupAddon>
        )}
      </InputGroup>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
export default Text

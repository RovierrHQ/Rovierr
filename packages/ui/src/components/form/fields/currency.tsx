'use client'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel
} from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText
} from '@/components/ui/input-group'
import { useFieldContext } from '../context'

export const formatCurrency = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return ''
  const stringValue = typeof value === 'number' ? String(value) : value
  if (stringValue === '') return ''
  // Remove any non-numeric characters except decimal point
  const numericValue = stringValue.replace(/[^0-9.]/g, '')

  // Handle empty or invalid input
  if (!numericValue) {
    return ''
  }

  // Ensure only one decimal point
  const parts = numericValue.split('.')
  if (parts.length > 2) {
    return `${parts[0]}.${parts[1]}`
  }

  // Format with commas for thousands
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  // Return formatted value, preserving decimal portion if it exists
  return parts.length === 2 ? parts.join('.') : parts[0]
}

type Props = {
  label?: string
  placeholder?: string
  description?: string
  onValueChange?: (value: string) => void
}

/**
 * Cleans a number value by removing commas and checking for valid numeric input.
 * @param value - The string value to clean.
 * @returns The cleaned number value or undefined if the value is not a valid number.
 */
export const cleanNumberValue = (
  value: string | number | null | undefined
): number | undefined => {
  if (value === null || value === undefined || value === '') {
    return
  }
  const stringValue = typeof value === 'number' ? String(value) : value
  // Remove commas and clean the number
  const cleanValue = stringValue.replace(/,/g, '').trim()
  const numberValue = Number(cleanValue)
  if (Number.isNaN(numberValue)) {
    return
  }
  return numberValue
}

export default function Currency({
  label,
  placeholder,
  description,
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
            const value = e.target.value
            const formattedValue = formatCurrency(value)
            e.target.value = formattedValue
            const numericValue = cleanNumberValue(value)
            if (numericValue === undefined) {
              handleChange('')
            } else {
              handleChange(numericValue.toString())
            }
          }}
          placeholder={placeholder}
          value={formatCurrency(field.state.value)}
        />
        <InputGroupAddon>
          <InputGroupText>$</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}

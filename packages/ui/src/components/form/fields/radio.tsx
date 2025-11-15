'use client'

import { Field, FieldError, FieldLabel } from '@rov/ui/components/field'
import {
  RadioGroup as RadioGroupContainer,
  RadioGroupItem
} from '@rov/ui/components/radio-group'
import { useFieldContext } from '../context'

type Option =
  | {
      label: string
      value: string
    }
  | string

type Props = {
  label?: string
  disabled?: boolean
  options: Option[]
} & React.ComponentProps<typeof RadioGroupContainer>

function RadioGroup({ label, disabled, options, ...props }: Props) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  const getVal = (o: Option) => {
    if (typeof o === 'string') {
      return o
    }
    return o.value
  }
  const getLabel = (o: Option) => {
    if (typeof o === 'string') {
      return o
    }
    return o.label
  }
  return (
    <Field data-invalid={isInvalid} orientation="responsive">
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <RadioGroupContainer
        className="flex flex-col space-y-1"
        disabled={disabled}
        name={field.name}
        onValueChange={field.handleChange}
        value={field.state.value}
        {...props}
      >
        {options.map((option) => (
          <RadioGroupItem key={getVal(option)} value={getVal(option)}>
            {getLabel(option)}
          </RadioGroupItem>
        ))}
      </RadioGroupContainer>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}

export default RadioGroup

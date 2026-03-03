'use client'

import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel
} from '@rov/ui/components/field'
import {
  Select as SelectBase,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@rov/ui/components/select'
import { useFieldContext } from '../context'

type Option =
  | {
      label: string
      value: string
      icon?: React.ReactNode
    }
  | string

type Props = {
  label?: string
  placeholder: string
  options: Option[]
} & React.ComponentProps<typeof SelectBase>
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
const getIcon = (o: Option) => {
  if (typeof o === 'string') {
    return null
  }
  return o.icon
}
function Select({ label, placeholder, options, ...props }: Props) {
  const {
    onValueChange,
    value,
    multiple: _multiple,
    defaultValue: _defaultValue,
    ...rest
  } = props
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  const currentValue = (value as string | undefined) ?? field.state.value
  const selectedOption = options.find(
    (option) => getVal(option) === currentValue
  )
  const selectedIcon = selectedOption ? getIcon(selectedOption) : null

  const handleChange = (val: string | null) => {
    const stringVal = val as string
    field.handleChange(stringVal)
    if (onValueChange && typeof onValueChange === 'function') {
      // Call with the value only - if it expects more args, they'll be undefined
      ;(onValueChange as (value: string | null) => void)(val)
    }
  }
  return (
    <Field data-invalid={isInvalid} orientation="responsive">
      <FieldContent>
        {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
        <SelectBase<string>
          name={field.name}
          {...rest}
          onValueChange={handleChange}
          value={currentValue}
        >
          <SelectTrigger
            aria-invalid={isInvalid}
            className="w-full min-w-[120px]"
            id={field.name}
          >
            <SelectValue placeholder={placeholder}>
              {selectedIcon && (
                <span className="flex items-center">{selectedIcon}</span>
              )}
              {selectedOption && getLabel(selectedOption)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent
            align="start"
            alignOffset={0}
            side="bottom"
            sideOffset={4}
          >
            {options.map((option) => {
              const icon = getIcon(option)
              return (
                <SelectItem key={getVal(option)} value={getVal(option)}>
                  {icon && <span className="flex items-center">{icon}</span>}
                  {getLabel(option)}
                </SelectItem>
              )
            })}
          </SelectContent>
          {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </SelectBase>
      </FieldContent>
    </Field>
  )
}

export default Select

'use client'

import { Calendar as CalendarBase } from '@rov/ui/components/calendar'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel
} from '@rov/ui/components/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from '@rov/ui/components/input-group'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@rov/ui/components/popover'
import { CalendarIcon } from 'lucide-react'
import * as React from 'react'
import { useFieldContext } from '../context'

function formatDate(date: Date | undefined) {
  if (!date) {
    return ''
  }

  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !Number.isNaN(date.getTime())
}

type Props = {
  label?: string
  placeholder?: string
  description?: string
}

export default function Calendar({ label, placeholder, description }: Props) {
  const field = useFieldContext<Date | undefined>()
  const [open, setOpen] = React.useState(false)
  const [month, setMonth] = React.useState<Date | undefined>(field.state.value)
  const [value, setValue] = React.useState(formatDate(field.state.value))
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  return (
    <Field className="flex flex-col gap-3" data-invalid={isInvalid}>
      {label && (
        <FieldLabel className="px-1" htmlFor={field.name}>
          {label}
        </FieldLabel>
      )}

      <InputGroup>
        <InputGroupInput
          aria-invalid={isInvalid}
          id={field.name}
          name={field.name}
          onBlur={field.handleBlur}
          onChange={(e) => {
            const newDate = new Date(e.target.value)
            setValue(e.target.value)
            if (isValidDate(newDate)) {
              field.handleChange(newDate)
              setMonth(newDate)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setOpen(true)
            }
          }}
          placeholder={placeholder}
          value={value}
        />
        <InputGroupAddon align="inline-end">
          <Popover onOpenChange={setOpen} open={open}>
            <PopoverTrigger asChild>
              <InputGroupButton id="date-picker" variant="ghost">
                <CalendarIcon className="size-3.5" />
                <span className="sr-only">Select date</span>
              </InputGroupButton>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              alignOffset={-8}
              className="w-auto overflow-hidden p-0"
              sideOffset={10}
            >
              <CalendarBase
                captionLayout="dropdown"
                mode="single"
                month={month}
                onMonthChange={setMonth}
                onSelect={(newDate) => {
                  field.handleChange(newDate)
                  setValue(formatDate(newDate))
                  setOpen(false)
                }}
                selected={field.state.value}
              />
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
        {description && <FieldDescription>{description}</FieldDescription>}
        {isInvalid && <FieldError errors={field.state.meta.errors} />}
      </InputGroup>
    </Field>
  )
}

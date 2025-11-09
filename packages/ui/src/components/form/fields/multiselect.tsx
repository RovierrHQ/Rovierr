'use client'

import { Badge } from '@rov/ui/components/badge'
import { Checkbox } from '@rov/ui/components/checkbox'
import { Field, FieldError, FieldLabel } from '@rov/ui/components/field'
import { Label } from '@rov/ui/components/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@rov/ui/components/popover'
import { cn } from 'lib/utils'
import { ChevronDownIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useFieldContext } from '../context'

type Option =
  | {
      label: string
      value: string
    }
  | string

type Props = {
  label?: string
  placeholder: string
  options: Option[]
  disabled?: boolean
  className?: string
}

const getVal = (o: Option) => (typeof o === 'string' ? o : o.value)
const getLabel = (o: Option) => (typeof o === 'string' ? o : o.label)

function MultiSelect({
  label,
  placeholder,
  options,
  disabled,
  className
}: Props) {
  const field = useFieldContext<Array<{ value: string; label: string }>>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  const [open, setOpen] = useState(false)

  const selectedItems = useMemo(
    () => field.state.value ?? [],
    [field.state.value]
  )

  const labelByValue = useMemo(() => {
    const map = new Map<string, string>()
    for (const opt of options) {
      map.set(getVal(opt), getLabel(opt))
    }
    return map
  }, [options])

  const toggleValue = (value: string, checked: boolean | 'indeterminate') => {
    field.handleChange((prev) => {
      const current = [...(prev ?? [])]
      const exists = current.some((it) => it.value === value)
      if (checked && !exists) {
        current.push({ value, label: labelByValue.get(value) ?? value })
        return current
      }
      if (!checked && exists) {
        return current.filter((it) => it.value !== value)
      }
      return current
    })
  }

  return (
    <Field data-invalid={isInvalid} orientation="responsive">
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}

      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <button
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-invalid={isInvalid}
            className={cn(
              'flex w-fit items-center justify-between gap-2 whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:hover:bg-input/50',
              'min-w-[180px]',
              className
            )}
            disabled={disabled}
            id={field.name}
            type="button"
          >
            <span className="flex min-h-5 flex-1 flex-wrap items-center gap-1 text-left">
              {selectedItems.length > 0 ? (
                selectedItems.map((it) => (
                  <Badge key={it.value} variant="secondary">
                    {it.label ?? labelByValue.get(it.value) ?? it.value}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </span>
            <ChevronDownIcon className="size-4 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[240px] p-1">
          <div className="max-h-64 overflow-y-auto">
            {options.map((option) => {
              const value = getVal(option)
              const optLabel = getLabel(option)
              const id = `${field.name}-${value}`
              const isChecked = selectedItems.some((it) => it.value === value)
              return (
                <div
                  className="flex items-center gap-3 rounded-sm p-2 hover:bg-accent"
                  key={value}
                >
                  <Checkbox
                    checked={isChecked}
                    disabled={disabled}
                    id={id}
                    onCheckedChange={(checked) => toggleValue(value, checked)}
                  />
                  <Label className="text-sm leading-none" htmlFor={id}>
                    {optLabel}
                  </Label>
                </div>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}

export default MultiSelect

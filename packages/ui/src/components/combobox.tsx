import { Button } from '@rov/ui/components/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@rov/ui/components/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@rov/ui/components/popover'
import { cn } from '@rov/ui/lib/utils'
import { Check, ChevronDown } from 'lucide-react'
import { forwardRef, useState } from 'react'

export type ComboboxOption = {
  value: string
  label: React.ReactNode
}

type ComboboxPropsSingle = {
  options: ComboboxOption[]
  emptyText?: string
  clearable?: boolean
  selectPlaceholder?: string
  searchPlaceholder?: string
  multiple?: false
  value?: string
  onValueChange?: (value: string) => void
}

type ComboboxPropsMultiple = {
  options: ComboboxOption[]
  emptyText?: string
  clearable?: boolean
  selectPlaceholder?: string
  searchPlaceholder?: string
  multiple: true
  value?: string[]
  onValueChange?: (value: string[]) => void
}

export type ComboboxProps = ComboboxPropsSingle | ComboboxPropsMultiple

const handleSingleSelect = (
  props: ComboboxPropsSingle,
  option: ComboboxOption
) => {
  if (props.clearable) {
    props.onValueChange?.(option.value === props.value ? '' : option.value)
  } else {
    props.onValueChange?.(option.value)
  }
}

const handleMultipleSelect = (
  props: ComboboxPropsMultiple,
  option: ComboboxOption
) => {
  if (props.value?.includes(option.value)) {
    if (!props.clearable && props.value.length === 1) return false
    props.onValueChange?.(props.value.filter((value) => value !== option.value))
  } else {
    props.onValueChange?.([...(props.value ?? []), option.value])
  }
}

// eslint-disable-next-line react/display-name
export const Combobox = forwardRef(
  (props: ComboboxProps, ref: React.ForwardedRef<HTMLInputElement>) => {
    const [open, setOpen] = useState(false)

    return (
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          {/** biome-ignore lint/a11y/useSemanticElements: b*/}
          <Button
            aria-expanded={open}
            className="w-full justify-between hover:bg-secondary/20 active:scale-100"
            role="combobox"
            variant="outline"
          >
            <span className="line-clamp-1 text-left font-normal">
              {props.multiple && props.value && props.value.length > 0 && (
                <span className="mr-2">{props.value.join(', ')}</span>
              )}

              {!props.multiple &&
                props.value &&
                props.value !== '' &&
                props.options.find((option) => option.value === props.value)
                  ?.label}

              {!props.value ||
                (props.value.length === 0 &&
                  (props.selectPlaceholder ?? 'Select an option'))}
            </span>
            <ChevronDown
              className={cn(
                'ml-2 size-4 shrink-0 rotate-0 opacity-50 transition-transform',
                open && 'rotate-180'
              )}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="p-0">
          <Command>
            <CommandInput
              placeholder={props.searchPlaceholder ?? 'Search for an option'}
              ref={ref}
            />
            <CommandList>
              <CommandEmpty>
                {props.emptyText ?? 'No results found'}
              </CommandEmpty>
              <CommandGroup>
                {props.options.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={(selectedValue) => {
                      const foundOption = props.options.find(
                        (o) => o.value.toLowerCase().trim() === selectedValue
                      )

                      if (!foundOption) return null

                      if (props.multiple) {
                        handleMultipleSelect(props, foundOption)
                      } else {
                        handleSingleSelect(props, foundOption)

                        setOpen(false)
                      }
                    }}
                    value={option.value.toLowerCase().trim()}
                  >
                    <Check
                      className={cn(
                        'mr-2 size-4 opacity-0',
                        !props.multiple &&
                          props.value === option.value &&
                          'opacity-100',
                        props.multiple &&
                          props.value?.includes(option.value) &&
                          'opacity-100'
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }
)

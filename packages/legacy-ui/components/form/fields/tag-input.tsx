'use client'

import { Badge } from '@rov/ui/components/badge'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel
} from '@rov/ui/components/field'
import { Input } from '@rov/ui/components/input'
import { XIcon } from 'lucide-react'
import { type ComponentProps, type KeyboardEvent, useRef } from 'react'
import { useFieldContext } from '../context'

type Props = {
  label?: string
  description?: string
  placeholder?: string
} & Omit<ComponentProps<'input'>, 'value' | 'onChange'>

function TagInput({ label, placeholder, description, ...props }: Props) {
  const field = useFieldContext<string[]>()
  const inputRef = useRef<HTMLInputElement>(null)
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  const tags = field.state.value ?? []

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      field.handleChange([...tags, trimmedTag])
    }
  }

  const removeTag = (tagToRemove: string) => {
    field.handleChange(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputRef.current) {
      e.preventDefault()
      const value = inputRef.current.value
      if (value) {
        addTag(value)
        inputRef.current.value = ''
      }
    }
  }

  return (
    <Field data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <div className="space-y-2">
        <Input
          aria-invalid={isInvalid}
          autoComplete={field.name}
          id={field.name}
          name={field.name}
          onBlur={field.handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          ref={inputRef}
          {...props}
        />
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge className="gap-1 pr-1" key={tag} variant="secondary">
                <span>{tag}</span>
                <button
                  className="rounded-full p-0.5 transition-colors hover:bg-secondary-foreground/20"
                  onClick={() => removeTag(tag)}
                  type="button"
                >
                  <XIcon className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}

export default TagInput

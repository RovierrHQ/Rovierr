'use client'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Switch as SwitchBase } from '@/components/ui/switch'
import { useFieldContext } from '../context'

type Props = {
  label?: string
} & React.ComponentProps<typeof SwitchBase>

function Switch({ label, ...props }: Props) {
  const field = useFieldContext<boolean>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  return (
    <Field data-invalid={isInvalid} orientation="responsive">
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <SwitchBase
        checked={field.state.value}
        className="data-[state=checked]:bg-icon-active"
        disabled={props.disabled}
        onCheckedChange={field.handleChange}
        {...props}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}

export default Switch

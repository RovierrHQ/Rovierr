'use client'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel
} from '@rov/ui/components/field'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from '@rov/ui/components/input-otp'
import { useFieldContext } from '../context'

type Props = {
  label?: string
  description?: string
  maxlength?: number
}

function OTP({ label, description, maxlength = 6 }: Props) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  return (
    <Field data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <InputOTP
        maxLength={maxlength}
        onChange={(value) => field.handleChange(value)}
        value={field.state.value}
      >
        <InputOTPGroup>
          {Array.from({ length: maxlength }).map((_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: okay for otp
            <InputOTPSlot index={index} key={index} />
          ))}
        </InputOTPGroup>
      </InputOTP>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
export default OTP

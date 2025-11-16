import { Button } from '@rov/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@rov/ui/components/dialog'
import { useAppForm } from '@rov/ui/components/form/index'
import { useEffect, useState } from 'react'
import z from 'zod'

interface OtpVerificationProps {
  email: string
  onVerify: (otp: string) => void
  onResend: () => void
}

const schema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'OTP must be numeric')
})

const OtpVerification = ({
  email,
  onVerify,
  onResend
}: OtpVerificationProps) => {
  const [countdown, setCountdown] = useState(0)

  const form = useAppForm({
    validators: { onSubmit: schema },
    defaultValues: { otp: '' },
    onSubmit: async ({ value }) => {
      await onVerify(value.otp)
      form.reset()
    }
  })

  useEffect(() => {
    if (countdown <= 0) return

    const interval = setInterval(() => {
      setCountdown((sec) => sec - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [countdown])

  const formatted = new Date(countdown * 1000).toISOString().substr(14, 5)

  const handleResend = () => {
    if (countdown > 0) return

    onResend()
    setCountdown(300)
  }

  return (
    <Dialog open={true}>
      <div className="fixed inset-0 z-40 bg-black/80" />
      <DialogContent
        className="mx-auto w-full max-w-md rounded-2xl bg-background p-8 text-center shadow-sm"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="font-semibold text-2xl">
            Enter Verification Code
          </DialogTitle>
        </DialogHeader>

        <p className="mt-2 text-muted-foreground text-sm">We sent a code to</p>
        <p className="font-medium">{email}</p>

        <form
          className="mt-4 space-y-6"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <div className="flex justify-center gap-2 py-2">
            <div className="block">
              <form.AppField children={(field) => <field.OTP />} name="otp" />
            </div>
          </div>

          <p className="text-muted-foreground text-sm">
            Didn’t receive the code?{' '}
            <button
              className="text-primary underline disabled:opacity-50"
              disabled={countdown > 0}
              onClick={handleResend}
              type="button"
            >
              Resend
            </button>{' '}
            {countdown > 0 && `(${formatted})`}
          </p>

          <DialogFooter>
            <Button
              className="w-full"
              disabled={form.state.isSubmitting}
              type="submit"
            >
              Verify
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default OtpVerification

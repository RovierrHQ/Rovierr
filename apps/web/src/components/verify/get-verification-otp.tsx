import { Button } from '@rov/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@rov/ui/components/dialog'
import { useAppForm } from '@rov/ui/components/form/index'
import { Label } from '@rov/ui/components/label'
import { useMutation } from '@tanstack/react-query'
import { Info } from 'lucide-react'
import { toast } from 'sonner'
import z from 'zod'
import { authClient } from '@/lib/auth-client'
import { orpc } from '@/utils/orpc'

const schema = z.object({
  email: z.email()
})

const GetVerificationOTP = ({
  onSuccess
}: {
  onSuccess: (email: string) => void
}) => {
  const { mutateAsync } = useMutation(
    orpc.user.onboarding.resendVerification.mutationOptions()
  )

  const form = useAppForm({
    validators: { onSubmit: schema },
    defaultValues: { email: '' },
    onSubmit: async ({ value }) => {
      try {
        await mutateAsync({})
        onSuccess?.(value.email)
        form.reset()
      } catch {
        toast.error('Failed to send OTP verification code!')
      }
    }
  })

  return (
    <Dialog open={true}>
      <div className="fixed inset-0 z-40 bg-black/80" />
      <DialogContent className="max-w-sm rounded-2xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Verify University Email</DialogTitle>
          <DialogDescription>
            Please enter your university email to continue
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-3 py-2"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <Label htmlFor="email">University Email</Label>

          <form.AppField
            children={(field) => <field.Text placeholder="Email" />}
            name="email"
          />

          <p className="flex items-center gap-2 text-muted-foreground text-xs">
            <Info size={14} /> Use your <strong>.edu</strong> email address
          </p>

          <DialogFooter>
            <Button
              onClick={() => {
                authClient.signOut()
              }}
              variant="outline"
            >
              Logout
            </Button>
            <Button disabled={form.state.isSubmitting} type="submit">
              Send OTP
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default GetVerificationOTP

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
import { useMutation, useQuery } from '@tanstack/react-query'
import { Info } from 'lucide-react'
import { toast } from 'sonner'
import z from 'zod'
import { authClient } from '@/lib/auth-client'
import { orpc } from '@/utils/orpc'

const schema = z.object({
  email: z.email(),
  universityId: z.string().min(1, 'Select your university')
})

const GetVerificationOTP = ({
  onSuccess
}: {
  onSuccess: (email: string) => void
}) => {
  const { mutateAsync } = useMutation(
    orpc.user.onboarding.sendVerificationOTP.mutationOptions()
  )
  const { data: universities } = useQuery(orpc.university.list.queryOptions())

  const form = useAppForm({
    validators: { onSubmit: schema },
    defaultValues: { email: '', universityId: '' },
    onSubmit: async ({ value }) => {
      try {
        await mutateAsync({
          universityEmail: value.email,
          universityId: value.universityId
        })
        onSuccess?.(value.email)
        form.reset()
      } catch {
        toast.error('Failed to send OTP verification code!')
      }
    }
  })

  return (
    <Dialog open={true}>
      <div className="fixed inset-0 z-40 " />
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
          <form.AppField
            children={(field) => (
              <field.Select
                label="University"
                options={
                  universities?.universities?.map((uni) => ({
                    label: `${uni.name} - ${uni.city}, ${uni.country}`,
                    value: uni.id
                  })) ?? []
                }
                placeholder="Select your university"
              />
            )}
            name="universityId"
          />

          <form.Field name="universityId">
            {(universityField) => {
              const selectedUniversity = universities?.universities?.find(
                (uni) => uni.id === universityField.state.value
              )
              const emailPlaceholder = selectedUniversity
                ?.validEmailDomains?.[0]
                ? `student@${selectedUniversity.validEmailDomains[0]}`
                : 'Email'

              return (
                <>
                  <form.AppField
                    children={(field) => (
                      <field.Text placeholder={emailPlaceholder} />
                    )}
                    name="email"
                  />

                  {selectedUniversity && (
                    <p className="flex items-center gap-2 text-muted-foreground text-xs">
                      <Info size={14} /> Use your university email (
                      {selectedUniversity.validEmailDomains.map(
                        (domain: string, i: number) => (
                          <span key={domain}>
                            <strong>@{domain}</strong>
                            {i <
                              selectedUniversity.validEmailDomains.length - 1 &&
                              ' or '}
                          </span>
                        )
                      )}
                      )
                    </p>
                  )}
                </>
              )
            }}
          </form.Field>

          <DialogFooter>
            <Button
              onClick={() => {
                authClient.signOut()
              }}
              type="button"
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

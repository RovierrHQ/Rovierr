import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: () => null,
  beforeLoad: ({ context }) => {
    if (context.auth?.data?.user.emailVerified) {
      throw redirect({ to: '/dashboard' })
    }
  }
})

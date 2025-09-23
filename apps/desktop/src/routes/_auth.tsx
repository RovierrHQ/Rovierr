import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  component: () => <Outlet />,
  beforeLoad(ctx) {
    if (!ctx.context.auth?.data?.user.emailVerified) {
      throw redirect({
        to: '/login',
        search: {
          redirect: ctx.location.href
        }
      })
    }
  }
})

import { authClient } from '@web/lib/auth-client'

export function SpacesHeader() {
  const { data: session } = authClient.useSession()

  return (
    <div>
      <h1 className="text-2xl font-bold">
        Welcome back, {session?.user?.name || 'User'}!
      </h1>
      <p className="text-muted-foreground">
        Here's what's happening in your spaces today.
      </p>
    </div>
  )
}

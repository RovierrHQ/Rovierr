import { Avatar, AvatarImage } from '@rov/ui/components/avatar'
import { Button } from '@rov/ui/components/button'
import { Link } from '@tanstack/react-router'
import Logo from '@web/components/icons/logo'
import { AnimatedThemeToggler } from '@web/components/theme-toggle'
import { authClient } from '@web/lib/auth-client'
import { LogInIcon } from 'lucide-react'

function Topnav({
  enableThemeToggle = true,
  loginButton = true
}: {
  enableThemeToggle?: boolean
  loginButton?: boolean
}) {
  const { data, isPending } = authClient.useSession()
  return (
    <div className="sticky top-0 z-50 border-b bg-background/10 px-4 py-2 shadow-md backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/10">
      <div className="container mx-auto flex items-center justify-between">
        <Link
          className="flex items-center gap-2 font-bold leading-7"
          to="/spaces"
        >
          <div className="flex size-6 items-center justify-center rounded-md border bg-sidebar-primary text-white">
            <Logo />
          </div>
          Rovierr
        </Link>

        <div className="flex items-center gap-2">
          {enableThemeToggle && <AnimatedThemeToggler />}
          {loginButton && (
            <>
              {isPending && (
                <Button disabled variant="outline">
                  Loading...
                </Button>
              )}
              {!isPending && data?.user && (
                <Link className="flex items-center gap-2" to="/profile">
                  <Avatar className="size-8">
                    <AvatarImage
                      alt={data.user.name || undefined}
                      src={data.user.image || undefined}
                    />
                  </Avatar>
                  <Button variant="outline">Profile</Button>
                </Link>
              )}
              {!(isPending || data?.user) && (
                <Link
                  search={{ redirect: window.location.pathname }}
                  to="/login"
                >
                  <Button variant="outline">
                    Log In <LogInIcon className="size-4" />
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Topnav

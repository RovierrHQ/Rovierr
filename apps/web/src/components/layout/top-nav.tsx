import { Button } from '@rov/ui/components/button'
import { SparklesText } from '@rov/ui/components/text-animations/sparkles'
import { AnimatedThemeToggler } from '@rov/ui/components/theme-toggle'
import { LogInIcon } from 'lucide-react'
import Link from 'next/link'

function Topnav({
  enableThemeToggle = true,
  loginButton = true
}: {
  enableThemeToggle?: boolean
  loginButton?: boolean
}) {
  return (
    <div className="sticky top-0 z-50 border-b bg-background/10 px-4 py-2 shadow-md backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/10">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/">
          <SparklesText className="text-xl lg:text-3xl" sparklesCount={3}>
            Rovierr
          </SparklesText>
        </Link>

        <div className="flex items-center gap-2">
          {enableThemeToggle && <AnimatedThemeToggler />}
          {loginButton && (
            <Link href="/login">
              <Button variant="outline">
                Log In <LogInIcon className="size-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default Topnav

import { SparklesText } from '@rov/ui/components/text-animations/sparkles'
import { AnimatedThemeToggler } from '@rov/ui/components/theme-toggle'
import Link from 'next/link'
import DownloadButton from '@/components/download-button'
import UserDropdown from '@/components/user-drowpdown'

function Topnav({
  enableThemeToggle = true,
  enableUserDropdown = true
}: {
  enableThemeToggle?: boolean
  enableUserDropdown?: boolean
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
          <DownloadButton size="sm" variant="outline" />
          {enableThemeToggle && <AnimatedThemeToggler />}
          {enableUserDropdown && <UserDropdown />}
        </div>
      </div>
    </div>
  )
}

export default Topnav

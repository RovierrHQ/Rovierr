import LoginForm from '@rov/ui/blocks/login-form'
import AnimatedGridPattern from '@rov/ui/components/backgrounds/AnimatedGridPattern'
import { cn } from '@rov/ui/lib/utils'
import Topnav from '@/components/top-nav'
import { authClient } from '@/lib/auth-client'

export default function LoginPage() {
  return (
    <div className="relative isolate h-svh overflow-hidden bg-muted">
      <Topnav enableUserDropdown={false} />
      <div className="flex h-full items-center justify-center border">
        <LoginForm authClient={authClient} />
      </div>
      <AnimatedGridPattern
        className={cn(
          '[mask-image:radial-gradient(1500px_circle_at_center,white,transparent)]',
          '-z-1 inset-x-0 inset-y-[-30%] h-[200%] skew-y-12'
        )}
        duration={3}
        maxOpacity={0.1}
        numSquares={30}
        repeatDelay={1}
      />
    </div>
  )
}

import AnimatedGridPattern from '@rov/ui/components/backgrounds/AnimatedGridPattern'
import { AnimatedThemeToggler } from '@rov/ui/components/theme-toggle'
import { cn } from '@rov/ui/lib/utils'
import LoginForm from '@/components/login-form'

export default function LoginPage() {
  return (
    <div className="relative isolate flex h-svh flex-col items-center justify-center overflow-hidden bg-muted p-6 md:p-10">
      <AnimatedThemeToggler className="absolute top-4 right-4" />

      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm />
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

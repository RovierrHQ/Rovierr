import { Moon, Sun } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '@rov/ui/components/button'
import { useRef } from 'react'
import { flushSync } from 'react-dom'
import { useTheme } from './provider'

export function ThemeToggle() {
  const { theme: currentTheme, setTheme } = useTheme()
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleToggle = async () => {
    const button = buttonRef.current
    if (!button) return

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setTheme(currentTheme === 'light' ? 'dark' : 'light')
      })
    })

    await transition.ready

    const { top, left, width, height } = button.getBoundingClientRect()
    const x = left + width / 2
    const y = top + height / 2
    const right = window.innerWidth - left
    const bottom = window.innerHeight - top
    const maxRad = Math.hypot(Math.max(left, right), Math.max(top, bottom))

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRad}px at ${x}px ${y}px)`
        ]
      },
      {
        duration: 700,
        easing: 'ease-in-out',
        pseudoElement: '::view-transition-new(root)'
      }
    )
  }

  return (
    <Button
      onClick={handleToggle}
      ref={buttonRef}
      size="sm"
      type="button"
      variant="ghost"
    >
      <HugeiconsIcon
        className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
        icon={Sun}
      />
      <HugeiconsIcon
        className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        icon={Moon}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

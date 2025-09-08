/** biome-ignore-all lint: downloaded from aceternity */
'use client'

import { cn } from '@rov/ui/lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'

export function PlaceholdersAndVanishInput({
  placeholders,
  onChange,
  onSubmit
}: {
  placeholders: string[]
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startAnimation = () => {
    intervalRef.current = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length)
    }, 3000)
  }
  const handleVisibilityChange = () => {
    if (document.visibilityState !== 'visible' && intervalRef.current) {
      clearInterval(intervalRef.current) // Clear the interval when the tab is not visible
      intervalRef.current = null
    } else if (document.visibilityState === 'visible') {
      startAnimation() // Restart the interval when the tab becomes visible
    }
  }

  useEffect(() => {
    startAnimation()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [placeholders])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const newDataRef = useRef<any[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  const [animating, setAnimating] = useState(false)

  const draw = useCallback(() => {
    if (!inputRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 800
    canvas.height = 800
    ctx.clearRect(0, 0, 800, 800)
    const computedStyles = getComputedStyle(inputRef.current)

    const fontSize = Number.parseFloat(
      computedStyles.getPropertyValue('font-size')
    )
    ctx.font = `${fontSize * 2}px ${computedStyles.fontFamily}`
    ctx.fillStyle = '#FFF'
    ctx.fillText(value, 16, 40)

    const imageData = ctx.getImageData(0, 0, 800, 800)
    const pixelData = imageData.data
    const newData: any[] = []

    for (let t = 0; t < 800; t++) {
      const i = 4 * t * 800
      for (let n = 0; n < 800; n++) {
        const e = i + 4 * n
        if (
          pixelData[e] !== 0 &&
          pixelData[e + 1] !== 0 &&
          pixelData[e + 2] !== 0
        ) {
          newData.push({
            x: n,
            y: t,
            color: [
              pixelData[e],
              pixelData[e + 1],
              pixelData[e + 2],
              pixelData[e + 3]
            ]
          })
        }
      }
    }

    newDataRef.current = newData.map(({ x, y, color }) => ({
      x,
      y,
      r: 1,
      color: `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`
    }))
  }, [value])

  useEffect(() => {
    draw()
  }, [value, draw])

  const animate = (start: number) => {
    const animateFrame = (pos = 0) => {
      requestAnimationFrame(() => {
        const newArr = []
        for (let i = 0; i < newDataRef.current.length; i++) {
          const current = newDataRef.current[i]
          if (current.x < pos) {
            newArr.push(current)
          } else {
            if (current.r <= 0) {
              current.r = 0
              continue
            }
            current.x += Math.random() > 0.5 ? 1 : -1
            current.y += Math.random() > 0.5 ? 1 : -1
            current.r -= 0.05 * Math.random()
            newArr.push(current)
          }
        }
        newDataRef.current = newArr
        const ctx = canvasRef.current?.getContext('2d')
        if (ctx) {
          ctx.clearRect(pos, 0, 800, 800)
          newDataRef.current.forEach((t) => {
            const { x: n, y: i, r: s, color } = t
            if (n > pos) {
              ctx.beginPath()
              ctx.rect(n, i, s, s)
              ctx.fillStyle = color
              ctx.strokeStyle = color
              ctx.stroke()
            }
          })
        }
        if (newDataRef.current.length > 0) {
          animateFrame(pos - 8)
        } else {
          setValue('')
          setAnimating(false)
        }
      })
    }
    animateFrame(start)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !animating) {
      vanishAndSubmit()
    }
  }

  const vanishAndSubmit = () => {
    setAnimating(true)
    draw()

    const value = inputRef.current?.value || ''
    if (value && inputRef.current) {
      const maxX = newDataRef.current.reduce(
        (prev, current) => (current.x > prev ? current.x : prev),
        0
      )
      animate(maxX)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    vanishAndSubmit()
    onSubmit && onSubmit(e)
  }
  return (
    <form
      className={cn(
        'relative mx-auto h-12 w-full max-w-xl overflow-hidden rounded-full bg-white shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),_0px_1px_0px_0px_rgba(25,28,33,0.02),_0px_0px_0px_1px_rgba(25,28,33,0.08)] transition duration-200 dark:bg-zinc-800',
        value && 'bg-gray-50'
      )}
      onSubmit={handleSubmit}
    >
      <canvas
        className={cn(
          'pointer-events-none absolute top-[20%] left-2 origin-top-left scale-50 transform pr-20 text-base invert filter sm:left-8 dark:invert-0',
          animating ? 'opacity-100' : 'opacity-0'
        )}
        ref={canvasRef}
      />
      <input
        className={cn(
          'relative z-50 h-full w-full rounded-full border-none bg-transparent pr-20 pl-4 text-black text-sm focus:outline-none focus:ring-0 sm:pl-10 sm:text-base dark:text-white',
          animating && 'text-transparent dark:text-transparent'
        )}
        onChange={(e) => {
          if (!animating) {
            setValue(e.target.value)
            onChange && onChange(e)
          }
        }}
        onKeyDown={handleKeyDown}
        ref={inputRef}
        type="text"
        value={value}
      />

      <button
        className="-translate-y-1/2 absolute top-1/2 right-2 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-black transition duration-200 disabled:bg-gray-100 dark:bg-zinc-900 dark:disabled:bg-zinc-800"
        disabled={!value}
        type="submit"
      >
        <motion.svg
          className="h-4 w-4 text-gray-300"
          fill="none"
          height="24"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0 0h24v24H0z" fill="none" stroke="none" />
          <motion.path
            animate={{
              strokeDashoffset: value ? 0 : '50%'
            }}
            d="M5 12l14 0"
            initial={{
              strokeDasharray: '50%',
              strokeDashoffset: '50%'
            }}
            transition={{
              duration: 0.3,
              ease: 'linear'
            }}
          />
          <path d="M13 18l6 -6" />
          <path d="M13 6l6 6" />
        </motion.svg>
      </button>

      <div className="pointer-events-none absolute inset-0 flex items-center rounded-full">
        <AnimatePresence mode="wait">
          {!value && (
            <motion.p
              animate={{
                y: 0,
                opacity: 1
              }}
              className="w-[calc(100%-2rem)] truncate pl-4 text-left font-normal text-neutral-500 text-sm sm:pl-12 sm:text-base dark:text-zinc-500"
              exit={{
                y: -15,
                opacity: 0
              }}
              initial={{
                y: 5,
                opacity: 0
              }}
              key={`current-placeholder-${currentPlaceholder}`}
              transition={{
                duration: 0.3,
                ease: 'linear'
              }}
            >
              {placeholders[currentPlaceholder]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  )
}

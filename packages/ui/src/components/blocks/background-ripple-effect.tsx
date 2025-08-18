/** biome-ignore-all lint/suspicious/noArrayIndexKey: simple effect*/
'use client'

import { cn } from '@rov/ui/lib/utils'
import { motion, useAnimation } from 'motion/react'
import type React from 'react'
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useRef,
  useState
} from 'react'

interface BackgroundCellsProps {
  children?: React.ReactNode
  className?: string
}

export const BackgroundCells = ({
  children,
  className
}: BackgroundCellsProps) => {
  return (
    <div
      className={cn(
        'relative flex h-screen justify-center overflow-hidden',
        className
      )}
    >
      <BackgroundCellCore />
      {children && (
        <div className="pointer-events-none relative z-50 mt-40 select-none">
          {children}
        </div>
      )}
    </div>
  )
}

const BackgroundCellCore = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect()
    if (rect) {
      setMousePosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      })
    }
  }

  const size = 300
  return (
    <div
      className="absolute inset-0 h-full"
      onMouseMove={handleMouseMove}
      ref={ref}
    >
      <div className="absolute inset-y-0 h-[20rem] overflow-hidden">
        <div className="-bottom-2 pointer-events-none absolute z-40 h-full w-full bg-slate-950 [mask-image:linear-gradient(to_bottom,transparent,black)]" />
        <div
          className="absolute inset-0 z-20 bg-transparent"
          style={{
            maskImage: `radial-gradient(${size / 4}px circle at center, white, transparent)`,
            WebkitMaskImage: `radial-gradient(${size / 4}px circle at center, white, transparent)`,
            WebkitMaskPosition: `${mousePosition.x - size / 2}px ${
              mousePosition.y - size / 2
            }px`,
            WebkitMaskSize: `${size}px`,
            maskSize: `${size}px`,
            pointerEvents: 'none',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat'
          }}
        >
          <Pattern cellClassName="border-blue-600 relative z-[100]" />
        </div>
        <Pattern cellClassName="border-neutral-700" className="opacity-[0.5]" />
      </div>
    </div>
  )
}

interface PatternProps {
  className?: string
  cellClassName?: string
}

const Pattern = ({ className, cellClassName }: PatternProps) => {
  const x = new Array(47).fill(0)
  const y = new Array(30).fill(0)
  // biome-ignore lint/nursery/noShadow: exception for _
  const matrix = x.map((_, i) => y.map((_, j) => [i, j]))
  const [clickedCell, setClickedCell] = useState<[number, number] | null>(null)

  return (
    <div className={cn('relative z-30 flex flex-row', className)}>
      {matrix.map((row, rowIdx) => (
        <div
          className="relative z-20 flex flex-col border-b"
          key={`matrix-row-${rowIdx}`}
        >
          {row.map((_column, colIdx) => {
            return (
              <Ripples
                cellClassName={cellClassName}
                clickedCell={clickedCell}
                colIdx={colIdx}
                key={colIdx}
                rowIdx={rowIdx}
                setClickedCell={setClickedCell}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

const Ripples = ({
  rowIdx,
  colIdx,
  clickedCell,
  cellClassName,
  setClickedCell
}: {
  rowIdx: number
  colIdx: number
  clickedCell: [number, number] | null
  cellClassName: string | undefined
  setClickedCell: Dispatch<SetStateAction<[number, number] | null>>
}) => {
  const controls = useAnimation()

  useEffect(() => {
    if (clickedCell) {
      const distance = Math.sqrt(
        (clickedCell[0] - rowIdx) ** 2 + (clickedCell[1] - colIdx) ** 2
      )
      controls.start({
        opacity: [0, 1 - distance * 0.1, 0],
        transition: { duration: distance * 0.2 }
      })
    }
  }, [controls, rowIdx, colIdx, clickedCell])

  return (
    <div
      className={cn(
        'border-neutral-600 border-b border-l bg-transparent',
        cellClassName
      )}
      key={`matrix-col-${colIdx}`}
      onClick={() => setClickedCell([rowIdx, colIdx])}
    >
      <motion.div
        animate={controls}
        className="h-12 w-12 bg-[rgba(14,165,233,0.3)]"
        initial={{
          opacity: 0
        }}
        transition={{
          duration: 0.5,
          ease: 'backOut'
        }}
        whileHover={{
          opacity: [0, 1, 0.5]
        }}
      />
    </div>
  )
}

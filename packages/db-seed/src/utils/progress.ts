/** biome-ignore-all lint: ok */
import type { ProgressTracker } from '../types'

export class ConsoleProgressTracker implements ProgressTracker {
  private current = 0
  private total = 0
  private moduleName: string
  private startTime: number
  private lastUpdate = 0

  constructor(moduleName: string) {
    this.moduleName = moduleName
    this.startTime = Date.now()
  }

  setTotal(total: number): void {
    this.total = total
    this.render()
  }

  updateProgress(current: number, total: number, message?: string): void {
    this.current = current
    this.total = total
    this.render(message)
  }

  increment(message?: string, count: number = 1): void {
    this.current += count
    this.render(message)
  }

  complete(): void {
    this.current = this.total
    this.render()
    process.stdout.write('\n')
  }

  private render(message?: string): void {
    // Throttle updates to every 100ms
    const now = Date.now()
    if (now - this.lastUpdate < 100 && this.current < this.total) {
      return
    }
    this.lastUpdate = now

    const percentage =
      this.total > 0 ? Math.floor((this.current / this.total) * 100) : 0
    const elapsed = Math.floor((now - this.startTime) / 1000)

    // Calculate ETA
    const rate = this.current / elapsed || 0
    const remaining = this.total - this.current
    const eta = rate > 0 ? Math.floor(remaining / rate) : 0

    // Build progress bar
    const barWidth = 30
    const filled = Math.floor((this.current / this.total) * barWidth)
    const empty = barWidth - filled
    const bar = '█'.repeat(filled) + '░'.repeat(empty)

    // Build status line
    const status = message || 'Processing'
    const stats = `${this.current}/${this.total} (${percentage}%)`
    const time = eta > 0 ? ` | ETA: ${eta}s` : ` | ${elapsed}s`

    // Clear line and write progress
    process.stdout.write('\r\x1b[K')
    process.stdout.write(
      `🔄 ${this.moduleName}: [${bar}] ${stats}${time} - ${status}`
    )
  }
}

export function createProgressTracker(moduleName: string): ProgressTracker {
  return new ConsoleProgressTracker(moduleName)
}

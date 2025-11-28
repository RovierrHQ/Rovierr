import chalk from 'chalk'
import ora, { type Ora } from 'ora'

export type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success'

export class Logger {
  private verbose: boolean
  private spinner: Ora | null = null

  constructor(verbose = false) {
    this.verbose = verbose
  }

  info(message: string, meta?: object): void {
    console.log(chalk.blue('ℹ'), message)
    if (meta && this.verbose) {
      console.log(chalk.gray(JSON.stringify(meta, null, 2)))
    }
  }

  warn(message: string, meta?: object): void {
    console.log(chalk.yellow('⚠'), message)
    if (meta && this.verbose) {
      console.log(chalk.gray(JSON.stringify(meta, null, 2)))
    }
  }

  error(message: string, error?: Error, meta?: object): void {
    console.log(chalk.red('✖'), message)
    if (error) {
      console.log(chalk.red(error.message))
      if (this.verbose && error.stack) {
        console.log(chalk.gray(error.stack))
      }
    }
    if (meta && this.verbose) {
      console.log(chalk.gray(JSON.stringify(meta, null, 2)))
    }
  }

  debug(message: string, meta?: object): void {
    if (this.verbose) {
      console.log(chalk.gray('🔍'), chalk.gray(message))
      if (meta) {
        console.log(chalk.gray(JSON.stringify(meta, null, 2)))
      }
    }
  }

  success(message: string, meta?: object): void {
    console.log(chalk.green('✓'), message)
    if (meta && this.verbose) {
      console.log(chalk.gray(JSON.stringify(meta, null, 2)))
    }
  }

  startSpinner(message: string): void {
    this.spinner = ora(message).start()
  }

  updateSpinner(message: string): void {
    if (this.spinner) {
      this.spinner.text = message
    }
  }

  stopSpinner(success = true, message?: string): void {
    if (this.spinner) {
      if (success) {
        this.spinner.succeed(message)
      } else {
        this.spinner.fail(message)
      }
      this.spinner = null
    }
  }

  // biome-ignore lint/suspicious/noExplicitAny: ok
  table(data: Record<string, any>[]): void {
    console.table(data)
  }

  newLine(): void {
    console.log('')
  }

  setVerbose(verbose: boolean): void {
    this.verbose = verbose
  }
}

// Singleton instance
let loggerInstance: Logger | null = null

export function getLogger(verbose = false): Logger {
  if (loggerInstance) {
    loggerInstance.setVerbose(verbose)
  } else {
    loggerInstance = new Logger(verbose)
  }
  return loggerInstance
}

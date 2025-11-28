/** biome-ignore-all lint: ok */
export interface ScraperConfig {
  baseUrl: string
  rateLimit?: number // Requests per second
  timeout?: number // Request timeout in ms
  retries?: number // Max retry attempts
  headers?: Record<string, string>
}

export interface DataTransformer<TInput, TOutput> {
  transform(input: TInput): TOutput
  validate(output: TOutput): boolean
}

export abstract class BaseScraper<T> {
  protected config: ScraperConfig

  constructor(config: ScraperConfig) {
    this.config = {
      rateLimit: 2,
      timeout: 10_000,
      retries: 3,
      ...config
    }
  }

  abstract scrape(): Promise<T[]>

  protected async fetch(url: string): Promise<string> {
    // To be implemented
    throw new Error('fetch method must be implemented')
  }

  protected parseHTML(html: string): any {
    // To be implemented with cheerio
    throw new Error('parseHTML method must be implemented')
  }

  protected async retry<R>(
    fn: () => Promise<R>,
    maxRetries: number = this.config.retries || 3
  ): Promise<R> {
    // To be implemented
    throw new Error('retry method must be implemented')
  }
}

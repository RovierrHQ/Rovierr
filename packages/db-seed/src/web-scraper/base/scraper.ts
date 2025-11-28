import type { ScraperConfig } from '../types'
import { HttpClient } from './http-client'
import { HtmlParser } from './parser'

export abstract class BaseScraper<T> {
  protected config: ScraperConfig
  protected httpClient: HttpClient
  protected parser: HtmlParser

  constructor(config: ScraperConfig) {
    this.config = {
      rateLimit: 2,
      timeout: 10_000,
      retries: 3,
      ...config
    }
    this.httpClient = new HttpClient(this.config)
    this.parser = new HtmlParser()
  }

  /**
   * Main scraping method - must be implemented by subclasses
   */
  abstract scrape(): Promise<T[]>

  /**
   * Fetch a URL with retry logic
   */
  protected async fetch(url: string): Promise<string> {
    await this.httpClient.rateLimit()
    return await this.httpClient.retry(() => this.httpClient.fetch(url))
  }

  /**
   * Parse HTML string
   */
  protected parseHTML(html: string) {
    return this.parser.parse(html)
  }

  /**
   * Retry a function with exponential backoff
   */
  protected async retry<R>(
    fn: () => Promise<R>,
    maxRetries: number = this.config.retries || 3
  ): Promise<R> {
    return await this.httpClient.retry(fn, maxRetries)
  }
}

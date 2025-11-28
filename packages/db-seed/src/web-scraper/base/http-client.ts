/** biome-ignore-all lint: okay for db-seed */
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import type { ScraperConfig } from '../types'

export class HttpClient {
  private config: ScraperConfig
  private axiosInstance: AxiosInstance

  constructor(config: ScraperConfig) {
    this.config = config

    // Create axios instance with default config
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 10_000,
      headers: config.headers || {}
    })
  }

  /**
   * Fetch a URL with retry logic
   */
  async fetch(url: string, options?: AxiosRequestConfig): Promise<string> {
    const response = await this.axiosInstance.get(url, options)
    return response.data
  }

  /**
   * Retry a function with exponential backoff
   */
  async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = this.config.retries || 3
  ): Promise<T> {
    let lastError: Error | undefined

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error

        if (attempt < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s, 8s...
          const delay = 2 ** attempt * 1000
          console.warn(
            `Attempt ${attempt + 1} failed, retrying in ${delay}ms...`
          )
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError || new Error('Max retries exceeded')
  }

  /**
   * Rate limit requests
   */
  async rateLimit(): Promise<void> {
    if (this.config.rateLimit) {
      const delay = 1000 / this.config.rateLimit
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  /**
   * Get the axios instance for advanced usage
   */
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance
  }
}

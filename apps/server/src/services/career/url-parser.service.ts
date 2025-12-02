/**
 * URL Parser Service
 * Fetches and parses job post URLs using Cheerio
 */

import axios from 'axios'
import * as cheerio from 'cheerio'

interface ScrapedJobData {
  jobTitle: string
  jobCompany: string
  jobDescription: string
  jobCompanyLogo?: string
}

// Regex patterns defined at module level for performance
const LINKEDIN_JOB_ID_REGEX = /currentJobId=(\d+)/
const JOBSDB_JOB_ID_REGEX = /jobId=(\d+)/

export class URLParserService {
  private readonly TIMEOUT_MS = 10_000 // 10 seconds

  /**
   * Fetch and parse job posting from URL
   */
  async fetchAndExtractText(url: string): Promise<string> {
    // Validate URL
    if (!this.validateURL(url)) {
      throw new Error('Invalid URL format')
    }

    try {
      // Detect job board and use appropriate scraper
      if (url.includes('linkedin.com')) {
        const data = await this.scrapeLinkedInJob(url)
        return this.formatJobData(data)
      }

      if (url.includes('jobsdb.com')) {
        const data = await this.scrapeJobsDBJob(url)
        return this.formatJobData(data)
      }

      // Generic scraper for other sites
      return await this.scrapeGenericJob(url)
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch URL: ${error.message}`)
      }
      throw new Error('Failed to fetch URL')
    }
  }

  /**
   * Scrape LinkedIn job posting
   */
  private async scrapeLinkedInJob(url: string): Promise<ScrapedJobData> {
    try {
      // Extract job ID from URL
      const match = url.match(LINKEDIN_JOB_ID_REGEX)
      let jobId: string

      if (match) {
        jobId = match[1]
      } else {
        jobId = url.split('/').pop() || ''
      }

      const jobUrl = `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${jobId}`

      const { data } = await axios.get(jobUrl, {
        timeout: this.TIMEOUT_MS,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })

      const $ = cheerio.load(data)

      const jobTitle = $('.top-card-layout__title').text().trim()
      const jobCompany = $('.topcard__org-name-link').text().trim()
      const jobDescription = $('.description__text.description__text--rich')
        .text()
        .trim()
        .replace(/\s+/g, ' ')
      const dataDelayedUrl = $('.artdeco-entity-image').attr('data-delayed-url')

      return {
        jobTitle,
        jobCompany,
        jobDescription,
        jobCompanyLogo: dataDelayedUrl
      }
    } catch {
      throw new Error('Failed to scrape LinkedIn job posting')
    }
  }

  /**
   * Scrape JobsDB job posting
   */
  private async scrapeJobsDBJob(url: string): Promise<ScrapedJobData> {
    try {
      // Extract job ID from URL
      const match = url.match(JOBSDB_JOB_ID_REGEX)
      let jobId: string

      if (match) {
        jobId = match[1]
      } else {
        jobId = ''
      }

      const jobUrl = `https://hk.jobsdb.com/job/${jobId}?type=standout`

      const { data } = await axios.get(jobUrl, {
        timeout: this.TIMEOUT_MS,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })

      const $ = cheerio.load(data)

      const jobCompany = $('[data-automation="advertiser-name"]').text().trim()
      const jobTitle = $('[data-automation="job-detail-title"]').text().trim()
      const jobDescription = $('[data-automation="jobAdDetails"]')
        .text()
        .trim()
        .replace(/\s+/g, ' ')
      const imageElement = $('[data-automation="company-profile"] img')
      const imageUrl = imageElement.attr('src')

      return {
        jobTitle,
        jobCompany,
        jobDescription,
        jobCompanyLogo: imageUrl
      }
    } catch {
      throw new Error('Failed to scrape JobsDB job posting')
    }
  }

  /**
   * Generic scraper for other job sites
   */
  private async scrapeGenericJob(url: string): Promise<string> {
    try {
      const { data } = await axios.get(url, {
        timeout: this.TIMEOUT_MS,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })

      const $ = cheerio.load(data)

      // Remove script and style tags
      $('script, style, noscript').remove()

      // Get text content
      const text = $('body').text().trim().replace(/\s+/g, ' ')

      return text
    } catch {
      throw new Error('Failed to scrape job posting')
    }
  }

  /**
   * Format scraped job data into text for AI parsing
   */
  private formatJobData(data: ScrapedJobData): string {
    return `
Job Title: ${data.jobTitle}
Company: ${data.jobCompany}
Description: ${data.jobDescription}
    `.trim()
  }

  /**
   * Validate URL format
   */
  private validateURL(url: string): boolean {
    try {
      const urlObj = new URL(url)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }
}

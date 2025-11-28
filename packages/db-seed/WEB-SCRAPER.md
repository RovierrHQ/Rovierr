# Web Scraper Infrastructure

Reusable web scraping utilities for the Rovierr seeding system.

## Overview

The web scraper infrastructure provides:
- Base scraper class with retry logic and rate limiting
- HTTP client with timeout and error handling
- HTML parser using Cheerio
- Data transformation utilities

## Quick Start

### Creating a Scraper

```typescript
import { BaseScraper } from '../base/scraper'

interface YourData {
  field1: string
  field2: string
}

export class YourScraper extends BaseScraper<YourData> {
  constructor() {
    super({
      baseUrl: 'https://example.com',
      rateLimit: 2,      // 2 requests per second
      timeout: 10000,    // 10 second timeout
      retries: 3,        // Retry up to 3 times
    })
  }

  async scrape(): Promise<YourData[]> {
    const results: YourData[] = []

    // Fetch the page
    const html = await this.fetch('/list')

    // Parse HTML
    const $ = this.parseHTML(html)

    // Extract data
    $('.item').each((_, element) => {
      results.push({
        field1: $(element).find('.field1').text(),
        field2: $(element).find('.field2').attr('href') || '',
      })
    })

    return results
  }
}
```

## Base Scraper API

### Constructor Options

```typescript
interface ScraperConfig {
  baseUrl: string              // Base URL for requests
  rateLimit?: number           // Requests per second (default: 2)
  timeout?: number             // Request timeout in ms (default: 10000)
  retries?: number             // Max retry attempts (default: 3)
  headers?: Record<string, string>  // Custom headers
}
```

### Protected Methods

#### `fetch(url: string): Promise<string>`

Fetches a URL with automatic retry and rate limiting.

```typescript
const html = await this.fetch('/page')
```

#### `parseHTML(html: string): CheerioAPI`

Parses HTML string into a Cheerio instance.

```typescript
const $ = this.parseHTML(html)
const title = $('h1').text()
```

#### `retry<R>(fn: () => Promise<R>, maxRetries?: number): Promise<R>`

Retries a function with exponential backoff.

```typescript
const data = await this.retry(async () => {
  return await someOperation()
}, 5)
```

## Pagination

### Simple Pagination

```typescript
async scrape(): Promise<YourData[]> {
  const results: YourData[] = []
  let page = 1
  let hasMore = true

  while (hasMore) {
    const html = await this.fetch(`/list?page=${page}`)
    const $ = this.parseHTML(html)

    const items = $('.item')
    if (items.length === 0) {
      hasMore = false
      break
    }

    items.each((_, element) => {
      results.push(this.extractItem($, element))
    })

    page++
  }

  return results
}
```

### Cursor-Based Pagination

```typescript
async scrape(): Promise<YourData[]> {
  const results: YourData[] = []
  let cursor: string | null = null

  do {
    const url = cursor ? `/list?cursor=${cursor}` : '/list'
    const html = await this.fetch(url)
    const $ = this.parseHTML(html)

    // Extract items
    $('.item').each((_, element) => {
      results.push(this.extractItem($, element))
    })

    // Get next cursor
    cursor = $('[data-next-cursor]').attr('data-next-cursor') || null
  } while (cursor)

  return results
}
```

## Data Transformation

### Creating a Transformer

```typescript
import type { DataTransformer } from '../types'

interface RawData {
  name: string
  location: string
}

interface TransformedData {
  name: string
  country: string
  city: string
}

export class YourTransformer implements DataTransformer<RawData, TransformedData> {
  transform(input: RawData): TransformedData {
    const [city, country] = input.location.split(', ')

    return {
      name: input.name,
      country: country || '',
      city: city || '',
    }
  }

  validate(output: TransformedData): boolean {
    return !!(output.name && output.country && output.city)
  }
}
```

### Using a Transformer

```typescript
async scrape(): Promise<TransformedData[]> {
  const rawData = await this.scrapeRawData()
  const transformer = new YourTransformer()

  return rawData
    .map(raw => transformer.transform(raw))
    .filter(transformed => transformer.validate(transformed))
}
```

## Error Handling

### Network Errors

Automatically retried with exponential backoff:

```typescript
// Retries automatically on network errors
const html = await this.fetch('/page')
```

### Rate Limiting

Automatically enforced between requests:

```typescript
// Waits between requests based on rateLimit config
for (const url of urls) {
  const html = await this.fetch(url)
  // Process...
}
```

### Custom Error Handling

```typescript
async scrape(): Promise<YourData[]> {
  try {
    const html = await this.fetch('/page')
    return this.parseData(html)
  } catch (error) {
    console.error('Scraping failed:', error)
    // Return empty array or throw
    return []
  }
}
```

## Best Practices

### 1. Respect robots.txt

Always check the website's robots.txt before scraping.

### 2. Use Appropriate Rate Limits

```typescript
super({
  baseUrl: 'https://example.com',
  rateLimit: 1, // 1 request per second for small sites
})
```

### 3. Handle Missing Data

```typescript
const value = $(element).find('.field').text() || 'default'
```

### 4. Validate Extracted Data

```typescript
const data = this.extractData($)
if (!this.isValid(data)) {
  console.warn('Invalid data:', data)
  return null
}
```

### 5. Log Progress

```typescript
console.log(`Scraped page ${page}, found ${items.length} items`)
```

### 6. Use Selectors Carefully

```typescript
// Prefer specific selectors
const title = $('.article-title').text()

// Over generic ones
const title = $('h1').text()
```

### 7. Handle Pagination Limits

```typescript
const MAX_PAGES = 100
let page = 1

while (hasMore && page <= MAX_PAGES) {
  // Scrape page...
  page++
}
```

## Common Patterns

### Extract List Items

```typescript
const items: YourData[] = []

$('.item').each((_, element) => {
  items.push({
    title: $(element).find('.title').text(),
    link: $(element).find('a').attr('href') || '',
    description: $(element).find('.desc').text(),
  })
})
```

### Extract Nested Data

```typescript
const data = {
  title: $('.main-title').text(),
  sections: [] as Section[],
}

$('.section').each((_, section) => {
  data.sections.push({
    heading: $(section).find('h2').text(),
    items: $(section).find('.item').map((_, item) => {
      return $(item).text()
    }).get(),
  })
})
```

### Extract Attributes

```typescript
const links = $('a').map((_, link) => ({
  text: $(link).text(),
  href: $(link).attr('href') || '',
  target: $(link).attr('target') || '_self',
})).get()
```

## Testing Scrapers

### With Mock Data

```typescript
// Create a test HTML file
const testHtml = `
  <div class="item">
    <h2 class="title">Test Item</h2>
    <a href="/test">Link</a>
  </div>
`

// Test parsing logic
const $ = cheerio.load(testHtml)
const result = extractItem($, $('.item')[0])

console.assert(result.title === 'Test Item')
```

### With Real Requests

```typescript
// Test with a single page first
const scraper = new YourScraper()
const results = await scraper.scrape()

console.log(`Scraped ${results.length} items`)
console.log('Sample:', results[0])
```

## Troubleshooting

### Timeout Errors

Increase timeout in config:

```typescript
super({
  baseUrl: 'https://slow-site.com',
  timeout: 30000, // 30 seconds
})
```

### Rate Limit Errors

Decrease rate limit:

```typescript
super({
  baseUrl: 'https://example.com',
  rateLimit: 0.5, // 1 request every 2 seconds
})
```

### Parsing Errors

Check selectors in browser DevTools:

```javascript
// In browser console
document.querySelectorAll('.your-selector')
```

### Empty Results

Add debug logging:

```typescript
const html = await this.fetch('/page')
console.log('HTML length:', html.length)

const $ = this.parseHTML(html)
console.log('Items found:', $('.item').length)
```

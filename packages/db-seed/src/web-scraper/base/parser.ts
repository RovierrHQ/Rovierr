import { type CheerioAPI, load } from 'cheerio'

export class HtmlParser {
  /**
   * Parse HTML string into a Cheerio instance
   */
  parse(html: string): CheerioAPI {
    return load(html)
  }

  /**
   * Extract text content from an element
   */
  extractText($: CheerioAPI, selector: string): string {
    return $(selector).text().trim()
  }

  /**
   * Extract attribute value from an element
   */
  extractAttr(
    $: CheerioAPI,
    selector: string,
    attr: string
  ): string | undefined {
    return $(selector).attr(attr)
  }

  /**
   * Extract multiple elements matching a selector
   */
  extractAll($: CheerioAPI, selector: string): ReturnType<CheerioAPI> {
    return $(selector)
  }

  /**
   * Check if an element exists
   */
  exists($: CheerioAPI, selector: string): boolean {
    return $(selector).length > 0
  }
}

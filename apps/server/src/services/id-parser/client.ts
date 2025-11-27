import { env } from '@/lib/env'
import logger from '@/lib/logger'

export interface ParseIDResult {
  raw_text: string[]
  university: string | null
  student_id: string | null
  expiry_date: string | null
}

export interface ParseIDError {
  error: string
  message: string
}

/**
 * Client for ID Parser service
 * This service is private and only accessible from the backend
 */
class IDParserClient {
  private baseUrl: string
  private apiKey: string

  constructor() {
    this.baseUrl = env.ID_PARSER_URL || 'http://localhost:8001'
    this.apiKey = env.ID_PARSER_API_KEY
  }

  /**
   * Parse student ID card image
   * @param imageFile - File buffer or FormData file
   * @returns Parsed student ID information
   */
  async parse(
    imageFile: File | Buffer,
    filename = 'id-card.jpg'
  ): Promise<ParseIDResult> {
    if (!env.ID_PARSER_URL) {
      throw new Error('ID_PARSER_URL not configured')
    }

    const formData = new FormData()

    // Handle both File and Buffer
    if (imageFile instanceof File) {
      formData.append('file', imageFile)
    } else {
      // Convert Buffer to Uint8Array then to Blob
      const buffer =
        imageFile instanceof Buffer ? imageFile : Buffer.from(imageFile)
      const uint8Array = new Uint8Array(buffer)
      const blob = new Blob([uint8Array], { type: 'image/jpeg' })
      formData.append('file', blob, filename)
    }

    try {
      const headers: HeadersInit = {
        'X-API-Key': this.apiKey
      }

      const response = await fetch(`${this.baseUrl}/parse`, {
        method: 'POST',
        headers,
        body: formData
      })

      if (!response.ok) {
        const errorText = await response.text()
        logger.error(
          { status: response.status, error: errorText },
          'ID Parser service error'
        )
        throw new Error(
          `ID Parser service returned ${response.status}: ${errorText}`
        )
      }

      const result = (await response.json()) as ParseIDResult
      logger.info(
        { studentId: result.student_id, university: result.university },
        'ID parsed successfully'
      )

      return result
    } catch (error) {
      logger.error({ error }, 'Failed to parse ID card')
      throw error
    }
  }

  /**
   * Check if ID Parser service is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })
      return response.ok
    } catch {
      return false
    }
  }
}

export const idParserClient = new IDParserClient()

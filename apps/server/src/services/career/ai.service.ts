/**
 * AI Service
 * Uses Vercel AI SDK to parse job posting information from text content
 */

import type { ParsedJobData } from '@rov/orpc-contracts'
import { generateObject } from 'ai'
import { z } from 'zod'

const jobDataSchema = z.object({
  companyName: z.string().describe('The name of the company posting the job'),
  positionTitle: z.string().describe('The job title or position name'),
  location: z
    .string()
    .nullable()
    .describe('The job location (city, state, country, or "Remote")'),
  salaryRange: z
    .string()
    .nullable()
    .describe(
      'The salary range if mentioned (e.g., "$80k-$120k", "£50,000-£70,000")'
    )
})

export class AIService {
  /**
   * Parse job posting information from text content using AI
   */
  async parseJobPosting(textContent: string): Promise<ParsedJobData> {
    try {
      // Limit text content to avoid token limits (first 3000 characters should be enough)
      const limitedText = textContent.slice(0, 3000)

      const { object } = await generateObject({
        model: 'openai/gpt-4o-mini',
        schema: jobDataSchema,
        prompt: `Extract job posting information from the following text.
If any information is not found or unclear, return null for that field.
Be precise and extract only the information that is clearly stated.

Text content:
${limitedText}`,
        temperature: 0.3 // Lower temperature for more consistent extraction
      })

      return object
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`AI parsing failed: ${error.message}`)
      }
      throw new Error('AI parsing failed')
    }
  }
}

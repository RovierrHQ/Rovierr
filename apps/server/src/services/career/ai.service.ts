/**
 * AI Service
 * Uses Vercel AI SDK for AI-powered career features
 */

import type {
  ExtendedParsedJobData,
  ParsedJobData,
  ResumeAnalysis,
  ResumeSuggestion
} from '@rov/orpc-contracts'
import { generateObject } from 'ai'
import { z } from 'zod'
import { isRetryableError, RetryableError, withRetry } from './retry.util'

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

// Extended job data schema for detailed parsing
const extendedJobDataSchema = z.object({
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
    ),
  description: z.string().describe('Full job description'),
  requirements: z
    .array(z.string())
    .describe('List of job requirements and qualifications'),
  responsibilities: z
    .array(z.string())
    .describe('List of job responsibilities and duties'),
  skills: z
    .array(z.string())
    .describe('List of required technical and soft skills'),
  experienceYears: z
    .number()
    .nullable()
    .describe('Required years of experience'),
  educationLevel: z
    .string()
    .nullable()
    .describe('Required education level (e.g., "Bachelor\'s", "Master\'s")')
})

// Resume analysis schema
const resumeAnalysisSchema = z.object({
  matchScore: z
    .number()
    .min(0)
    .max(100)
    .describe('Overall match score between resume and job (0-100)'),
  strengths: z
    .array(z.string())
    .describe('Matching skills and experiences from the resume'),
  gaps: z.array(z.string()).describe('Missing requirements or qualifications'),
  keywordMatches: z.object({
    found: z.array(z.string()).describe('Keywords found in resume'),
    missing: z.array(z.string()).describe('Keywords missing from resume')
  }),
  sectionScores: z
    .record(
      z.string(),
      z.object({
        score: z.number(),
        feedback: z.string()
      })
    )
    .describe('Scores and feedback for each resume section'),
  overallFeedback: z.string().describe('Overall feedback and recommendations')
})

// Resume suggestion schema
const resumeSuggestionSchema = z.object({
  id: z.string().describe('Unique suggestion ID'),
  section: z
    .enum([
      'experience',
      'projects',
      'education',
      'basicInfo',
      'certifications'
    ])
    .describe('Resume section to modify'),
  itemId: z.string().nullable().describe('ID of specific item in section'),
  field: z.string().describe('Specific field to modify'),
  originalContent: z.string().describe('Current content'),
  proposedContent: z.string().describe('Suggested improved content'),
  reasoning: z.string().describe('Explanation for the suggestion'),
  impactScore: z
    .number()
    .min(1)
    .max(10)
    .describe('Expected impact on job match (1-10)'),
  keywords: z.array(z.string()).describe('Keywords being added or emphasized')
})

export class AIService {
  /**
   * Parse job posting information from text content using AI (basic)
   */
  parseJobPosting(textContent: string): Promise<ParsedJobData> {
    return withRetry(
      async () => {
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
          const err = error as Error
          if (isRetryableError(err)) {
            throw new RetryableError(`AI parsing failed: ${err.message}`)
          }
          throw new Error(`AI parsing failed: ${err.message}`)
        }
      },
      { maxRetries: 3, baseDelay: 1000 }
    )
  }

  /**
   * Parse job description with detailed information extraction
   */
  parseJobDescription(text: string): Promise<ExtendedParsedJobData> {
    return withRetry(
      async () => {
        try {
          const limitedText = text.slice(0, 5000)

          const { object } = await generateObject({
            model: 'openai/gpt-4o-mini',
            schema: extendedJobDataSchema,
            prompt: `Extract detailed job posting information from the following text.
Extract all requirements, responsibilities, and skills mentioned.
Be thorough and precise.

Text content:
${limitedText}`,
            temperature: 0.3
          })

          return object
        } catch (error) {
          const err = error as Error
          if (isRetryableError(err)) {
            throw new RetryableError(`AI parsing failed: ${err.message}`)
          }
          throw new Error(`AI parsing failed: ${err.message}`)
        }
      },
      { maxRetries: 3, baseDelay: 1000 }
    )
  }

  /**
   * Parse job URL by fetching content and extracting information
   */
  async parseJobUrl(url: string): Promise<ExtendedParsedJobData> {
    try {
      // Fetch URL content
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.statusText}`)
      }

      const html = await response.text()
      // Extract text from HTML (simple approach - strip tags)
      const text = html
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

      return await this.parseJobDescription(text)
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`URL parsing failed: ${error.message}`)
      }
      throw new Error('URL parsing failed')
    }
  }

  /**
   * Analyze resume against job description
   */
  async analyzeResume(
    resumeData: Record<string, unknown>,
    jobData: ExtendedParsedJobData
  ): Promise<ResumeAnalysis> {
    try {
      const { object } = await generateObject({
        model: 'openai/gpt-4o-mini',
        schema: resumeAnalysisSchema,
        prompt: `Analyze the following resume against the job requirements and provide a detailed assessment.

Job Information:
- Position: ${jobData.positionTitle}
- Company: ${jobData.companyName}
- Requirements: ${jobData.requirements.join(', ')}
- Skills: ${jobData.skills.join(', ')}
- Experience Required: ${jobData.experienceYears || 'Not specified'} years

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Provide a comprehensive analysis with the following structure:
- matchScore: A number from 0-100 indicating overall fit
- strengths: Array of strings describing what matches well (3-5 items)
- gaps: Array of strings describing what's missing or weak (3-5 items)
- keywordMatches: Object with two arrays:
  - found: Keywords from job that appear in resume
  - missing: Important keywords from job not in resume
- sectionScores: Object with keys like "experience", "education", "skills", each containing:
  - score: Number from 0-100
  - feedback: String with specific feedback for that section
- overallFeedback: A paragraph summarizing the analysis and recommendations`,
        temperature: 0.4
      })

      return object
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Resume analysis failed: ${error.message}`)
      }
      throw new Error('Resume analysis failed')
    }
  }

  /**
   * Generate suggestions for resume improvement
   */
  async generateSuggestions(
    resumeData: Record<string, unknown>,
    jobData: ExtendedParsedJobData,
    analysis: ResumeAnalysis
  ): Promise<ResumeSuggestion[]> {
    try {
      const { object } = await generateObject({
        model: 'openai/gpt-4o-mini',
        schema: z.object({
          suggestions: z.array(resumeSuggestionSchema)
        }),
        prompt: `Based on the resume analysis, generate specific, actionable suggestions to improve the resume for this job.

Job Requirements:
${jobData.requirements.join('\n')}

Key Skills Needed:
${jobData.skills.join(', ')}

Analysis Gaps:
${analysis.gaps.join('\n')}

Missing Keywords:
${analysis.keywordMatches.missing.join(', ')}

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Generate 5-10 specific suggestions. Each suggestion MUST include:
- id: A unique identifier (use format: "sugg-1", "sugg-2", etc.)
- section: One of: "experience", "projects", "education", "basicInfo", "certifications"
- itemId: The ID of the specific item being modified (or null if not applicable)
- field: The specific field being changed (e.g., "description", "title", "summary")
- originalContent: The exact current text from the resume
- proposedContent: The improved version with keywords and better phrasing
- reasoning: Why this change improves the resume for this job (1-2 sentences)
- impactScore: A number from 1-10 indicating how much this improves job match
- keywords: Array of relevant keywords being added (can be empty array)

Focus on:
1. Adding missing keywords naturally
2. Rewriting descriptions to highlight relevant experience
3. Emphasizing matching skills
4. Addressing identified gaps where possible`,
        temperature: 0.5
      })

      return object.suggestions
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Suggestion generation failed: ${error.message}`)
      }
      throw new Error('Suggestion generation failed')
    }
  }

  /**
   * Generate cover letter based on resume and job data
   */
  async generateCoverLetter(
    resumeData: Record<string, unknown>,
    jobData: ExtendedParsedJobData
  ): Promise<string> {
    try {
      const { object } = await generateObject({
        model: 'openai/gpt-4o-mini',
        schema: z.object({
          coverLetter: z.string().describe('Complete cover letter content')
        }),
        prompt: `Generate a professional cover letter for the following job application.

Job Information:
- Position: ${jobData.positionTitle}
- Company: ${jobData.companyName}
- Location: ${jobData.location || 'Not specified'}
- Key Requirements: ${jobData.requirements.slice(0, 5).join(', ')}

Candidate Information:
${JSON.stringify(resumeData, null, 2)}

Generate a compelling cover letter that:
1. Opens with a strong introduction expressing interest
2. Highlights 2-3 relevant experiences that match job requirements
3. Explains why the candidate is interested in this position
4. Closes with a call to action
5. Is professional, concise (3-4 paragraphs), and personalized
6. Uses specific examples from the resume`,
        temperature: 0.7
      })

      return object.coverLetter
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Cover letter generation failed: ${error.message}`)
      }
      throw new Error('Cover letter generation failed')
    }
  }
}

/**
 * Career Error Classes
 */

export class ValidationError extends Error {
  constructor(message = 'Validation error') {
    super(message)
    this.name = 'VALIDATION_ERROR'
  }
}

export class InvalidUrlError extends Error {
  constructor(message = 'Invalid or inaccessible URL') {
    super(message)
    this.name = 'INVALID_URL'
  }
}

export class UrlFetchFailedError extends Error {
  constructor(message = 'Failed to fetch URL content') {
    super(message)
    this.name = 'URL_FETCH_FAILED'
  }
}

export class AIParsingFailedError extends Error {
  constructor(message = 'Failed to parse job information') {
    super(message)
    this.name = 'AI_PARSING_FAILED'
  }
}

export class AIAnalysisFailedError extends Error {
  constructor(message = 'Failed to analyze resume') {
    super(message)
    this.name = 'AI_ANALYSIS_FAILED'
  }
}

export class AIGenerationFailedError extends Error {
  constructor(message = 'Failed to generate cover letter') {
    super(message)
    this.name = 'AI_GENERATION_FAILED'
  }
}

export class InvalidStatusError extends Error {
  constructor(message = 'Invalid status value') {
    super(message)
    this.name = 'INVALID_STATUS'
  }
}

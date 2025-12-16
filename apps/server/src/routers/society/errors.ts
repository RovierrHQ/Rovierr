/**
 * Society Router Custom Errors
 */

export class SocietyNotFoundError extends Error {
  constructor(message = 'Society not found') {
    super(message)
    this.name = 'SocietyNotFoundError'
  }
}

export class SocietyForbiddenError extends Error {
  constructor(message = 'You do not have permission to perform this action') {
    super(message)
    this.name = 'SocietyForbiddenError'
  }
}

export class SocietyValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SocietyValidationError'
  }
}

export class UploadFailedError extends Error {
  constructor(message = 'Failed to upload file') {
    super(message)
    this.name = 'UploadFailedError'
  }
}

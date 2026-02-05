/**
 * Academic Enrollment Error Classes
 */

export class AlreadyEnrolledError extends Error {
  constructor(message = 'Already enrolled in this program') {
    super(message)
    this.name = 'ALREADY_ENROLLED'
  }
}

export class InvalidTermError extends Error {
  constructor(message = 'Invalid term') {
    super(message)
    this.name = 'INVALID_TERM'
  }
}

export class NotEnrolledError extends Error {
  constructor(message = 'User not enrolled in any program') {
    super(message)
    this.name = 'NOT_ENROLLED'
  }
}

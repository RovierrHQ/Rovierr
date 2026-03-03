/**
 * Common error classes for Elysia routers
 * These replace ORPCError usage across the application
 */

export class UNAUTHORIZED extends Error {
  constructor(message = 'Unauthorized') {
    super(message)
  }
}

export class NOT_FOUND extends Error {
  constructor(message = 'Resource not found') {
    super(message)
  }
}

export class FORBIDDEN extends Error {
  constructor(message = 'Forbidden') {
    super(message)
  }
}

export class BAD_REQUEST extends Error {
  constructor(message = 'Bad request') {
    super(message)
  }
}

export class INTERNAL_SERVER_ERROR extends Error {
  constructor(message = 'Internal server error') {
    super(message)
  }
}

export class VALIDATION_ERROR extends Error {
  constructor(message = 'Validation failed') {
    super(message)
  }
}

export class CONFLICT extends Error {
  constructor(message = 'Resource conflict') {
    super(message)
  }
}

export class NOT_IMPLEMENTED extends Error {
  constructor(message = 'Feature not implemented') {
    super(message)
  }
}

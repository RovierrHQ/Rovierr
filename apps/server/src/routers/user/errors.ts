// Custom error classes for profile routes
export class USERNAME_TAKEN extends Error {
  constructor(message = 'Username is already taken') {
    super(message)
  }
}

export class INVALID_INPUT extends Error {
  constructor(message = 'Invalid input') {
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

export class INTERNAL_SERVER_ERROR extends Error {
  constructor(message = 'Internal server error') {
    super(message)
  }
}

export class PARSING_FAILED extends Error {
  constructor(message = 'Parsing failed') {
    super(message)
  }
}

export class INVALID_EMAIL_DOMAIN extends Error {
  constructor(message = 'Invalid email domain') {
    super(message)
  }
}

export class EMAIL_ALREADY_TAKEN extends Error {
  constructor(message = 'Email already taken') {
    super(message)
  }
}

export class EMAIL_SEND_FAILED extends Error {
  constructor(message = 'Failed to send email') {
    super(message)
  }
}

export class TOKEN_INVALID extends Error {
  constructor(message = 'Invalid token') {
    super(message)
  }
}

export class TOKEN_EXPIRED extends Error {
  constructor(message = 'Token expired') {
    super(message)
  }
}

export class USER_NOT_FOUND extends Error {
  constructor(message = 'User not found') {
    super(message)
  }
}

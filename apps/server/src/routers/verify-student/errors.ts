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

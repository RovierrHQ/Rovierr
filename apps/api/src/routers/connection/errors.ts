/**
 * Connection Router Error Classes
 */

export class SELF_CONNECTION extends Error {
  constructor(message = 'Cannot connect with yourself') {
    super(message)
  }
}

export class ALREADY_CONNECTED extends Error {
  constructor(message = 'Already connected with this user') {
    super(message)
  }
}

export class PENDING_REQUEST extends Error {
  constructor(message = 'Connection request already pending') {
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

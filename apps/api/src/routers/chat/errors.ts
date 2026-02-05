/**
 * Chat Router Error Classes
 */

export class NOT_CONNECTED extends Error {
  constructor(message = 'Not connected with this user') {
    super(message)
  }
}

export class NOT_PARTICIPANT extends Error {
  constructor(message = 'Not a participant in this conversation') {
    super(message)
  }
}

export class CONNECTION_REMOVED extends Error {
  constructor(message = 'Cannot send message - connection has been removed') {
    super(message)
  }
}

export class INTERNAL_SERVER_ERROR extends Error {
  constructor(message = 'Internal server error') {
    super(message)
  }
}

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

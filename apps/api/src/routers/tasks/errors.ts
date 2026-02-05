export class INVALID_CONTEXT extends Error {
  constructor(message = 'Personal task context must match user ID') {
    super(message)
  }
}

export class INVALID_ASSIGNEES extends Error {
  constructor(message = 'One or more assignees not found') {
    super(message)
  }
}

export class TASK_NOT_FOUND extends Error {
  constructor(message = 'Task not found') {
    super(message)
  }
}

export class INVALID_USERS extends Error {
  constructor(message = 'One or more users not found') {
    super(message)
  }
}

export class INVALID_CLUB extends Error {
  constructor(message = 'Club not found') {
    super(message)
  }
}

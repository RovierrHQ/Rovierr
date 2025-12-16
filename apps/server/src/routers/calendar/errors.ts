/**
 * Calendar Error Classes
 */

export class CalendarNotConnectedError extends Error {
  constructor(message = 'Calendar not connected') {
    super(message)
    this.name = 'CALENDAR_NOT_CONNECTED'
  }
}

export class NoAccessTokenError extends Error {
  constructor(message = 'No access token available') {
    super(message)
    this.name = 'NO_ACCESS_TOKEN'
  }
}

export class TokenRefreshError extends Error {
  constructor(message = 'Failed to refresh Google access token') {
    super(message)
    this.name = 'TOKEN_REFRESH_ERROR'
  }
}

export class CalendarWatchError extends Error {
  constructor(message = 'Failed to setup calendar watch') {
    super(message)
    this.name = 'CALENDAR_WATCH_ERROR'
  }
}

export class CalendarStopWatchError extends Error {
  constructor(message = 'Failed to stop calendar watch') {
    super(message)
    this.name = 'CALENDAR_STOP_WATCH_ERROR'
  }
}

export class CalendarFetchError extends Error {
  constructor(message = 'Failed to fetch calendar events') {
    super(message)
    this.name = 'CALENDAR_FETCH_ERROR'
  }
}

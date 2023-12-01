export class TimeoutException extends Error {
  constructor(message) {
    super(message)
    this.name = 'TimeoutException'
  }
}

export class ProviderError extends Error {
  constructor(err) {
    super(err)
    this.name = 'ProviderError'
  }
}

export class ApiError extends Error {
  constructor(err) {
    super(err)
    this.name = 'ApiError'
  }
}

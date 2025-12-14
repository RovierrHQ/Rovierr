export class UNAUTHORIZED extends Error {
  constructor(message = 'Unauthorized') {
    super(message)
  }
}

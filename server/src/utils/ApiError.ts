export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }

  static badRequest = (m = 'Bad request', d?: unknown) => new ApiError(400, m, d);
  static unauthorized = (m = 'Authentication required') => new ApiError(401, m);
  static forbidden = (m = 'You do not have access to this resource') => new ApiError(403, m);
  static notFound = (m = 'Resource not found') => new ApiError(404, m);
  static conflict = (m = 'Resource already exists') => new ApiError(409, m);
  static tooLarge = (m = 'Payload too large') => new ApiError(413, m);
  static internal = (m = 'Something went wrong') => new ApiError(500, m);
}

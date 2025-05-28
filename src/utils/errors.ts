export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, message)
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(400, message)
    Object.setPrototypeOf(this, BadRequestError.prototype)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message)
    Object.setPrototypeOf(this, UnauthorizedError.prototype)
  }
}

export class UnverifiedEmailError extends AppError {
  constructor(message = 'Please verify your email before logging in') {
    super(401, message)
    Object.setPrototypeOf(this, UnverifiedEmailError.prototype)
  }
}

export class EmailExistsError extends AppError {
  constructor(message = 'An account with this email already exists') {
    super(409, message)
    Object.setPrototypeOf(this, EmailExistsError.prototype)
  }
}

export class InvalidVerificationTokenError extends AppError {
  constructor(message = 'Invalid verification token') {
    super(400, message)
    Object.setPrototypeOf(this, InvalidVerificationTokenError.prototype)
  }
}

export class ExpiredVerificationTokenError extends AppError {
  constructor(message = 'Verification token has expired') {
    super(400, message)
    Object.setPrototypeOf(this, ExpiredVerificationTokenError.prototype)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message)
    Object.setPrototypeOf(this, ForbiddenError.prototype)
  }
}

export class UserNotFoundError extends AppError {
  constructor(message = 'User not found') {
    super(404, message)
    Object.setPrototypeOf(this, UserNotFoundError.prototype)
  }
}

export class EmailAlreadyVerifiedError extends AppError {
  constructor(message = 'Email is already verified') {
    super(400, message)
    Object.setPrototypeOf(this, EmailAlreadyVerifiedError.prototype)
  }
}

export class InvalidPasswordResetTokenError extends AppError {
  constructor(message = 'Invalid password reset token') {
    super(400, message)
    Object.setPrototypeOf(this, InvalidPasswordResetTokenError.prototype)
  }
}

export class ExpiredPasswordResetTokenError extends AppError {
  constructor(message = 'Password reset token has expired') {
    super(400, message)
    Object.setPrototypeOf(this, ExpiredPasswordResetTokenError.prototype)
  }
}

export interface ErrorResponse {
  status: 'error' | 'fail'
  message: string
  errors?: Record<string, string[]>
  stack?: string
}

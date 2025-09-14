export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class DatabaseError extends APIError {
  constructor(message: string, details?: any) {
    super(message, 500, 'DATABASE_ERROR', details);
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends APIError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}

export class ExternalServiceError extends APIError {
  constructor(service: string, message: string, details?: any) {
    super(`${service} service error: ${message}`, 502, 'EXTERNAL_SERVICE_ERROR', details);
    this.name = 'ExternalServiceError';
  }
}

export interface ErrorResponse {
  error: string;
  code?: string;
  details?: any;
  timestamp: string;
  requestId?: string;
  responseTime?: number;
}

export function createErrorResponse(
  error: Error | APIError,
  requestId?: string
): ErrorResponse {
  const response: ErrorResponse = {
    error: error.message,
    timestamp: new Date().toISOString(),
  };

  if (requestId) {
    response.requestId = requestId;
  }

  if (error instanceof APIError) {
    response.code = error.code;
    response.details = error.details;
  }

  return response;
}

export function handleAPIError(error: unknown): {
  response: ErrorResponse;
  status: number;
} {
  console.error('API Error:', error);

  if (error instanceof APIError) {
    return {
      response: createErrorResponse(error),
      status: error.statusCode,
    };
  }

  if (error instanceof Error) {
    return {
      response: createErrorResponse(error),
      status: 500,
    };
  }

  return {
    response: {
      error: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    },
    status: 500,
  };
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  backoffMultiplier: number = 2
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      const waitTime = delay * Math.pow(backoffMultiplier, attempt - 1);
      console.warn(`Attempt ${attempt} failed, retrying in ${waitTime}ms:`, lastError.message);
      
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError!;
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof ExternalServiceError) {
    return true;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('timeout') ||
      message.includes('network') ||
      message.includes('connection') ||
      message.includes('rate limit') ||
      message.includes('503') ||
      message.includes('502') ||
      message.includes('504')
    );
  }

  return false;
}

export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private maxFailures: number = 5,
    private resetTimeout: number = 60000
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.maxFailures) {
      this.state = 'open';
    }
  }

  getState(): string {
    return this.state;
  }

  getFailures(): number {
    return this.failures;
  }
}

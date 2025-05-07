import { AxiosError } from 'axios';

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public data?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export const handleApiError = (error: unknown): APIError => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message || error.message;
    return new APIError(
      message,
      error.response?.status,
      error.response?.data as Record<string, unknown>
    );
  }

  if (error instanceof Error) {
    return new APIError(error.message);
  }

  return new APIError('An unexpected error occurred');
}; 
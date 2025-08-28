export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: any): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }
  
  // Network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return new ApiError('Network connection failed. Please check your internet connection.');
  }
  
  // HTTP status errors
  if (error.message?.includes('HTTP 404')) {
    return new ApiError('The requested resource was not found.');
  }
  
  if (error.message?.includes('HTTP 401')) {
    return new ApiError('Authentication required. Please log in again.');
  }
  
  if (error.message?.includes('HTTP 403')) {
    return new ApiError('You do not have permission to perform this action.');
  }
  
  if (error.message?.includes('HTTP 500')) {
    return new ApiError('Server error occurred. Please try again later.');
  }
  
  if (error.message?.includes('HTTP 503')) {
    return new ApiError('Service temporarily unavailable. Please try again later.');
  }
  
  // Default error
  return new ApiError(error.message || 'An unexpected error occurred.');
};

export const logApiError = (error: ApiError, context?: string) => {
  const prefix = context ? `[${context}]` : '[API Error]';
  console.error(`${prefix} ${error.message}`, {
    statusCode: error.statusCode,
    originalError: error.originalError,
  });
};
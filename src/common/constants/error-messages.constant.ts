export const ERROR_MESSAGES = {
  RESOURCE_NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  INVALID_REQUEST: 'Invalid request',
  OPERATION_FAILED: 'Operation failed',
  VALIDATION_FAILED: 'Validation failed',
  INVALID_CREDENTIALS: 'Invalid credentials',
  INTERNAL_ERROR: 'An error occurred',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  
  FILE_TOO_LARGE: 'File size exceeds maximum limit of 5MB',
  INVALID_FILE_TYPE: 'File type not allowed',
  INVALID_FILE_SIGNATURE: 'File appears to be corrupted or malicious',
  FILE_UPLOAD_FAILED: 'File upload failed',
  FILE_NOT_FOUND: 'File not found',
  SUSPICIOUS_FILENAME: 'Invalid filename detected',
  CSRF_TOKEN_INVALID: 'Invalid or missing CSRF token',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later',
  TOKEN_EXPIRED: 'Authentication token has expired',
  TOKEN_INVALID: 'Invalid authentication token',
  

  EMAIL_ALREADY_REGISTERED: 'Email already registered',
  INCORRECT_CURRENT_PASSWORD: 'Current password is incorrect',
  PASSWORD_CHANGED_SUCCESS: 'Password changed successfully',
  PASSWORDS_DO_NOT_MATCH: 'New password and confirmation do not match',
} as const;
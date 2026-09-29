/**
 * Central Error Handling Middleware
 * Ensures sensitive stack traces are not leaked and returns friendly JSON.
 */
function errorHandler(err, req, res, next) {
  console.error('[CloudGuard Server Error]:', err);

  // Mongoose duplicate key error (fallback safeguard)
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      classification: 'REDUNDANT_EXACT',
      action: 'REJECTED',
      message: 'Database level uniqueness constraint triggered: Record already exists in cloud database.',
      error: 'Duplicate key collision'
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      classification: 'INVALID',
      action: 'REJECTED',
      message: 'Database validation failed.',
      errors: messages
    });
  }

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
    action: 'REJECTED'
  });
}

module.exports = {
  errorHandler
};

const AuditLog = require('../models/AuditLog');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Middleware to validate incoming record payload.
 * If invalid, records an audit log entry with classification 'INVALID' and rejects.
 */
async function validateRecordInput(req, res, next) {
  const { name, email, phone, city, organization, category, description } = req.body || {};
  const errors = [];

  // 1. Full Name validation
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Full name is required and must be at least 2 characters long.');
  } else if (name.trim().length > 100) {
    errors.push('Full name must not exceed 100 characters.');
  }

  // 2. Email validation
  if (!email || typeof email !== 'string') {
    errors.push('Email address is required.');
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push('Invalid email address format (e.g. user@example.com).');
  } else if (email.trim().length > 120) {
    errors.push('Email address is too long.');
  }

  // 3. Phone validation
  if (!phone || typeof phone !== 'string') {
    errors.push('Phone number is required.');
  } else {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) {
      errors.push('Phone number must contain between 7 and 15 digits.');
    }
  }

  // If validation fails
  if (errors.length > 0) {
    const errorReason = errors.join(' ');

    // Log the invalid submission attempt to AuditLog if database is accessible
    try {
      await AuditLog.create({
        submittedData: {
          name: name || '',
          email: email || '',
          phone: phone || '',
          city: city || '',
          organization: organization || '',
          category: category || '',
          description: description || ''
        },
        classification: 'INVALID',
        similarityScore: 0,
        action: 'REJECTED',
        reason: `Input validation failed: ${errorReason}`
      });
    } catch (auditErr) {
      // Non-fatal if DB is offline
    }

    return res.status(400).json({
      success: false,
      classification: 'INVALID',
      action: 'REJECTED',
      message: 'Validation failed. Please review the submitted fields.',
      errors,
      submittedData: req.body
    });
  }

  next();
}

module.exports = {
  validateRecordInput
};

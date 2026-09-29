const crypto = require('crypto');

/**
 * Generate a deterministic SHA-256 fingerprint for a record.
 * Uses normalized full identity: name, email, and phone.
 * @param {string} normalizedName 
 * @param {string} normalizedEmail 
 * @param {string} normalizedPhone 
 * @returns {string} SHA-256 hex digest
 */
function generateDataHash(normalizedName, normalizedEmail, normalizedPhone) {
  const payload = `${normalizedName}|${normalizedEmail}|${normalizedPhone}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Generate a secondary contact hash based on email and phone.
 * Useful for indexing strong primary identifiers.
 * @param {string} normalizedEmail 
 * @param {string} normalizedPhone 
 * @returns {string} SHA-256 hex digest
 */
function generateContactHash(normalizedEmail, normalizedPhone) {
  const payload = `${normalizedEmail}|${normalizedPhone}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

module.exports = {
  generateDataHash,
  generateContactHash
};

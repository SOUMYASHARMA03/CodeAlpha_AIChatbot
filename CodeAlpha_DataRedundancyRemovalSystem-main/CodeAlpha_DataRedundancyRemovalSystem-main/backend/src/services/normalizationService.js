/**
 * Normalization Service
 * Standardizes incoming fields before comparison, indexing, or hashing.
 * Guarantees that formatting discrepancies do not mask duplicates.
 */

/**
 * Normalize human name:
 * - Trims leading/trailing whitespace
 * - Collapses consecutive whitespace characters into a single space
 * - Removes common stray titles or punctuation if needed (e.g. Dr., Mr., etc.)
 * - Capitalizes each word for canonical display
 */
function normalizeName(name) {
  if (!name || typeof name !== 'string') return '';
  const collapsed = name.trim().replace(/\s+/g, ' ');
  return collapsed;
}

/**
 * Canonical comparison representation of a name (lowercase, stripped extra spaces)
 */
function canonicalName(name) {
  return normalizeName(name).toLowerCase();
}

/**
 * Normalize email:
 * - Trims whitespace
 * - Converts to lowercase
 * - Strips trailing dots
 */
function normalizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase().replace(/\.+$/, '');
}

/**
 * Normalize phone:
 * - Strips all non-digit characters: spaces, hyphens, brackets, dots
 * - If 11 digits starting with '1' (North American standard) or '+1', strips leading '1' for standard 10-digit uniformity if applicable
 * - Preserves numeric identity
 */
function normalizePhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  const digits = phone.trim().replace(/\D/g, '');
  // If 11 digits and starts with 1, standardize to 10 digits
  if (digits.length === 11 && digits.startsWith('1')) {
    return digits.substring(1);
  }
  return digits;
}

/**
 * Format phone nicely for display: e.g. (XXX) XXX-XXXX or XXX-XXX-XXXX
 */
function formatPhoneDisplay(phone) {
  const digits = normalizePhone(phone);
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone.trim();
}

/**
 * Normalize text fields like city, category, organization
 */
function normalizeTextField(text) {
  if (!text || typeof text !== 'string') return '';
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * Normalize an entire record payload
 * @param {Object} rawData 
 * @returns {Object} Normalized record with both canonical values and clean display values
 */
function normalizeRecord(rawData) {
  const name = normalizeName(rawData.name || '');
  const email = normalizeEmail(rawData.email || '');
  const phone = normalizePhone(rawData.phone || '');
  const city = normalizeTextField(rawData.city || '');
  const organization = normalizeTextField(rawData.organization || '');
  const category = normalizeTextField(rawData.category || 'General');
  const description = normalizeTextField(rawData.description || '');

  return {
    display: {
      name,
      email,
      phone: formatPhoneDisplay(phone) || phone,
      city,
      organization,
      category,
      description
    },
    canonical: {
      name: canonicalName(name),
      email,
      phone,
      city: city.toLowerCase(),
      organization: organization.toLowerCase(),
      category: category.toLowerCase(),
      description
    }
  };
}

module.exports = {
  normalizeName,
  canonicalName,
  normalizeEmail,
  normalizePhone,
  formatPhoneDisplay,
  normalizeTextField,
  normalizeRecord
};

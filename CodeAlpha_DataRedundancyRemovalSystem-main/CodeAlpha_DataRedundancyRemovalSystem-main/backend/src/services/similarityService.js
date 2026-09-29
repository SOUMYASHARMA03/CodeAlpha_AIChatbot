const {
  levenshteinSimilarity,
  jaroWinklerSimilarity,
  phoneSimilarity,
  emailSimilarity
} = require('../utils/stringSimilarity');

/**
 * Weights assigned to fields for composite similarity scoring.
 * Strong primary identifiers receive the highest weight.
 */
const FIELD_WEIGHTS = {
  email: 0.35,
  phone: 0.30,
  name: 0.20,
  organization: 0.10,
  city: 0.05
};

/**
 * Compare two normalized records and calculate multi-attribute similarity.
 * @param {Object} incoming - normalized record (canonical representation)
 * @param {Object} existing - existing DB record
 * @returns {Object} detailed similarity assessment
 */
function calculateRecordSimilarity(incoming, existing) {
  // Field-level similarity evaluations
  const nameScore = Math.max(
    jaroWinklerSimilarity(incoming.name, existing.name),
    levenshteinSimilarity(incoming.name, existing.name)
  );

  const emailScore = emailSimilarity(incoming.email, existing.email);
  const phoneScore = phoneSimilarity(incoming.phone, existing.phone);

  const orgScore = incoming.organization && existing.organization
    ? levenshteinSimilarity(incoming.organization, existing.organization)
    : 0;

  const cityScore = incoming.city && existing.city
    ? levenshteinSimilarity(incoming.city, existing.city)
    : 0;

  // Composite weighted score
  const compositeScore = Math.round(
    nameScore * FIELD_WEIGHTS.name +
    emailScore * FIELD_WEIGHTS.email +
    phoneScore * FIELD_WEIGHTS.phone +
    orgScore * FIELD_WEIGHTS.organization +
    cityScore * FIELD_WEIGHTS.city
  );

  const matchedFields = [];
  const differentFields = [];

  if (nameScore >= 80) matchedFields.push(`Name (${nameScore}%)`);
  else differentFields.push(`Name (${nameScore}%)`);

  if (emailScore >= 85) matchedFields.push(`Email (${emailScore}%)`);
  else differentFields.push(`Email (${emailScore}%)`);

  if (phoneScore >= 85) matchedFields.push(`Phone (${phoneScore}%)`);
  else differentFields.push(`Phone (${phoneScore}%)`);

  if (orgScore >= 80) matchedFields.push(`Organization (${orgScore}%)`);
  if (cityScore >= 80) matchedFields.push(`City (${cityScore}%)`);

  const strongIdentifierMatch = emailScore >= 85 || phoneScore >= 85;
  const strongIdentifierConflict = emailScore < 70 && phoneScore < 70;

  return {
    compositeScore: Math.min(100, Math.max(0, compositeScore)),
    fieldScores: {
      name: nameScore,
      email: emailScore,
      phone: phoneScore,
      organization: orgScore,
      city: cityScore
    },
    matchedFields,
    differentFields,
    strongIdentifierMatch,
    strongIdentifierConflict
  };
}

module.exports = {
  calculateRecordSimilarity,
  FIELD_WEIGHTS
};

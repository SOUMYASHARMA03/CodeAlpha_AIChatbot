const Record = require('../models/Record');
const { normalizeRecord } = require('./normalizationService');
const { generateDataHash, generateContactHash } = require('../utils/hashUtil');
const { calculateRecordSimilarity } = require('./similarityService');

/**
 * Deduplication & Redundancy Classification Engine
 * Coordinates normalization, hashing, candidate indexing,
 * fuzzy scoring, and false-positive resolution.
 */
class DeduplicationService {
  /**
   * Evaluate an incoming raw record against the database.
   * @param {Object} rawData - Incoming user input
   * @returns {Promise<Object>} Detailed evaluation and decision
   */
  async evaluateRecord(rawData) {
    // 1. Data Normalization
    const { display, canonical } = normalizeRecord(rawData);

    // 2. Generate Deterministic Fingerprints
    const dataHash = generateDataHash(canonical.name, canonical.email, canonical.phone);
    const contactHash = generateContactHash(canonical.email, canonical.phone);

    // 3. Exact Duplicate Detection via Indexed Fingerprint (O(1) Cloud Lookup)
    const exactMatch = await Record.findOne({ dataHash }).lean();

    if (exactMatch) {
      return {
        classification: 'REDUNDANT_EXACT',
        action: 'REJECTED',
        isAllowed: false,
        similarityScore: 100,
        reason: 'Exact duplicate record detected. A record with identical name, email, and phone already exists in the cloud database.',
        normalizedRecord: display,
        canonicalRecord: canonical,
        dataHash,
        contactHash,
        matchedRecord: {
          _id: exactMatch._id,
          name: exactMatch.name,
          email: exactMatch.email,
          phone: exactMatch.phone,
          organization: exactMatch.organization,
          city: exactMatch.city,
          category: exactMatch.category,
          createdAt: exactMatch.createdAt
        },
        fieldBreakdown: {
          nameScore: 100,
          emailScore: 100,
          phoneScore: 100,
          orgScore: 100,
          cityScore: 100
        },
        matchedFields: ['Full Name (100%)', 'Email (100%)', 'Phone (100%)'],
        differentFields: []
      };
    }

    // 4. Retrieve candidate records for similarity & false-positive analysis
    // Optimize performance: Query candidates matching email OR phone OR name first
    let candidates = await Record.find({
      $or: [
        { normalizedEmail: canonical.email },
        { normalizedPhone: canonical.phone },
        { normalizedName: canonical.name },
        { contactHash }
      ]
    }).limit(20).lean();

    // If no direct index matches found, fetch a candidate pool of recent records to detect typos in all fields
    if (candidates.length === 0) {
      candidates = await Record.find({})
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();
    }

    // If database is completely empty, it's definitively UNIQUE
    if (candidates.length === 0) {
      return {
        classification: 'UNIQUE',
        action: 'INSERTED',
        isAllowed: true,
        similarityScore: 0,
        reason: 'Database is currently empty or no candidates exist. Record verified as unique.',
        normalizedRecord: display,
        canonicalRecord: canonical,
        dataHash,
        contactHash,
        matchedRecord: null,
        fieldBreakdown: {
          nameScore: 0,
          emailScore: 0,
          phoneScore: 0,
          orgScore: 0,
          cityScore: 0
        },
        matchedFields: [],
        differentFields: []
      };
    }

    // 5. Evaluate similarity against all candidates
    let bestCandidate = null;
    let highestSimilarity = -1;
    let bestEvaluation = null;

    for (const candidate of candidates) {
      const candidateCanonical = {
        name: candidate.normalizedName || candidate.name.toLowerCase(),
        email: candidate.normalizedEmail || candidate.email.toLowerCase(),
        phone: candidate.normalizedPhone || candidate.phone.replace(/\D/g, ''),
        organization: (candidate.organization || '').toLowerCase(),
        city: (candidate.city || '').toLowerCase()
      };

      const evalResult = calculateRecordSimilarity(canonical, candidateCanonical);

      if (evalResult.compositeScore > highestSimilarity) {
        highestSimilarity = evalResult.compositeScore;
        bestCandidate = candidate;
        bestEvaluation = evalResult;
      }
    }

    const {
      compositeScore,
      fieldScores,
      matchedFields,
      differentFields,
      strongIdentifierMatch,
      strongIdentifierConflict
    } = bestEvaluation;

    // 6. False Positive Classification Logic:
    // When name or general profile is very similar/identical (>= 80%),
    // but the strong identifiers (email and phone) are verified to be distinct.
    // E.g. "John Doe" with jane@example.com & 9876543211 vs existing "John Doe" with john@example.com & 9876543210.
    const isNameSimilar = fieldScores.name >= 80;
    const isContactDistinct = strongIdentifierConflict; // both email and phone dissimilar (< 50%)

    if (isNameSimilar && isContactDistinct) {
      return {
        classification: 'FALSE_POSITIVE',
        action: 'INSERTED',
        isAllowed: true,
        similarityScore: compositeScore,
        reason: `Potential duplicate flagged due to high Name match (${fieldScores.name}%), but independent validation confirmed unique primary credentials (Email & Phone differ). Classified as False Positive.`,
        normalizedRecord: display,
        canonicalRecord: canonical,
        dataHash,
        contactHash,
        matchedRecord: {
          _id: bestCandidate._id,
          name: bestCandidate.name,
          email: bestCandidate.email,
          phone: bestCandidate.phone,
          organization: bestCandidate.organization,
          city: bestCandidate.city,
          category: bestCandidate.category,
          createdAt: bestCandidate.createdAt
        },
        fieldBreakdown: fieldScores,
        matchedFields,
        differentFields
      };
    }

    // 7. Redundant Similar Classification Logic:
    // Sufficient evidence of redundancy:
    // - Strong identifier match (same email or same phone) + high name similarity (>= 70%) -> typo/variation
    // - OR composite score >= 80%
    const isEmailOrPhoneMatch = fieldScores.email >= 90 || fieldScores.phone >= 90;
    const isRedundantSimilar =
      (isEmailOrPhoneMatch && fieldScores.name >= 65) ||
      compositeScore >= 80;

    if (isRedundantSimilar) {
      return {
        classification: 'REDUNDANT_SIMILAR',
        action: 'REJECTED',
        isAllowed: false,
        similarityScore: compositeScore,
        reason: `Redundant record detected with ${compositeScore}% overall similarity. Key identifiers match existing record '${bestCandidate.name}' (${bestCandidate.email}).`,
        normalizedRecord: display,
        canonicalRecord: canonical,
        dataHash,
        contactHash,
        matchedRecord: {
          _id: bestCandidate._id,
          name: bestCandidate.name,
          email: bestCandidate.email,
          phone: bestCandidate.phone,
          organization: bestCandidate.organization,
          city: bestCandidate.city,
          category: bestCandidate.category,
          createdAt: bestCandidate.createdAt
        },
        fieldBreakdown: fieldScores,
        matchedFields,
        differentFields
      };
    }

    // 8. Unique Classification Logic:
    // Low composite score (< 50%) or no conflict
    return {
      classification: 'UNIQUE',
      action: 'INSERTED',
      isAllowed: true,
      similarityScore: compositeScore,
      reason: compositeScore > 20
        ? `Record determined to be unique with low similarity (${compositeScore}%) to nearest candidate.`
        : 'Unique and verified record. No duplicate found in cloud database.',
      normalizedRecord: display,
      canonicalRecord: canonical,
      dataHash,
      contactHash,
      matchedRecord: compositeScore > 20 ? {
        _id: bestCandidate._id,
        name: bestCandidate.name,
        email: bestCandidate.email,
        phone: bestCandidate.phone
      } : null,
      fieldBreakdown: fieldScores,
      matchedFields,
      differentFields
    };
  }
}

module.exports = new DeduplicationService();

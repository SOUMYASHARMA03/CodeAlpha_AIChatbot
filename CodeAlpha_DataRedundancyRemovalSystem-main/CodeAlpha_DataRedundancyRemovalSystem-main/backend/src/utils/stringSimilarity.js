/**
 * String Similarity & Fuzzy Matching Utilities
 * Implements Levenshtein Distance, Jaro-Winkler Metric, and Dice Coefficient
 * for high-accuracy deduplication analysis.
 */

/**
 * Calculate Levenshtein Distance between two strings.
 * @param {string} a 
 * @param {string} b 
 * @returns {number} Minimum edit distance
 */
function levenshteinDistance(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,       // deletion
        matrix[i][j - 1] + 1,       // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[a.length][b.length];
}

/**
 * Normalized Levenshtein similarity score between 0 and 100.
 * @param {string} a 
 * @param {string} b 
 * @returns {number} Percentage similarity (0 - 100)
 */
function levenshteinSimilarity(a, b) {
  const s1 = String(a || '').trim().toLowerCase();
  const s2 = String(b || '').trim().toLowerCase();
  if (s1 === s2) return 100;
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 100;
  const dist = levenshteinDistance(s1, s2);
  const sim = (1 - dist / maxLen) * 100;
  return Math.max(0, Math.min(100, Math.round(sim * 10) / 10));
}

/**
 * Jaro distance between two strings (0.0 to 1.0).
 */
function jaroDistance(s1, s2) {
  if (s1 === s2) return 1.0;
  const len1 = s1.length;
  const len2 = s2.length;
  if (len1 === 0 || len2 === 0) return 0.0;

  const matchDistance = Math.floor(Math.max(len1, len2) / 2) - 1;
  const s1Matches = new Array(len1).fill(false);
  const s2Matches = new Array(len2).fill(false);

  let matches = 0;
  let transpositions = 0;

  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, len2);
    for (let j = start; j < end; j++) {
      if (s2Matches[j]) continue;
      if (s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0.0;

  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }

  return (
    (matches / len1 +
      matches / len2 +
      (matches - transpositions / 2) / matches) /
    3.0
  );
}

/**
 * Jaro-Winkler similarity (0 to 100%).
 * Adds standard prefix bonus for strings sharing a common prefix (up to 4 chars).
 * @param {string} a 
 * @param {string} b 
 * @returns {number} Score (0 - 100)
 */
function jaroWinklerSimilarity(a, b) {
  const s1 = String(a || '').trim().toLowerCase();
  const s2 = String(b || '').trim().toLowerCase();
  if (s1 === s2) return 100;
  if (!s1.length || !s2.length) return 0;

  const jaro = jaroDistance(s1, s2);
  let prefix = 0;
  const maxPrefix = 4;
  for (let i = 0; i < Math.min(s1.length, s2.length, maxPrefix); i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }

  const p = 0.1; // standard scaling factor
  const jw = jaro + prefix * p * (1 - jaro);
  return Math.max(0, Math.min(100, Math.round(jw * 1000) / 10));
}

/**
 * Phone number similarity:
 * Compares digits only. High score for identical digits or suffix match.
 * @param {string} phoneA 
 * @param {string} phoneB 
 * @returns {number} Score (0 - 100)
 */
function phoneSimilarity(phoneA, phoneB) {
  const p1 = String(phoneA || '').replace(/\D/g, '');
  const p2 = String(phoneB || '').replace(/\D/g, '');

  if (p1 === p2) return 100;
  if (!p1.length || !p2.length) return 0;

  // Check if one is a sub-number (e.g. with or without country code)
  if (p1.endsWith(p2) || p2.endsWith(p1)) {
    const minLen = Math.min(p1.length, p2.length);
    if (minLen >= 10) return 95;
  }

  return levenshteinSimilarity(p1, p2);
}

/**
 * Email similarity:
 * Compares username and domain separately to catch typos.
 * @param {string} emailA 
 * @param {string} emailB 
 * @returns {number} Score (0 - 100)
 */
function emailSimilarity(emailA, emailB) {
  const e1 = String(emailA || '').trim().toLowerCase();
  const e2 = String(emailB || '').trim().toLowerCase();

  if (e1 === e2) return 100;
  if (!e1 || !e2) return 0;

  const [user1, dom1] = e1.split('@');
  const [user2, dom2] = e2.split('@');

  if (!dom1 || !dom2) return levenshteinSimilarity(e1, e2);

  const domainMatch = dom1 === dom2;
  const userSim = jaroWinklerSimilarity(user1, user2);

  if (domainMatch) {
    return Math.round(userSim * 0.7 + 30);
  } else {
    // Distinct domains indicate different mail servers/institutions
    const domSim = levenshteinSimilarity(dom1, dom2);
    return Math.round(userSim * 0.3 + domSim * 0.2);
  }
}

module.exports = {
  levenshteinDistance,
  levenshteinSimilarity,
  jaroWinklerSimilarity,
  phoneSimilarity,
  emailSimilarity
};

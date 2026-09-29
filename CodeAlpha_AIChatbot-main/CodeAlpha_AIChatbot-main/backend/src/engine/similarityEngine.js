/**
 * Similarity Engine
 * Combines Cosine Similarity (TF-IDF), Jaccard Index, and Levenshtein Edit Distance.
 */

const NlpPreprocessor = require('./nlpPreprocessor');
const synonyms = require('../data/synonyms.json');
const config = require('../config/config');

class SimilarityEngine {
  constructor(corpusPatterns = []) {
    this.idfMap = new Map();
    this.buildIDF(corpusPatterns);
  }

  /**
   * Pre-calculate Inverse Document Frequency (IDF) over all patterns
   */
  buildIDF(patterns) {
    const totalDocs = patterns.length || 1;
    const docFrequencies = new Map();

    patterns.forEach(pattern => {
      const tokens = new Set(NlpPreprocessor.processTokens(pattern, true));
      tokens.forEach(token => {
        docFrequencies.set(token, (docFrequencies.get(token) || 0) + 1);
      });
    });

    docFrequencies.forEach((df, term) => {
      // Standard smoothed IDF formula: log((N + 1) / (df + 1)) + 1
      const idf = Math.log((totalDocs + 1) / (df + 1)) + 1;
      this.idfMap.set(term, idf);
    });
  }

  /**
   * Compute TF-IDF vector for a given token array
   */
  computeTfIdfVector(tokens) {
    const tf = new Map();
    tokens.forEach(token => {
      tf.set(token, (tf.get(token) || 0) + 1);
    });

    const vector = new Map();
    let normSq = 0;

    tf.forEach((count, term) => {
      const termTf = count / tokens.length;
      const termIdf = this.idfMap.get(term) || (Math.log(100) + 1);
      const weight = termTf * termIdf;
      vector.set(term, weight);
      normSq += weight * weight;
    });

    return { vector, magnitude: Math.sqrt(normSq) };
  }

  /**
   * Cosine similarity between two token vectors
   */
  cosineSimilarity(tokensA, tokensB) {
    if (!tokensA.length || !tokensB.length) return 0;

    const vecA = this.computeTfIdfVector(tokensA);
    const vecB = this.computeTfIdfVector(tokensB);

    if (vecA.magnitude === 0 || vecB.magnitude === 0) return 0;

    let dotProduct = 0;
    vecA.vector.forEach((weightA, term) => {
      if (vecB.vector.has(term)) {
        dotProduct += weightA * vecB.vector.get(term);
      }
    });

    return dotProduct / (vecA.magnitude * vecB.magnitude);
  }

  /**
   * Jaccard Similarity over sets of tokens and character 2-grams
   */
  jaccardSimilarity(textA, textB) {
    const ngramsA = new Set(NlpPreprocessor.getNGrams(textA, 2));
    const ngramsB = new Set(NlpPreprocessor.getNGrams(textB, 2));

    if (!ngramsA.size && !ngramsB.size) return 1;
    if (!ngramsA.size || !ngramsB.size) return 0;

    let intersectionCount = 0;
    ngramsA.forEach(ngram => {
      if (ngramsB.has(ngram)) intersectionCount++;
    });

    const unionCount = ngramsA.size + ngramsB.size - intersectionCount;
    return unionCount > 0 ? intersectionCount / unionCount : 0;
  }

  /**
   * Levenshtein Distance & Normalized Similarity (0.0 to 1.0)
   */
  levenshteinSimilarity(s1 = '', s2 = '') {
    const a = s1.trim();
    const b = s2.trim();
    if (a === b) return 1.0;
    if (!a.length || !b.length) return 0.0;

    const dp = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(0));

    for (let i = 0; i <= a.length; i++) dp[i][0] = i;
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,      // deletion
          dp[i][j - 1] + 1,      // insertion
          dp[i - 1][j - 1] + cost // substitution
        );
      }
    }

    const distance = dp[a.length][b.length];
    const maxLength = Math.max(a.length, b.length);
    return 1 - (distance / maxLength);
  }

  /**
   * Check for domain synonym matches
   */
  checkSynonymBoost(queryTokens, patternTokens) {
    let boost = 0;
    const querySet = new Set(queryTokens);
    const patternSet = new Set(patternTokens);

    for (const [key, synList] of Object.entries(synonyms)) {
      const hasKeyInPattern = patternSet.has(key) || synList.some(s => patternSet.has(s));
      const hasKeyInQuery = querySet.has(key) || synList.some(s => querySet.has(s));

      if (hasKeyInPattern && hasKeyInQuery) {
        boost += 0.15; // semantic reinforcement
        break;
      }
    }
    return Math.min(boost, 0.25);
  }

  /**
   * Calculate blended confidence score between user query and a target pattern
   */
  calculateScore(rawQuery, rawPattern) {
    const normQuery = NlpPreprocessor.normalize(rawQuery);
    const normPattern = NlpPreprocessor.normalize(rawPattern);

    // Exact match bypass
    if (normQuery === normPattern) {
      return 1.0;
    }

    // Word boundary sequence containment check
    const boundaryRegex = new RegExp(`\\b${normPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (normPattern.length > 5 && boundaryRegex.test(normQuery)) {
      return 0.95;
    }
    const queryBoundaryRegex = new RegExp(`\\b${normQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (normQuery.length > 5 && queryBoundaryRegex.test(normPattern)) {
      return 0.90;
    }

    const tokensQ = NlpPreprocessor.processTokens(normQuery, false);
    const tokensP = NlpPreprocessor.processTokens(normPattern, false);

    const cosineScore = this.cosineSimilarity(tokensQ, tokensP);
    const jaccardScore = this.jaccardSimilarity(normQuery, normPattern);
    const levScore = this.levenshteinSimilarity(normQuery, normPattern);
    const synBoost = this.checkSynonymBoost(tokensQ, tokensP);

    const { tfidf, jaccard, levenshtein } = config.nlp.weights;
    const compositeScore = (cosineScore * tfidf) + (jaccardScore * jaccard) + (levScore * levenshtein) + synBoost;

    return Math.min(1.0, Math.max(0.0, Number(compositeScore.toFixed(4))));
  }
}

module.exports = SimilarityEngine;

/**
 * Application Configuration
 * CloudBot — AI-Powered Website Assistant
 */
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || 'development',
  botName: 'CloudBot',
  
  // NLP & Matching Thresholds
  nlp: {
    // Confidence threshold for accepting an intent match (0.0 to 1.0)
    matchConfidenceThreshold: 0.38,
    // High-confidence threshold (direct match)
    highConfidenceThreshold: 0.65,
    // N-gram sizes for Jaccard and Substring analysis
    ngramSize: 2,
    // Similarity weight distribution: [Cosine/TFIDF: 0.45, Jaccard: 0.35, Levenshtein: 0.20]
    weights: {
      tfidf: 0.45,
      jaccard: 0.35,
      levenshtein: 0.20
    }
  },

  // Optional External Integrations
  mongoUri: process.env.MONGODB_URI || null,
  geminiApiKey: process.env.GEMINI_API_KEY || null,
  enableGenerativeFallback: process.env.ENABLE_GENERATIVE_FALLBACK === 'true'
};

/**
 * Intent Classifier
 * Evaluates queries against predefined intent patterns and determines optimal match.
 */

const intentsData = require('../data/intents.json');
const SimilarityEngine = require('./similarityEngine');
const config = require('../config/config');

class IntentClassifier {
  constructor(customIntents = null) {
    this.intents = customIntents || intentsData;
    
    // Extract all corpus patterns for IDF computation
    const allPatterns = [];
    this.intents.forEach(intent => {
      if (Array.isArray(intent.patterns)) {
        allPatterns.push(...intent.patterns);
      }
    });

    this.similarityEngine = new SimilarityEngine(allPatterns);
  }

  /**
   * Classify user query into an intent
   * @param {string} query User input text
   * @param {object} context Optional conversational context
   * @returns {object} Classification result
   */
  classify(query = '', context = {}) {
    if (!query || typeof query !== 'string' || !query.trim()) {
      return {
        matched: false,
        intent: 'empty_query',
        confidence: 0,
        pattern: null,
        response: "Please type a message or choose one of the suggested options below.",
        quickReplies: ["What services do you offer?", "Tell me about pricing plans"]
      };
    }

    let bestMatch = {
      matched: false,
      intent: 'fallback',
      category: 'General',
      confidence: 0,
      pattern: null,
      response: null,
      quickReplies: [],
      candidates: []
    };

    const scoredIntents = [];

    for (const intentObj of this.intents) {
      let maxPatternScore = 0;
      let matchedPattern = null;

      for (const pattern of intentObj.patterns) {
        const score = this.similarityEngine.calculateScore(query, pattern);
        if (score > maxPatternScore) {
          maxPatternScore = score;
          matchedPattern = pattern;
        }
      }

      // Small priority adjustment (e.g. human handoff or explicit questions get slight boost)
      const priorityBoost = ((intentObj.priority || 1) - 1) * 0.02;
      const finalScore = Math.min(1.0, maxPatternScore + priorityBoost);

      scoredIntents.push({
        intent: intentObj.intent,
        category: intentObj.category,
        confidence: finalScore,
        rawScore: maxPatternScore,
        matchedPattern,
        responses: intentObj.responses,
        quickReplies: intentObj.quickReplies || []
      });
    }

    // Sort descending by confidence
    scoredIntents.sort((a, b) => b.confidence - a.confidence);

    const top = scoredIntents[0];
    const threshold = config.nlp.matchConfidenceThreshold;

    if (top && top.confidence >= threshold) {
      // Pick response (can randomize if multiple options provided)
      const responseIndex = Math.floor(Math.random() * top.responses.length);
      const chosenResponse = top.responses[responseIndex];

      bestMatch = {
        matched: true,
        intent: top.intent,
        category: top.category,
        confidence: Number(top.confidence.toFixed(3)),
        confidenceLevel: top.confidence >= config.nlp.highConfidenceThreshold ? 'high' : 'medium',
        pattern: top.matchedPattern,
        response: chosenResponse,
        quickReplies: top.quickReplies,
        candidates: scoredIntents.slice(0, 3).map(c => ({
          intent: c.intent,
          confidence: Number(c.confidence.toFixed(3)),
          pattern: c.matchedPattern
        }))
      };
    } else {
      // Below threshold -> Fallback
      bestMatch = {
        matched: false,
        intent: 'fallback',
        category: 'Fallback',
        confidence: top ? Number(top.confidence.toFixed(3)) : 0,
        confidenceLevel: 'low',
        pattern: top ? top.matchedPattern : null,
        response: "I'm not quite sure I understand that query yet. Could you try rephrasing, or select one of the common topics below? You can also type 'speak to a human' to talk with our team.",
        quickReplies: [
          "What services do you offer?",
          "Tell me about pricing plans",
          "What are your working hours?",
          "Speak to a live human agent"
        ],
        candidates: scoredIntents.slice(0, 3).map(c => ({
          intent: c.intent,
          confidence: Number(c.confidence.toFixed(3))
        }))
      };
    }

    return bestMatch;
  }
}

module.exports = IntentClassifier;

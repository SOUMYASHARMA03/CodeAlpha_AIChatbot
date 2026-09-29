/**
 * Chatbot Orchestration Engine
 * Coordinates NLP classification, session context, quick replies, and analytics.
 */

const IntentClassifier = require('./intentClassifier');
const config = require('../config/config');

class ChatbotEngine {
  constructor() {
    this.classifier = new IntentClassifier();
    this.sessions = new Map(); // sessionId -> { history: [], lastIntent: null, context: {} }
    this.stats = {
      totalQueries: 0,
      matchedQueries: 0,
      fallbackQueries: 0,
      intentsTriggered: {},
      helpfulRatings: 0,
      unhelpfulRatings: 0
    };
  }

  /**
   * Get or create a session
   */
  getSession(sessionId = 'default-session') {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        id: sessionId,
        createdAt: new Date(),
        history: [],
        lastIntent: null,
        context: {}
      });
    }
    return this.sessions.get(sessionId);
  }

  /**
   * Process an incoming user message
   */
  async processMessage(userMessage, sessionId = 'default-session') {
    const session = this.getSession(sessionId);
    const startTime = Date.now();

    // 1. Run intent classification
    const matchResult = this.classifier.classify(userMessage, session.context);
    const processingTimeMs = Date.now() - startTime;

    // 2. Track internal analytics
    this.stats.totalQueries++;
    if (matchResult.matched) {
      this.stats.matchedQueries++;
      this.stats.intentsTriggered[matchResult.intent] = (this.stats.intentsTriggered[matchResult.intent] || 0) + 1;
    } else {
      this.stats.fallbackQueries++;
    }

    // 3. Update session history & context
    session.lastIntent = matchResult.intent;
    const botResponsePayload = {
      id: `bot-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sender: 'bot',
      text: matchResult.response,
      intent: matchResult.intent,
      category: matchResult.category,
      confidence: matchResult.confidence,
      confidenceLevel: matchResult.confidenceLevel,
      matchedPattern: matchResult.pattern,
      quickReplies: matchResult.quickReplies,
      candidates: matchResult.candidates,
      processingTimeMs,
      timestamp: new Date().toISOString()
    };

    session.history.push({
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userMessage,
      timestamp: new Date().toISOString()
    });

    session.history.push(botResponsePayload);

    // Keep session history to last 50 entries
    if (session.history.length > 50) {
      session.history = session.history.slice(-50);
    }

    return botResponsePayload;
  }

  /**
   * Record user feedback (helpful / unhelpful)
   */
  recordFeedback(messageId, isHelpful) {
    if (isHelpful) {
      this.stats.helpfulRatings++;
    } else {
      this.stats.unhelpfulRatings++;
    }
    return {
      success: true,
      helpfulRatings: this.stats.helpfulRatings,
      unhelpfulRatings: this.stats.unhelpfulRatings
    };
  }

  /**
   * Return real-time analytics
   */
  getAnalytics() {
    const total = this.stats.totalQueries;
    const accuracyRate = total > 0 ? ((this.stats.matchedQueries / total) * 100).toFixed(1) : '100.0';
    const totalRatings = this.stats.helpfulRatings + this.stats.unhelpfulRatings;
    const satisfactionRate = totalRatings > 0 
      ? ((this.stats.helpfulRatings / totalRatings) * 100).toFixed(1)
      : '100.0';

    return {
      botName: config.botName,
      totalQueries: this.stats.totalQueries,
      matchedQueries: this.stats.matchedQueries,
      fallbackQueries: this.stats.fallbackQueries,
      accuracyRate: `${accuracyRate}%`,
      satisfactionRate: `${satisfactionRate}%`,
      helpfulRatings: this.stats.helpfulRatings,
      unhelpfulRatings: this.stats.unhelpfulRatings,
      intentsDistribution: this.stats.intentsTriggered,
      totalIntentsCount: this.classifier.intents.length,
      activeSessionsCount: this.sessions.size
    };
  }

  /**
   * Clear session history
   */
  clearSession(sessionId) {
    if (this.sessions.has(sessionId)) {
      this.sessions.delete(sessionId);
    }
    return { success: true };
  }
}

// Singleton engine instance
const chatbotEngineInstance = new ChatbotEngine();
module.exports = chatbotEngineInstance;

/**
 * Chat Controller
 * Endpoints for message processing, chat history, feedback, and intent discovery.
 */

const chatbotEngine = require('../engine/chatbotEngine');
const storage = require('../models/storage');
const intentsData = require('../data/intents.json');

exports.sendMessage = async (req, res) => {
  try {
    const { message, sessionId = 'default-session' } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message parameter is required and must be non-empty.'
      });
    }

    const response = await chatbotEngine.processMessage(message.trim(), sessionId);

    // Persist to storage
    storage.saveMessage({
      sessionId,
      userMessage: message,
      botResponse: response.text,
      intent: response.intent,
      confidence: response.confidence,
      timestamp: response.timestamp
    });

    return res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error processing chat message:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred while processing the message.'
    });
  }
};

exports.getHistory = (req, res) => {
  try {
    const { sessionId = 'default-session' } = req.params;
    const session = chatbotEngine.getSession(sessionId);

    return res.status(200).json({
      success: true,
      data: {
        sessionId,
        history: session.history
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve conversation history.'
    });
  }
};

exports.clearHistory = (req, res) => {
  try {
    const { sessionId = 'default-session' } = req.params;
    chatbotEngine.clearSession(sessionId);

    return res.status(200).json({
      success: true,
      message: `Session ${sessionId} cleared successfully.`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to clear session.'
    });
  }
};

exports.submitFeedback = (req, res) => {
  try {
    const { messageId, isHelpful } = req.body;

    if (typeof isHelpful !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'isHelpful must be a boolean (true or false).'
      });
    }

    const result = chatbotEngine.recordFeedback(messageId, isHelpful);
    storage.saveFeedback({ messageId, isHelpful, timestamp: new Date() });

    return res.status(200).json({
      success: true,
      message: 'Feedback recorded successfully.',
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to record feedback.'
    });
  }
};

exports.getIntents = (req, res) => {
  try {
    const summary = intentsData.map(item => ({
      intent: item.intent,
      category: item.category,
      patternsCount: item.patterns.length,
      samplePatterns: item.patterns.slice(0, 3)
    }));

    return res.status(200).json({
      success: true,
      totalIntents: intentsData.length,
      data: summary
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch intents.'
    });
  }
};

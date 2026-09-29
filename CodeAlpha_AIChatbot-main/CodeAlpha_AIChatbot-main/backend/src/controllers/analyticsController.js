/**
 * Analytics Controller
 * Provides real-time metrics on matching accuracy, queries, and user satisfaction.
 */

const chatbotEngine = require('../engine/chatbotEngine');

exports.getAnalytics = (req, res) => {
  try {
    const analytics = chatbotEngine.getAnalytics();
    return res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve analytics data.'
    });
  }
};

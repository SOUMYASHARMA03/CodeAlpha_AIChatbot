/**
 * CloudBot — AI-Powered Website Assistant
 * CodeAlpha Cloud Computing Task 4: Making a Chatbot
 * Express REST API Server
 */

const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const chatController = require('./controllers/chatController');
const analyticsController = require('./controllers/analyticsController');

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    bot: config.botName,
    service: 'CloudBot REST API Engine',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Chat Endpoints
app.post('/api/chat', chatController.sendMessage);
app.get('/api/chat/history/:sessionId?', chatController.getHistory);
app.delete('/api/chat/history/:sessionId?', chatController.clearHistory);
app.post('/api/chat/feedback', chatController.submitFeedback);
app.get('/api/chat/intents', chatController.getIntents);

// Analytics Endpoint
app.get('/api/analytics', analyticsController.getAnalytics);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint ${req.method} ${req.url} not found.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error occurred.'
  });
});

// Start Server if not imported by test
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`🚀 ${config.botName} API Engine is active on port ${config.port}`);
    console.log(`📡 Health Check: http://localhost:${config.port}/api/health`);
    console.log(`💬 Chat API:     http://localhost:${config.port}/api/chat`);
    console.log(`📊 Analytics:    http://localhost:${config.port}/api/analytics`);
    console.log(`=======================================================`);
  });
}

module.exports = app;

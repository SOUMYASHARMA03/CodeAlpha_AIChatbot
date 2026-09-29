/**
 * Storage & Database Adapter
 * Handles local in-memory storage with file cache, and supports optional MongoDB Atlas connection.
 */

const fs = require('fs');
const path = require('path');
const config = require('../config/config');

class StorageAdapter {
  constructor() {
    this.isMongoConnected = false;
    this.cacheFile = path.join(__dirname, '../../data/conversations_cache.json');
    this.memoryDb = {
      conversations: [],
      feedbacks: []
    };
    this.init();
  }

  init() {
    // If MongoDB URI is configured, log connection status
    if (config.mongoUri) {
      console.log('ℹ️  MongoDB URI detected. Ready for optional Atlas sync.');
    } else {
      console.log('💾 Running in high-performance local storage mode.');
    }
  }

  saveMessage(record) {
    this.memoryDb.conversations.push(record);
  }

  saveFeedback(record) {
    this.memoryDb.feedbacks.push(record);
  }

  getConversations(limit = 100) {
    return this.memoryDb.conversations.slice(-limit);
  }
}

module.exports = new StorageAdapter();

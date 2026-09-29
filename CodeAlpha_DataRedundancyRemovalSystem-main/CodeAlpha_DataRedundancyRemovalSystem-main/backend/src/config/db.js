const mongoose = require('mongoose');
let MongoMemoryServer;

try {
  MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
} catch (e) {
  MongoMemoryServer = null;
}

let isConnected = false;
let connectionError = null;
let memoryServerInstance = null;

/**
 * Connect to MongoDB Atlas, local MongoDB, or fallback to In-Memory database
 * @param {string} [customUri] - Optional custom URI (e.g. For tests)
 */
async function connectDB(customUri) {
  const uri = customUri || process.env.MONGODB_URI;

  // Avoid re-connecting if already connected
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    connectionError = null;
    return true;
  }

  // Helper to attempt connection
  if (uri && !uri.includes('cluster0.mongodb.net')) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 4000,
        autoIndex: true
      });

      isConnected = true;
      connectionError = null;
      console.log('\x1b[32m%s\x1b[0m', `✅ [CloudGuard] Cloud Database Connected: ${conn.connection.host} (${conn.connection.name})`);
      return true;
    } catch (error) {
      console.warn('\x1b[33m%s\x1b[0m', `⚠️ [CloudGuard Warning] Primary MongoDB connection failed (${error.message}).`);
    }
  }

  // Fallback to MongoMemoryServer in development/testing mode
  if (MongoMemoryServer) {
    try {
      console.log('\x1b[36m%s\x1b[0m', '⚡ [CloudGuard Dev Mode] Starting automatic In-Memory MongoDB Database...');
      memoryServerInstance = await MongoMemoryServer.create();
      const memUri = memoryServerInstance.getUri();
      const conn = await mongoose.connect(memUri);

      isConnected = true;
      connectionError = null;
      console.log('\x1b[32m%s\x1b[0m', `✅ [CloudGuard] In-Memory MongoDB Connected & Ready! (${conn.connection.host})`);

      // Seed baseline data in-memory if empty
      const Record = require('../models/Record');
      const count = await Record.countDocuments();
      if (count === 0) {
        console.log('\x1b[33m%s\x1b[0m', '🌱 [CloudGuard] Seeding baseline demo records into In-Memory database...');
        const { BASELINE_RECORDS, HISTORICAL_AUDITS } = require('../../scripts/seed');
        const { normalizeRecord } = require('../services/normalizationService');
        const { generateDataHash, generateContactHash } = require('../utils/hashUtil');
        const AuditLog = require('../models/AuditLog');

        for (const rec of BASELINE_RECORDS) {
          const { display, canonical } = normalizeRecord(rec);
          const dataHash = generateDataHash(canonical.name, canonical.email, canonical.phone);
          const contactHash = generateContactHash(canonical.email, canonical.phone);

          await Record.create({
            name: display.name,
            email: display.email,
            phone: display.phone,
            city: display.city,
            organization: display.organization,
            category: display.category,
            description: display.description,
            dataHash,
            contactHash,
            normalizedName: canonical.name,
            normalizedEmail: canonical.email,
            normalizedPhone: canonical.phone,
            validationStatus: 'UNIQUE',
            similarityScore: 0,
            verificationNotes: 'Baseline verified cloud record'
          });
        }

        for (const log of HISTORICAL_AUDITS) {
          await AuditLog.create(log);
        }
        console.log('\x1b[32m%s\x1b[0m', '🌱 Baseline data seeded automatically!');
      }

      return true;
    } catch (memError) {
      connectionError = memError.message;
      console.error('\x1b[31m%s\x1b[0m', `❌ [CloudGuard Error] In-Memory MongoDB failed to start: ${memError.message}`);
      return false;
    }
  }

  connectionError = 'MONGODB_URI invalid and mongodb-memory-server unavailable.';
  return false;
}

/**
 * Disconnect from MongoDB
 */
async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
  }
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
    memoryServerInstance = null;
  }
}

/**
 * Get current database connection state and diagnostics
 */
function getDbStatus() {
  const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  const stateCode = mongoose.connection.readyState;
  return {
    connected: stateCode === 1,
    state: states[stateCode] || 'Unknown',
    host: isConnected ? mongoose.connection.host : null,
    database: isConnected ? mongoose.connection.name : null,
    error: connectionError,
    isInMemory: !!memoryServerInstance
  };
}

module.exports = {
  connectDB,
  disconnectDB,
  getDbStatus
};


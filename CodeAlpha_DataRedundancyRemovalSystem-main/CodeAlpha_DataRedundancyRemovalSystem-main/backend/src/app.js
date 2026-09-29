const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const recordRoutes = require('./routes/recordRoutes');
const auditRoutes = require('./routes/auditRoutes');
const statsRoutes = require('./routes/statsRoutes');
const { errorHandler } = require('./middleware/errorHandler');
const { getDbStatus } = require('./config/db');
const Record = require('./models/Record');
const AuditLog = require('./models/AuditLog');

const app = express();

// Security Middleware
app.use(helmet());

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true
}));

// Body Parsing Middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Logging Middleware (suppress during tests)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health Check & Cloud DB Diagnostics
app.get('/api/health', (req, res) => {
  const dbStatus = getDbStatus();
  res.json({
    status: 'ok',
    service: 'CloudGuard - Data Redundancy Removal System',
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

// Seed & Reset API for Live Evaluation
app.post('/api/reset', async (req, res) => {
  try {
    await Promise.all([
      Record.deleteMany({}),
      AuditLog.deleteMany({})
    ]);
    res.json({
      success: true,
      message: 'Cloud database cleared successfully. Ready for clean demonstration.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/seed', async (req, res) => {
  try {
    const { BASELINE_RECORDS, HISTORICAL_AUDITS } = require('../scripts/seed');
    const { normalizeRecord } = require('./services/normalizationService');
    const { generateDataHash, generateContactHash } = require('./utils/hashUtil');

    await Promise.all([
      Record.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

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

    res.json({
      success: true,
      message: 'Cloud database seeded with 5 baseline records and 5 audit logs for demonstration.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mount Functional API Routes
app.use('/api/records', recordRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/stats', statsRoutes);

// 404 Handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Record = require('../src/models/Record');
const AuditLog = require('../src/models/AuditLog');
const { normalizeRecord } = require('../src/services/normalizationService');
const { generateDataHash, generateContactHash } = require('../src/utils/hashUtil');

const BASELINE_RECORDS = [
  {
    name: 'Dr. Sarah Connor',
    email: 'sarah.connor@cyberdyne.io',
    phone: '4155550199',
    city: 'San Francisco',
    organization: 'Cyberdyne Systems',
    category: 'Cloud Engineering',
    description: 'Lead Distributed Systems Architect overseeing multi-region cloud cluster resilience.'
  },
  {
    name: 'Alex Morgan',
    email: 'alex.morgan@acme.corp',
    phone: '2125550144',
    city: 'New York',
    organization: 'Acme Technologies',
    category: 'Database Administration',
    description: 'Senior DB specialist managing distributed MongoDB Atlas clusters and indexing strategies.'
  },
  {
    name: 'Michael Chang',
    email: 'mchang@biolabs.org',
    phone: '6175550182',
    city: 'Boston',
    organization: 'Cambridge BioLabs',
    category: 'Healthcare',
    description: 'Genomic data pipeline engineer building fault-tolerant storage for clinical research.'
  },
  {
    name: 'Elena Rostova',
    email: 'elena.rostova@quantum.ai',
    phone: '2065550129',
    city: 'Seattle',
    organization: 'Quantum Dynamics',
    category: 'AI Research',
    description: 'Machine Learning Operations lead maintaining model feature stores.'
  },
  {
    name: 'David K. Miller',
    email: 'david.miller@apexcloud.net',
    phone: '3125550177',
    city: 'Chicago',
    organization: 'Apex Cloud Systems',
    category: 'Security',
    description: 'Cloud security auditor monitoring data leakage prevention and access control.'
  }
];

const HISTORICAL_AUDITS = [
  {
    timestamp: new Date(Date.now() - 3600000 * 24),
    submittedData: {
      name: 'Dr. Sarah Connor',
      email: 'sarah.connor@cyberdyne.io',
      phone: '4155550199',
      city: 'San Francisco',
      organization: 'Cyberdyne Systems',
      category: 'Cloud Engineering',
      description: 'Initial cloud account registration.'
    },
    classification: 'UNIQUE',
    similarityScore: 0,
    action: 'INSERTED',
    reason: 'Initial baseline record. Verified unique entity in cloud storage.'
  },
  {
    timestamp: new Date(Date.now() - 3600000 * 18),
    submittedData: {
      name: '  sarah connor  ',
      email: 'SARAH.CONNOR@CYBERDYNE.IO',
      phone: '(415) 555-0199',
      city: 'San Francisco',
      organization: 'Cyberdyne Systems'
    },
    classification: 'REDUNDANT_EXACT',
    similarityScore: 100,
    action: 'REJECTED',
    reason: 'Exact duplicate record detected. A record with identical name, email, and phone already exists in the cloud database.'
  },
  {
    timestamp: new Date(Date.now() - 3600000 * 12),
    submittedData: {
      name: 'Sara Connor',
      email: 'sarah.connor@cyberdyne.io',
      phone: '415-555-0199',
      city: 'San Francisco',
      organization: 'Cyberdyne Systems'
    },
    classification: 'REDUNDANT_SIMILAR',
    similarityScore: 92,
    action: 'REJECTED',
    reason: "Redundant record detected with 92% overall similarity. Key identifiers match existing record 'Dr. Sarah Connor' (sarah.connor@cyberdyne.io)."
  },
  {
    timestamp: new Date(Date.now() - 3600000 * 6),
    submittedData: {
      name: 'Alex Morgan',
      email: 'alex.m.morgan@nyu.edu',
      phone: '2125550999',
      city: 'New York',
      organization: 'NYU Medical Center',
      category: 'Healthcare'
    },
    classification: 'FALSE_POSITIVE',
    similarityScore: 58,
    action: 'INSERTED',
    reason: 'Potential duplicate flagged due to high Name match (100%), but independent validation confirmed unique primary credentials (Email & Phone differ). Classified as False Positive.'
  },
  {
    timestamp: new Date(Date.now() - 3600000 * 2),
    submittedData: {
      name: 'J',
      email: 'not-an-email',
      phone: '123'
    },
    classification: 'INVALID',
    similarityScore: 0,
    action: 'REJECTED',
    reason: 'Input validation failed: Full name is required and must be at least 2 characters long. Invalid email address format. Phone number must contain between 7 and 15 digits.'
  }
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set. Please create backend/.env with your MongoDB Atlas connection string.');
    process.exit(1);
  }

  try {
    console.log('Connecting to cloud database...');
    await mongoose.connect(uri);
    console.log('Connected to MongoDB Atlas.');

    console.log('Clearing existing records and audit logs...');
    await Promise.all([
      Record.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    console.log('Seeding baseline verified records...');
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

    console.log('Seeding historical audit logs...');
    for (const log of HISTORICAL_AUDITS) {
      await AuditLog.create(log);
    }

    console.log('✅ Seed completed successfully! Database is ready with sample records and audit trails.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  seed();
}

module.exports = { BASELINE_RECORDS, HISTORICAL_AUDITS, seed };

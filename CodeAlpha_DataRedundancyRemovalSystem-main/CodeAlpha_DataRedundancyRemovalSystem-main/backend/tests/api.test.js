const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Record = require('../src/models/Record');
const AuditLog = require('../src/models/AuditLog');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Record.deleteMany({});
  await AuditLog.deleteMany({});
});

describe('CloudGuard REST API Endpoints', () => {
  test('GET /api/health returns operational status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBeDefined();
  });

  test('POST /api/records rejects invalid input with 400 and logs INVALID audit entry', async () => {
    const invalidPayload = {
      name: '',
      email: 'not-an-email',
      phone: '123'
    };

    const res = await request(app)
      .post('/api/records')
      .send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.classification).toBe('INVALID');
    expect(res.body.action).toBe('REJECTED');
    expect(res.body.errors.length).toBeGreaterThan(0);

    // Verify logged into AuditLog
    const auditCount = await AuditLog.countDocuments({ classification: 'INVALID' });
    expect(auditCount).toBe(1);
  });

  test('POST /api/records accepts unique record with 201 and persists to cloud DB', async () => {
    const validPayload = {
      name: 'Dr. Sarah Connor',
      email: 'sarah.connor@cyberdyne.io',
      phone: '4155550199',
      city: 'San Francisco',
      organization: 'Cyberdyne Systems',
      category: 'Cloud Engineering',
      description: 'Distributed systems architect'
    };

    const res = await request(app)
      .post('/api/records')
      .send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.classification).toBe('UNIQUE');
    expect(res.body.action).toBe('INSERTED');
    expect(res.body.record._id).toBeDefined();

    // Verify stored in DB
    const stored = await Record.findById(res.body.record._id);
    expect(stored).not.toBeNull();
    expect(stored.email).toBe('sarah.connor@cyberdyne.io');
  });

  test('POST /api/records rejects duplicate record with 409 and logs REDUNDANT_EXACT', async () => {
    const recordData = {
      name: 'Michael Chang',
      email: 'mchang@biolabs.org',
      phone: '6175550182',
      city: 'Boston',
      organization: 'Cambridge BioLabs',
      category: 'Healthcare'
    };

    // First insertion -> Success
    await request(app).post('/api/records').send(recordData);

    // Second insertion (duplicate) -> Rejection
    const res = await request(app)
      .post('/api/records')
      .send(recordData);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.classification).toBe('REDUNDANT_EXACT');
    expect(res.body.action).toBe('REJECTED');
    expect(res.body.similarityScore).toBe(100);

    // Database should still only have 1 record
    const totalRecords = await Record.countDocuments({});
    expect(totalRecords).toBe(1);
  });

  test('GET /api/stats returns accurate metrics', async () => {
    // Insert 1 record
    await request(app).post('/api/records').send({
      name: 'Elena Rostova',
      email: 'elena.rostova@quantum.ai',
      phone: '2065550129',
      city: 'Seattle',
      organization: 'Quantum Dynamics',
      category: 'AI Research'
    });

    const res = await request(app).get('/api/stats');
    expect(res.status).toBe(200);
    expect(res.body.stats.totalRecords).toBe(1);
    expect(res.body.stats.uniqueRecords).toBe(1);
  });

  test('GET /api/audit returns audit records', async () => {
    await request(app).post('/api/records').send({
      name: 'David K. Miller',
      email: 'david.miller@apexcloud.net',
      phone: '3125550177',
      city: 'Chicago',
      organization: 'Apex Cloud Systems',
      category: 'Security'
    });

    const res = await request(app).get('/api/audit');
    expect(res.status).toBe(200);
    expect(res.body.logs.length).toBeGreaterThan(0);
    expect(res.body.logs[0].classification).toBe('UNIQUE');
  });
});

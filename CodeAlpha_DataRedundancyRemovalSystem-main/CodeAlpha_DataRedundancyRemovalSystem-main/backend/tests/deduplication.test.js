const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const deduplicationService = require('../src/services/deduplicationService');
const Record = require('../src/models/Record');
const { normalizeRecord } = require('../src/services/normalizationService');
const { generateDataHash, generateContactHash } = require('../src/utils/hashUtil');

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
});

describe('Deduplication Engine Core Tests', () => {
  test('Requirement: Identify and Append Unique Record', async () => {
    const rawData = {
      name: 'Alice Johnson',
      email: 'alice@cloudinnovations.io',
      phone: '4155551234',
      city: 'San Francisco',
      organization: 'Cloud Innovations',
      category: 'Engineering',
      description: 'Senior Kubernetes Engineer'
    };

    const evaluation = await deduplicationService.evaluateRecord(rawData);

    expect(evaluation.classification).toBe('UNIQUE');
    expect(evaluation.action).toBe('INSERTED');
    expect(evaluation.isAllowed).toBe(true);
    expect(evaluation.similarityScore).toBe(0);

    // Persist as a verified record
    const { display, canonical } = normalizeRecord(rawData);
    await Record.create({
      ...display,
      dataHash: evaluation.dataHash,
      contactHash: evaluation.contactHash,
      normalizedName: canonical.name,
      normalizedEmail: canonical.email,
      normalizedPhone: canonical.phone,
      validationStatus: evaluation.classification
    });

    const count = await Record.countDocuments();
    expect(count).toBe(1);
  });

  test('Requirement: Identify and Prevent Exact Duplicate', async () => {
    // 1. Insert original record
    const original = {
      name: 'Dr. Sarah Connor',
      email: 'sarah.connor@cyberdyne.io',
      phone: '4155550199',
      city: 'San Francisco',
      organization: 'Cyberdyne Systems',
      category: 'Cloud Engineering'
    };

    const { display, canonical } = normalizeRecord(original);
    const dataHash = generateDataHash(canonical.name, canonical.email, canonical.phone);
    const contactHash = generateContactHash(canonical.email, canonical.phone);

    await Record.create({
      ...display,
      dataHash,
      contactHash,
      normalizedName: canonical.name,
      normalizedEmail: canonical.email,
      normalizedPhone: canonical.phone,
      validationStatus: 'UNIQUE'
    });

    // 2. Submit exact same record
    const duplicateAttempt = {
      name: 'Dr. Sarah Connor',
      email: 'sarah.connor@cyberdyne.io',
      phone: '4155550199',
      city: 'San Francisco',
      organization: 'Cyberdyne Systems'
    };

    const evaluation = await deduplicationService.evaluateRecord(duplicateAttempt);

    expect(evaluation.classification).toBe('REDUNDANT_EXACT');
    expect(evaluation.action).toBe('REJECTED');
    expect(evaluation.isAllowed).toBe(false);
    expect(evaluation.similarityScore).toBe(100);
    expect(evaluation.matchedRecord).toBeDefined();
    expect(evaluation.matchedRecord.email).toBe('sarah.connor@cyberdyne.io');
  });

  test('Requirement: Identify Exact Duplicate Despite Case and Whitespace Discrepancies', async () => {
    // Original record
    const original = {
      name: 'John Doe',
      email: 'john.doe@techcorp.com',
      phone: '9876543210'
    };
    const { display, canonical } = normalizeRecord(original);
    await Record.create({
      ...display,
      dataHash: generateDataHash(canonical.name, canonical.email, canonical.phone),
      contactHash: generateContactHash(canonical.email, canonical.phone),
      normalizedName: canonical.name,
      normalizedEmail: canonical.email,
      normalizedPhone: canonical.phone,
      validationStatus: 'UNIQUE'
    });

    // Normalized variation: upper case, extra spaces, phone formatting
    const formattedVariation = {
      name: '   JOHN    DOE   ',
      email: '  JOHN.DOE@TECHCORP.COM  ',
      phone: '(987) 654-3210'
    };

    const evaluation = await deduplicationService.evaluateRecord(formattedVariation);

    expect(evaluation.classification).toBe('REDUNDANT_EXACT');
    expect(evaluation.action).toBe('REJECTED');
    expect(evaluation.isAllowed).toBe(false);
  });

  test('Requirement: Identify Similar Duplicate (Typo in Name with Identical Credentials)', async () => {
    // Original record
    const original = {
      name: 'John Doe',
      email: 'john.doe@techcorp.com',
      phone: '9876543210',
      organization: 'Tech Corp'
    };
    const { display, canonical } = normalizeRecord(original);
    await Record.create({
      ...display,
      dataHash: generateDataHash(canonical.name, canonical.email, canonical.phone),
      contactHash: generateContactHash(canonical.email, canonical.phone),
      normalizedName: canonical.name,
      normalizedEmail: canonical.email,
      normalizedPhone: canonical.phone,
      validationStatus: 'UNIQUE'
    });

    // Similar variation: "Jon Doe" instead of "John Doe" with same email and phone
    const similarVariation = {
      name: 'Jon Doe',
      email: 'john.doe@techcorp.com',
      phone: '9876543210',
      organization: 'Tech Corp'
    };

    const evaluation = await deduplicationService.evaluateRecord(similarVariation);

    expect(evaluation.classification).toBe('REDUNDANT_SIMILAR');
    expect(evaluation.action).toBe('REJECTED');
    expect(evaluation.isAllowed).toBe(false);
    expect(evaluation.similarityScore).toBeGreaterThanOrEqual(80);
  });

  test('Requirement: Identify False Positive (Identical Name but Independent Credentials)', async () => {
    // Existing record: "John Doe" at techcorp.com
    const existing = {
      name: 'John Doe',
      email: 'john.doe@techcorp.com',
      phone: '9876543210',
      city: 'New York',
      organization: 'Tech Corp'
    };
    const { display, canonical } = normalizeRecord(existing);
    await Record.create({
      ...display,
      dataHash: generateDataHash(canonical.name, canonical.email, canonical.phone),
      contactHash: generateContactHash(canonical.email, canonical.phone),
      normalizedName: canonical.name,
      normalizedEmail: canonical.email,
      normalizedPhone: canonical.phone,
      validationStatus: 'UNIQUE'
    });

    // Incoming record: Another person also named "John Doe", but completely different email and phone
    const falsePositiveCandidate = {
      name: 'John Doe',
      email: 'johndoe.finance@wallstreet.org',
      phone: '2125559876',
      city: 'Chicago',
      organization: 'Wall Street Capital'
    };

    const evaluation = await deduplicationService.evaluateRecord(falsePositiveCandidate);

    expect(evaluation.classification).toBe('FALSE_POSITIVE');
    expect(evaluation.action).toBe('INSERTED');
    expect(evaluation.isAllowed).toBe(true);
    expect(evaluation.fieldBreakdown.name).toBe(100);
    expect(evaluation.fieldBreakdown.email).toBeLessThan(60);
    expect(evaluation.fieldBreakdown.phone).toBeLessThan(60);
  });
});

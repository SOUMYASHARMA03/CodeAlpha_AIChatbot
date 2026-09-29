const {
  normalizeName,
  canonicalName,
  normalizeEmail,
  normalizePhone,
  formatPhoneDisplay,
  normalizeRecord
} = require('../src/services/normalizationService');

const { generateDataHash, generateContactHash } = require('../src/utils/hashUtil');

describe('Data Normalization & Hash Generation Unit Tests', () => {
  describe('Name Normalization', () => {
    test('should trim leading and trailing spaces', () => {
      expect(normalizeName('   John Doe   ')).toBe('John Doe');
    });

    test('should collapse internal redundant spaces into a single space', () => {
      expect(normalizeName('John     Fitzgerald    Kennedy')).toBe('John Fitzgerald Kennedy');
    });

    test('canonicalName should produce identical lowercase representation for formatted variations', () => {
      const canonical1 = canonicalName('John Doe');
      const canonical2 = canonicalName('  john   doe  ');
      expect(canonical1).toBe(canonical2);
      expect(canonical1).toBe('john doe');
    });
  });

  describe('Email Normalization', () => {
    test('should convert email to lowercase and trim spaces', () => {
      expect(normalizeEmail('  JOHN.DOE@EXAMPLE.COM  ')).toBe('john.doe@example.com');
    });

    test('should remove stray trailing dots from email', () => {
      expect(normalizeEmail('user@test.org.')).toBe('user@test.org');
    });
  });

  describe('Phone Number Normalization', () => {
    test('should strip non-numeric characters (hyphens, parentheses, spaces)', () => {
      expect(normalizePhone('(555) 123-4567')).toBe('5551234567');
      expect(normalizePhone('555.123.4567')).toBe('5551234567');
      expect(normalizePhone('+1 555-123-4567')).toBe('5551234567');
    });

    test('formatPhoneDisplay should format 10-digit number to standard readable format', () => {
      expect(formatPhoneDisplay('5551234567')).toBe('(555) 123-4567');
    });
  });

  describe('Deterministic Fingerprint / Hash Consistency', () => {
    test('should generate identical SHA-256 hash for identical normalized records', () => {
      const hash1 = generateDataHash('john doe', 'john@example.com', '5551234567');
      const hash2 = generateDataHash('john doe', 'john@example.com', '5551234567');
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 hex string length
    });

    test('should generate different hashes for different data', () => {
      const hashA = generateDataHash('john doe', 'john@example.com', '5551234567');
      const hashB = generateDataHash('jane doe', 'jane@example.com', '5551234568');
      expect(hashA).not.toBe(hashB);
    });

    test('normalizeRecord should process variations to identical hashes', () => {
      const recA = normalizeRecord({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '(555) 123-4567'
      });

      const recB = normalizeRecord({
        name: '  john   doe  ',
        email: 'JOHN@EXAMPLE.COM',
        phone: '555-123-4567'
      });

      const hashA = generateDataHash(recA.canonical.name, recA.canonical.email, recA.canonical.phone);
      const hashB = generateDataHash(recB.canonical.name, recB.canonical.email, recB.canonical.phone);

      expect(hashA).toBe(hashB);
    });
  });
});

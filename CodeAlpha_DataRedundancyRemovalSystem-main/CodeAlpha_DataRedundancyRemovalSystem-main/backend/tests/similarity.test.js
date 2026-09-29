const {
  levenshteinDistance,
  levenshteinSimilarity,
  jaroWinklerSimilarity,
  phoneSimilarity,
  emailSimilarity
} = require('../src/utils/stringSimilarity');

const { calculateRecordSimilarity } = require('../src/services/similarityService');

describe('Similarity & Fuzzy Matching Unit Tests', () => {
  describe('Levenshtein Distance & Similarity', () => {
    test('identical strings have distance 0 and similarity 100%', () => {
      expect(levenshteinDistance('cloud', 'cloud')).toBe(0);
      expect(levenshteinSimilarity('cloud', 'cloud')).toBe(100);
    });

    test('single character typo produces high similarity', () => {
      expect(levenshteinDistance('mongodb', 'mongodc')).toBe(1);
      expect(levenshteinSimilarity('mongodb', 'mongodc')).toBeGreaterThan(80);
    });

    test('completely distinct strings have low similarity', () => {
      expect(levenshteinSimilarity('apple', 'quantum')).toBeLessThan(30);
    });
  });

  describe('Jaro-Winkler Similarity', () => {
    test('rewards matching prefixes in names', () => {
      const score = jaroWinklerSimilarity('Martha', 'Marhta');
      expect(score).toBeGreaterThan(90);
    });

    test('handles minor name abbreviations/typos', () => {
      const score = jaroWinklerSimilarity('Alexander', 'Alexandr');
      expect(score).toBeGreaterThan(90);
    });
  });

  describe('Phone and Email Similarity', () => {
    test('identical phones return 100%', () => {
      expect(phoneSimilarity('5551234567', '(555) 123-4567')).toBe(100);
    });

    test('differing phones return low score', () => {
      expect(phoneSimilarity('5551234567', '9998887777')).toBeLessThan(50);
    });

    test('emails with same username typo return proportional similarity', () => {
      const score = emailSimilarity('johndoe@example.com', 'johndo@example.com');
      expect(score).toBeGreaterThan(85);
    });
  });

  describe('Composite Record Similarity Assessment', () => {
    test('evaluates false positive candidate: matching name but distinct credentials', () => {
      const incoming = {
        name: 'john doe',
        email: 'jane@different.org',
        phone: '1112223333',
        organization: 'Independent',
        city: 'New York'
      };

      const existing = {
        name: 'john doe',
        email: 'john@original.com',
        phone: '9998887777',
        organization: 'Original Corp',
        city: 'Chicago'
      };

      const result = calculateRecordSimilarity(incoming, existing);
      expect(result.fieldScores.name).toBe(100);
      expect(result.strongIdentifierConflict).toBe(true);
      expect(result.compositeScore).toBeLessThan(50);
    });
  });
});

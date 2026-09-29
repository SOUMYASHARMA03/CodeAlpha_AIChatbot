/**
 * NLP Text Preprocessor
 * Normalizes, cleans, tokenizes, and stems raw user queries.
 */

const CONTRACTIONS = {
  "what's": "what is",
  "what're": "what are",
  "how's": "how is",
  "where's": "where is",
  "who's": "who is",
  "when's": "when is",
  "i'm": "i am",
  "you're": "you are",
  "we're": "we are",
  "they're": "they are",
  "can't": "cannot",
  "cant": "cannot",
  "won't": "will not",
  "wont": "will not",
  "don't": "do not",
  "dont": "do not",
  "doesn't": "does not",
  "doesnt": "does not",
  "didn't": "did not",
  "it's": "it is",
  "thats": "that is",
  "that's": "that is",
  "there's": "there is",
  "let's": "let us"
};

// Light stop words that carry little semantic distinction, preserving interrogatives
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'in', 'on', 'at', 'by', 'for', 'with', 'about', 'to', 'from', 'of',
  'please', 'just', 'could', 'would', 'should', 'tell', 'me', 'us'
]);

class NlpPreprocessor {
  /**
   * Complete normalization pipeline
   */
  static normalize(text = '') {
    if (typeof text !== 'string') return '';

    let cleaned = text.toLowerCase().trim();

    // 1. Expand contractions
    for (const [contraction, expanded] of Object.entries(CONTRACTIONS)) {
      const regex = new RegExp(`\\b${contraction}\\b`, 'gi');
      cleaned = cleaned.replace(regex, expanded);
    }

    // 2. Remove emojis and non-alphanumeric punctuation (except letters, numbers, and spaces)
    cleaned = cleaned.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
    cleaned = cleaned.replace(/[^\w\s]/g, ' ');

    // 3. Compress multiple whitespaces
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
  }

  /**
   * Split string into array of normalized tokens
   */
  static tokenize(text = '') {
    const normalized = this.normalize(text);
    if (!normalized) return [];
    return normalized.split(' ').filter(token => token.length > 0);
  }

  /**
   * Light stemming (suffixes: ing, ed, ly, es, s, tion, ment)
   */
  static stem(word = '') {
    if (word.length <= 3) return word;

    let stemmed = word;

    if (stemmed.endsWith('ies') && stemmed.length > 4) {
      return stemmed.slice(0, -3) + 'y';
    }
    if (stemmed.endsWith('ing') && stemmed.length > 5) {
      return stemmed.slice(0, -3);
    }
    if (stemmed.endsWith('tion') && stemmed.length > 5) {
      return stemmed.slice(0, -4);
    }
    if (stemmed.endsWith('ment') && stemmed.length > 5) {
      return stemmed.slice(0, -4);
    }
    if (stemmed.endsWith('ed') && stemmed.length > 4) {
      return stemmed.slice(0, -2);
    }
    if (stemmed.endsWith('ly') && stemmed.length > 4) {
      return stemmed.slice(0, -2);
    }
    if (stemmed.endsWith('es') && stemmed.length > 4) {
      return stemmed.slice(0, -2);
    }
    if (stemmed.endsWith('s') && !stemmed.endsWith('ss') && stemmed.length > 3) {
      return stemmed.slice(0, -1);
    }

    return stemmed;
  }

  /**
   * Tokenize, filter stopwords, and stem tokens
   */
  static processTokens(text = '', filterStopWords = false) {
    const tokens = this.tokenize(text);
    return tokens
      .filter(t => !filterStopWords || !STOP_WORDS.has(t))
      .map(t => this.stem(t));
  }

  /**
   * Generate character n-grams of a string
   */
  static getNGrams(str = '', n = 2) {
    const cleaned = this.normalize(str).replace(/\s+/g, '_');
    if (cleaned.length < n) return [cleaned];
    const ngrams = [];
    for (let i = 0; i <= cleaned.length - n; i++) {
      ngrams.push(cleaned.substring(i, i + n));
    }
    return ngrams;
  }
}

module.exports = NlpPreprocessor;

/**
 * NLP Preprocessor Unit Tests
 */

const NlpPreprocessor = require('../engine/nlpPreprocessor');

function runNlpTests() {
  console.log('\n--- Running NLP Preprocessor Tests ---');
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
    }
  }

  // 1. Contraction expansion
  const expanded = NlpPreprocessor.normalize("What's your pricing and what're the rates? Can't pay.");
  assert(expanded.includes('what is') && expanded.includes('what are') && expanded.includes('cannot'), 'Expands contractions properly');

  // 2. Punctuation and emoji removal
  const cleaned = NlpPreprocessor.normalize("Hello! Are you open??? 🚀 💻");
  assert(cleaned === 'hello are you open', 'Strips punctuation and emojis cleanly');

  // 3. Tokenization
  const tokens = NlpPreprocessor.tokenize("Cloud migration and security services");
  assert(tokens.length === 5 && tokens[0] === 'cloud', 'Tokenizes text accurately');

  // 4. Stemming
  const stemmed = NlpPreprocessor.processTokens("services pricing migrating servers");
  assert(stemmed.includes('servic') || stemmed.includes('service'), 'Handles word stemming effectively');

  // 5. N-grams
  const ngrams = NlpPreprocessor.getNGrams("cloud", 2);
  assert(ngrams.length === 4 && ngrams[0] === 'cl', 'Generates 2-grams correctly');

  console.log(`NLP Tests Completed: ${passed}/${total} passed`);
  return { passed, total };
}

module.exports = runNlpTests;

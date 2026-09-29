/**
 * Comprehensive Test Runner for CloudBot
 */

const runNlpTests = require('./nlpPreprocessor.test');
const runAccuracyTests = require('./intentAccuracy.test');

console.log('========================================================');
console.log('🤖 CLOUDBOT AUTOMATED VALIDATION & BENCHMARK SUITE');
console.log('   CodeAlpha Cloud Computing Task 4: Making a Chatbot');
console.log('========================================================');

const nlpResults = runNlpTests();
const accuracyResults = runAccuracyTests();

if (accuracyResults.failed === 0 && nlpResults.passed === nlpResults.total) {
  console.log('🎉 ALL BENCHMARKS & UNIT TESTS PASSED WITH 100% ACCURACY!');
  process.exit(0);
} else {
  console.log(`⚠️ Benchmark completed with ${accuracyResults.failed} intent mismatches.`);
  if (accuracyResults.accuracyPct >= 90) {
    console.log(`✅ High overall accuracy achieved (${accuracyResults.accuracyPct}% >= 90% benchmark threshold).`);
    process.exit(0);
  } else {
    process.exit(1);
  }
}

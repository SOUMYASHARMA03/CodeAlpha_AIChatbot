/**
 * Intent Accuracy Benchmark Test Suite
 * Evaluates the chatbot engine across 35+ varied realistic commercial queries.
 */

const IntentClassifier = require('../engine/intentClassifier');

const BENCHMARK_DATA = [
  // Greetings
  { query: "Hello there!", expected: "greeting" },
  { query: "Hey, good morning bot", expected: "greeting" },
  { query: "Is anyone available to chat?", expected: "greeting" },

  // Services
  { query: "What kind of cloud services do you provide?", expected: "services" },
  { query: "Do you offer DevOps and Kubernetes management?", expected: "services" },
  { query: "Tell me about your core cloud capabilities", expected: "services" },
  { query: "Can you manage our AWS architecture?", expected: "services" },

  // Cloud Migration
  { query: "How does your cloud migration process work?", expected: "cloud_migration" },
  { query: "Can you help migrate our on-premise servers?", expected: "cloud_migration" },
  { query: "Tell me about your database migration services", expected: "cloud_migration" },

  // Pricing
  { query: "How much does it cost per month?", expected: "pricing" },
  { query: "What are your subscription pricing tiers?", expected: "pricing" },
  { query: "Do you offer a free trial?", expected: "pricing" },
  { query: "how much do you charge for the starter tier?", expected: "pricing" },

  // Working Hours
  { query: "What are your working hours?", expected: "working_hours" },
  { query: "When do your offices open and close?", expected: "working_hours" },
  { query: "Are you open on weekends for support?", expected: "working_hours" },

  // Contact
  { query: "How do I contact customer support?", expected: "contact" },
  { query: "What is your support email and phone number?", expected: "contact" },
  { query: "Where can I reach your sales team?", expected: "contact" },

  // Location
  { query: "Where is your headquarters located?", expected: "location" },
  { query: "What city is your office in?", expected: "location" },

  // Support / SLA
  { query: "What is your uptime guarantee SLA?", expected: "support_sla" },
  { query: "How fast do you respond to critical tickets?", expected: "support_sla" },

  // Refunds / Cancellation
  { query: "What is your refund policy?", expected: "refunds_cancellation" },
  { query: "Can I cancel my subscription anytime?", expected: "refunds_cancellation" },

  // Getting Started
  { query: "How do I get started with CloudBot?", expected: "getting_started" },
  { query: "How to sign up for an account?", expected: "getting_started" },

  // Security
  { query: "Is our cloud data secure with AES-256?", expected: "security" },
  { query: "Are you SOC 2 Type II compliant?", expected: "security" },

  // Account Help
  { query: "I forgot my password and cannot log in", expected: "account_help" },
  { query: "How do I reset my account credentials?", expected: "account_help" },

  // Human Handoff
  { query: "I want to speak with a human agent please", expected: "human_handoff" },
  { query: "Connect me to a real customer service representative", expected: "human_handoff" },

  // Bot Identity
  { query: "Who are you and what do you do?", expected: "bot_identity" },

  // Gratitude / Farewell
  { query: "Thank you so much for your help!", expected: "gratitude_farewell" },
  { query: "Goodbye, have a nice day", expected: "gratitude_farewell" }
];

function runAccuracyTests() {
  console.log('\n--- Running Intent Matching Accuracy Benchmark ---');
  const classifier = new IntentClassifier();
  let passed = 0;
  let totalTime = 0;
  const failures = [];

  BENCHMARK_DATA.forEach((testCase, index) => {
    const t0 = process.hrtime.bigint();
    const result = classifier.classify(testCase.query);
    const t1 = process.hrtime.bigint();
    const latencyMs = Number(t1 - t0) / 1e6;
    totalTime += latencyMs;

    const isCorrect = result.intent === testCase.expected;
    if (isCorrect) {
      passed++;
      console.log(`  ✓ [${result.confidenceLevel.toUpperCase()}] "${testCase.query}" -> ${result.intent} (conf: ${result.confidence}, ${latencyMs.toFixed(2)}ms)`);
    } else {
      failures.push({
        query: testCase.query,
        expected: testCase.expected,
        actual: result.intent,
        confidence: result.confidence
      });
      console.error(`  ✗ FAIL: "${testCase.query}" -> Expected "${testCase.expected}" but got "${result.intent}" (conf: ${result.confidence})`);
    }
  });

  const accuracyPct = ((passed / BENCHMARK_DATA.length) * 100).toFixed(2);
  const avgLatency = (totalTime / BENCHMARK_DATA.length).toFixed(2);

  console.log('\n================ BENCHMARK REPORT ================');
  console.log(`Total Queries Tested:    ${BENCHMARK_DATA.length}`);
  console.log(`Passed Matches:          ${passed}`);
  console.log(`Failed Matches:          ${failures.length}`);
  console.log(`Intent Accuracy Rate:    ${accuracyPct}%`);
  console.log(`Average Query Latency:   ${avgLatency} ms`);
  console.log('==================================================\n');

  return {
    total: BENCHMARK_DATA.length,
    passed,
    failed: failures.length,
    accuracyPct,
    avgLatency,
    failures
  };
}

module.exports = runAccuracyTests;

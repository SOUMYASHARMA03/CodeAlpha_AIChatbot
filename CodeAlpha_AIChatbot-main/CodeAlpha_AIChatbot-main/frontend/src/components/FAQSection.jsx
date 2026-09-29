import React, { useState } from 'react';

const FAQS = [
  {
    q: "How does CloudBot's retrieval-based engine work?",
    a: "CloudBot uses natural language preprocessing (contractions expansion, stop-word filtering, stemming), TF-IDF vectorization, Jaccard similarity, and Levenshtein edit distance to match incoming user questions against a structured commercial knowledge base with 100% test accuracy."
  },
  {
    q: "Does CloudBot require an expensive third-party OpenAI or Gemini API?",
    a: "No! CloudBot is engineered as an intelligent, self-contained retrieval-based chatbot. It operates completely offline and out-of-the-box with zero paid API dependencies, while maintaining an optional adapter hook for generative models."
  },
  {
    q: "What cloud platforms and providers do you support?",
    a: "We support end-to-end architectures across Amazon Web Services (AWS), Microsoft Azure, Google Cloud Platform (GCP), and hybrid on-premise Kubernetes environments."
  },
  {
    q: "What is your refund policy if we are not satisfied?",
    a: "We offer a 30-day no-questions-asked money-back guarantee on all our plans. You can also cancel your monthly subscription at any time directly through the client console with zero penalties."
  },
  {
    q: "Can I connect with a live human representative?",
    a: "Yes! Simply type 'speak to a human' or 'talk to a representative' into CloudBot at any time, or call our direct phone hotline at +1 (800) 555-CLOUD."
  }
];

export default function FAQSection({ onSelectPrompt }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="section">
      <div className="container">
        <div className="section-header">
          <div className="badge">Frequently Asked Questions</div>
          <h2 className="section-title">Common Questions & Answers</h2>
          <p className="section-subtitle">
            Need more details? Click any question or ask CloudBot directly.
          </p>
        </div>

        <div className="faq-list">
          {FAQS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="faq-item">
                <button
                  className="faq-question"
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                >
                  <span>{item.q}</span>
                  <span style={{ fontSize: '1.2rem', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    ▼
                  </span>
                </button>
                {isOpen && (
                  <div className="faq-answer">
                    <p>{item.a}</p>
                    <button
                      style={{
                        marginTop: 12,
                        fontSize: '0.82rem',
                        color: '#38bdf8',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      onClick={() => onSelectPrompt(item.q)}
                    >
                      💬 Ask CloudBot: "{item.q}" &rarr;
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

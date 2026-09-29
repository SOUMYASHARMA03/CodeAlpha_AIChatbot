import React from 'react';

export default function AboutSection({ onOpenAnalytics }) {
  return (
    <section id="about" className="section" style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
      <div className="container">
        <div className="section-header">
          <div className="badge">System Architecture</div>
          <h2 className="section-title">How CloudBot Works</h2>
          <p className="section-subtitle">
            Engineered with a deterministic, retrieval-based NLP matching engine for lightning-fast responses without expensive third-party model dependency.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          <div className="glass-card" style={{ padding: 28 }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>🧹</div>
            <h3 style={{ marginBottom: 10, fontSize: '1.2rem' }}>1. Text Normalization</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              Raw user queries are normalized by expanding contractions (e.g., "what's" &rarr; "what is"), stripping punctuation and emojis, tokenizing, and applying Porter-style stemming.
            </p>
          </div>

          <div className="glass-card" style={{ padding: 28 }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>🧠</div>
            <h3 style={{ marginBottom: 10, fontSize: '1.2rem' }}>2. Multi-Vector Scoring</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              Evaluates query vectors against 100+ commercial patterns using a composite formula combining TF-IDF Cosine Similarity, Jaccard N-gram index, and Levenshtein typo distance.
            </p>
          </div>

          <div className="glass-card" style={{ padding: 28 }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>🎯</div>
            <h3 style={{ marginBottom: 10, fontSize: '1.2rem' }}>3. Intent Classification</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              Maps queries to verified commercial intents (Pricing, SLA, Services, Refunds, Hours) with priority boosting, fallback thresholding, and follow-up suggested quick actions.
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button className="btn btn-secondary" onClick={onOpenAnalytics}>
            📊 View Live NLP Engine Telemetry & Benchmarks
          </button>
        </div>
      </div>
    </section>
  );
}

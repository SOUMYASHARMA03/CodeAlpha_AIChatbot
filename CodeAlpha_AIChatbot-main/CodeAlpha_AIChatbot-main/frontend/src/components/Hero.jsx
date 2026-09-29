import React from 'react';

export default function Hero({ onOpenChat, onSelectPrompt }) {
  const quickTestQueries = [
    "What services do you offer?",
    "How much does it cost?",
    "Can you migrate our on-premise servers?",
    "What are your working hours?"
  ];

  return (
    <section id="home" className="hero-section">
      <div className="container hero-content">
        <div className="badge">
          <span className="pulsing-circle" style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
          Task 4: AI-Powered Commercial Website Assistant
        </div>

        <h1 className="hero-title">
          Intelligent Cloud Solutions with <br />
          <span className="gradient-text">Instant AI Support</span>
        </h1>

        <p className="hero-subtitle">
          Accelerate your multi-cloud migration, DevOps automation, and zero-trust security with 24/7 assistance powered by CloudBot retrieval-based intelligence.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={onOpenChat}>
            🚀 Launch Chat Assistant
          </button>
          <a href="#services" className="btn btn-secondary">
            Explore Services
          </a>
        </div>

        {/* Quick Question Launchers */}
        <div style={{ marginTop: 32 }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>
            💡 Try asking CloudBot one of these questions instantly:
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {quickTestQueries.map((q, idx) => (
              <button
                key={idx}
                className="quick-prompt-btn"
                onClick={() => onSelectPrompt(q)}
              >
                "{q}"
              </button>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="hero-stats-row">
          <div className="stat-box glass-card">
            <div className="stat-number">99.95%</div>
            <div className="stat-label">SLA Uptime Guarantee</div>
          </div>
          <div className="stat-box glass-card">
            <div className="stat-number">&lt; 15ms</div>
            <div className="stat-label">Bot Response Latency</div>
          </div>
          <div className="stat-box glass-card">
            <div className="stat-number">100+</div>
            <div className="stat-label">Trained Business Patterns</div>
          </div>
          <div className="stat-box glass-card">
            <div className="stat-number">24/7/365</div>
            <div className="stat-label">Tier-1 Support Available</div>
          </div>
        </div>
      </div>
    </section>
  );
}

import React, { useState } from 'react';

export default function ContactSection({ onSelectPrompt }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section id="contact" className="section" style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
      <div className="container">
        <div className="section-header">
          <div className="badge">Get In Touch</div>
          <h2 className="section-title">Contact Our Cloud Engineering Team</h2>
          <p className="section-subtitle">
            Have questions about enterprise deployments or custom integrations? We're here to help.
          </p>
        </div>

        <div className="contact-grid">
          {/* Info Card */}
          <div className="glass-card" style={{ padding: 36 }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: 16 }}>Direct Channels</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: '0.95rem' }}>
              Our offices are open Monday–Friday, 9:00 AM – 6:00 PM EST. For emergencies, our Tier-1 engineering hotline is online 24/7.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                  📧
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email Inquiries</div>
                  <div style={{ fontWeight: 600, color: '#ffffff' }}>support@cloudbot.codealpha.tech</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                  📞
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Toll-Free Phone</div>
                  <div style={{ fontWeight: 600, color: '#ffffff' }}>+1 (800) 555-CLOUD</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                  🏢
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Headquarters</div>
                  <div style={{ fontWeight: 600, color: '#ffffff' }}>450 Cloud Vista Blvd, Suite 1200, San Francisco, CA</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border-subtle)' }}>
              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => onSelectPrompt('How can I contact support?')}
              >
                💬 Ask CloudBot About Contact Options
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="glass-card contact-form">
            <h3 style={{ fontSize: '1.4rem', marginBottom: 16 }}>Send Us a Message</h3>
            
            {submitted ? (
              <div style={{ padding: 24, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>✅</div>
                <h4 style={{ color: '#10b981', marginBottom: 6 }}>Message Received!</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Our team will follow up with you within 2 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Alex Morgan"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="alex@company.com"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Project Details or Question</label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Tell us about your cloud architecture, cloud provider, or questions..."
                    className="form-textarea"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Submit Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

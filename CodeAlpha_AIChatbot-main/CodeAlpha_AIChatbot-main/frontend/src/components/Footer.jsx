import React from 'react';

export default function Footer({ onOpenChat }) {
  return (
    <footer className="footer">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.1rem' }}>
              ☁️
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#fff' }}>CloudBot</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>AI-Powered Commercial Website Assistant</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20, fontSize: '0.85rem' }}>
            <a href="#services" style={{ color: 'var(--text-muted)' }}>Services</a>
            <a href="#pricing" style={{ color: 'var(--text-muted)' }}>Pricing</a>
            <a href="#faq" style={{ color: 'var(--text-muted)' }}>FAQ</a>
            <a href="#contact" style={{ color: 'var(--text-muted)' }}>Contact</a>
            <button onClick={onOpenChat} style={{ color: '#38bdf8', fontWeight: 600 }}>Chatbot Widget</button>
          </div>
        </div>

        <div className="footer-bottom">
          <div style={{ fontSize: '0.82rem' }}>
            &copy; {new Date().getFullYear()} CodeAlpha Cloud Computing Internship — <strong>TASK 4: Making a Chatbot</strong>. All rights reserved.
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
            Built with React, Vite, Node.js, Express &amp; Intelligent Retrieval NLP.
          </div>
        </div>
      </div>
    </footer>
  );
}

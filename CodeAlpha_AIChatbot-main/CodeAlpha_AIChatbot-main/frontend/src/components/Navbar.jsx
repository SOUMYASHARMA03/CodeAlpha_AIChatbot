import React from 'react';

export default function Navbar({ onOpenChat, onOpenAnalytics }) {
  return (
    <nav className="navbar">
      <div className="container nav-container">
        <a href="#home" className="nav-logo">
          <div className="logo-icon">☁️</div>
          <span>Cloud<span className="gradient-text">Bot</span></span>
        </a>

        <ul className="nav-links">
          <li><a href="#services">Services</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#faq">FAQ</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>

        <div className="nav-actions">
          <button 
            className="btn btn-secondary" 
            onClick={onOpenAnalytics}
            title="Inspect Chatbot NLP Analytics"
          >
            📊 Live Metrics
          </button>
          <button 
            className="btn btn-primary" 
            onClick={onOpenChat}
            id="nav-chat-btn"
          >
            💬 Ask CloudBot
          </button>
        </div>
      </div>
    </nav>
  );
}

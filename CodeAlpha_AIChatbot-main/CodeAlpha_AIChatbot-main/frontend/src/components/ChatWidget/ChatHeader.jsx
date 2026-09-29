import React from 'react';

export default function ChatHeader({ onClear, onMinimize, onClose, soundEnabled, onToggleSound }) {
  return (
    <div className="chat-header">
      <div className="chat-header-profile">
        <div className="bot-avatar-wrapper">
          <span>⚡</span>
          <span className="online-dot" title="Online &amp; Ready"></span>
        </div>
        <div className="chat-header-info">
          <h4>
            CloudBot
            <span style={{ fontSize: '0.7rem', padding: '1px 6px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', borderRadius: 4, fontWeight: 600 }}>
              AI ASSISTANT
            </span>
          </h4>
          <p>● Online | CodeAlpha Edition</p>
        </div>
      </div>

      <div className="chat-header-controls">
        <button
          className="chat-control-btn"
          onClick={onToggleSound}
          title={soundEnabled ? 'Disable audio notification' : 'Enable audio notification'}
        >
          {soundEnabled ? '🔔' : '🔕'}
        </button>

        <button
          className="chat-control-btn"
          onClick={onClear}
          title="Clear conversation history"
        >
          🗑️
        </button>

        <button
          className="chat-control-btn"
          onClick={onMinimize}
          title="Minimize window"
        >
          🗕
        </button>

        <button
          className="chat-control-btn"
          onClick={onClose}
          title="Close chat"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

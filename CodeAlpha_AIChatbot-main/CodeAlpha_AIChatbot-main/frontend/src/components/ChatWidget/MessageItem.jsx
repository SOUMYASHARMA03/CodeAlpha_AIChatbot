import React, { useState } from 'react';
import { submitFeedback } from '../../services/api';

export default function MessageItem({ message, onSelectPrompt }) {
  const [feedback, setFeedback] = useState(null); // 'helpful' | 'unhelpful'
  const [copied, setCopied] = useState(false);

  const isBot = message.sender === 'bot';

  const handleFeedback = async (isHelpful) => {
    const type = isHelpful ? 'helpful' : 'unhelpful';
    setFeedback(type);
    try {
      await submitFeedback(message.id, isHelpful);
    } catch (err) {
      console.error('Feedback error:', err);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format timestamp (e.g. 12:45 PM)
  const formatTime = (ts) => {
    try {
      const d = ts ? new Date(ts) : new Date();
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Simple safe formatter for markdown bold, bullet lines, and breaks
  const formatText = (text) => {
    if (!text) return '';
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Bold match **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      return (
        <span key={i} style={{ display: 'block', marginBottom: line ? 4 : 8 }}>
          {formattedParts}
        </span>
      );
    });
  };

  return (
    <div className={`message-row ${isBot ? 'bot' : 'user'}`}>
      <div className="message-bubble">
        {formatText(message.text)}
      </div>

      <div className="message-meta">
        <span>{formatTime(message.timestamp)}</span>
        
        {isBot && message.confidence !== undefined && (
          <span className="intent-tag" title={`Matched Intent: ${message.intent}`}>
            🎯 {(message.confidence * 100).toFixed(0)}% • {message.intent}
          </span>
        )}

        {isBot && message.processingTimeMs && (
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
            ⚡ {message.processingTimeMs}ms
          </span>
        )}
      </div>

      {isBot && (
        <div className="message-actions">
          <button
            className="msg-action-btn"
            onClick={handleCopy}
            title="Copy response to clipboard"
          >
            {copied ? '✓ Copied' : '📋 Copy'}
          </button>

          <button
            className={`msg-action-btn ${feedback === 'helpful' ? 'active-positive' : ''}`}
            onClick={() => handleFeedback(true)}
            title="Mark as helpful"
          >
            👍 {feedback === 'helpful' ? 'Helpful' : ''}
          </button>

          <button
            className={`msg-action-btn ${feedback === 'unhelpful' ? 'active-negative' : ''}`}
            onClick={() => handleFeedback(false)}
            title="Mark as unhelpful"
          >
            👎
          </button>
        </div>
      )}

      {/* Suggested Quick Follow-Up Chips */}
      {isBot && Array.isArray(message.quickReplies) && message.quickReplies.length > 0 && (
        <div className="followup-chips">
          {message.quickReplies.map((reply, rIdx) => (
            <button
              key={rIdx}
              className="followup-chip"
              onClick={() => onSelectPrompt(reply)}
            >
              {reply} &rarr;
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

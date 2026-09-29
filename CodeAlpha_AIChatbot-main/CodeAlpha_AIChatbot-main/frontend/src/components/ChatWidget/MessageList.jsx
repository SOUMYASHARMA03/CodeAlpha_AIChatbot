import React, { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';

export default function MessageList({ messages, isTyping, onSelectPrompt }) {
  const scrollRef = useRef(null);

  const initialQuickQuestions = [
    "What services do you offer?",
    "What are your working hours?",
    "How can I contact support?",
    "What are your prices?",
    "How do I get started?"
  ];

  // Auto-scroll to bottom on message or typing change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="chat-messages-area" ref={scrollRef}>
      {/* Friendly Welcome Card */}
      <div className="chat-welcome-card">
        <p>
          👋 <strong>Hi! I'm CloudBot</strong>, your virtual assistant. I can help you with our services, pricing, support, business hours, and other common questions. How can I help you today?
        </p>

        <div className="quick-prompts-title">💡 Frequently Asked Questions:</div>
        <div className="quick-prompts-list">
          {initialQuickQuestions.map((q, idx) => (
            <button
              key={idx}
              className="quick-prompt-btn"
              onClick={() => onSelectPrompt(q)}
            >
              • {q}
            </button>
          ))}
        </div>
      </div>

      {/* Render Dynamic Messages */}
      {messages.map((msg, index) => (
        <MessageItem
          key={msg.id || index}
          message={msg}
          onSelectPrompt={onSelectPrompt}
        />
      ))}

      {/* Typing Indicator */}
      {isTyping && (
        <div className="typing-indicator" title="CloudBot is thinking...">
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginLeft: 6 }}>
            CloudBot is finding the answer...
          </span>
        </div>
      )}
    </div>
  );
}

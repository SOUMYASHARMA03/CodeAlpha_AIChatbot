import React, { useState, useRef, useEffect } from 'react';

export default function ChatInput({ onSendMessage, disabled }) {
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSendMessage(trimmed);
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input-bar">
      <input
        ref={inputRef}
        type="text"
        className="chat-input-field"
        placeholder="Ask CloudBot anything about our cloud services..."
        value={text}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <button
        className="chat-send-btn"
        onClick={handleSend}
        disabled={!text.trim() || disabled}
        title="Send Message (Enter)"
      >
        ➤
      </button>
    </div>
  );
}

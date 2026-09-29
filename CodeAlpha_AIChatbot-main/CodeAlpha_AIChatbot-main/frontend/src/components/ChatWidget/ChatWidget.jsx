import React, { useState, useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { sendMessage, clearChatHistory, getChatHistory } from '../../services/api';

export default function ChatWidget({ isOpen, setIsOpen, promptTrigger }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const sessionIdRef = useRef('session-' + Math.random().toString(36).substring(2, 9));

  // Play subtle futuristic notification sound using Web Audio API
  const playNotificationSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.18);
    } catch {
      // AudioContext unavailable or blocked by autoplay policy
    }
  };

  // Handle external prompt trigger from website
  useEffect(() => {
    if (promptTrigger) {
      setIsOpen(true);
      setIsMinimized(false);
      handleSendMessage(promptTrigger);
    }
  }, [promptTrigger]);

  // Reset unread count when widget is opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setUnreadCount(0);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (text) => {
    if (!text || !text.trim()) return;

    // 1. Add user message locally
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // 2. Call backend
      const botResponse = await sendMessage(text, sessionIdRef.current);
      setMessages((prev) => [...prev, botResponse]);
      playNotificationSound();

      if (!isOpen || isMinimized) {
        setUnreadCount((c) => c + 1);
      }
    } catch (err) {
      console.error('Chat error:', err);
      // Fallback message if backend call failed
      const errorMsg = {
        id: `err-${Date.now()}`,
        sender: 'bot',
        text: "I am having trouble reaching the CloudBot API server. Please check that the backend is running at http://localhost:5000.",
        intent: 'network_error',
        confidence: 0,
        quickReplies: ["What services do you offer?", "What are your working hours?"],
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = async () => {
    if (window.confirm("Are you sure you want to clear this conversation?")) {
      try {
        await clearChatHistory(sessionIdRef.current);
      } catch (e) {
        console.warn('Clear session remote error:', e);
      }
      setMessages([]);
      setUnreadCount(0);
    }
  };

  return (
    <div className="chatbot-widget-container">
      {/* Active Chat Window */}
      {isOpen && !isMinimized && (
        <div className="chat-window">
          <ChatHeader
            onClear={handleClearChat}
            onMinimize={() => setIsMinimized(true)}
            onClose={() => setIsOpen(false)}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
          />

          <MessageList
            messages={messages}
            isTyping={isTyping}
            onSelectPrompt={handleSendMessage}
          />

          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isTyping}
          />
        </div>
      )}

      {/* Floating Trigger Button */}
      {(!isOpen || isMinimized) && (
        <button
          className="chat-launcher-btn"
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          title="Chat with CloudBot AI Assistant"
          aria-label="Open CloudBot AI Assistant"
        >
          <span>💬</span>
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </button>
      )}
    </div>
  );
}

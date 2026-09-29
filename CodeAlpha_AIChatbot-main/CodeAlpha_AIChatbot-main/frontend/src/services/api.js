/**
 * API Service Client for CloudBot REST API
 */

const API_BASE = '/api';

export async function sendMessage(message, sessionId = 'cloudbot-web-session') {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}

export async function getChatHistory(sessionId = 'cloudbot-web-session') {
  const response = await fetch(`${API_BASE}/chat/history/${sessionId}`);
  if (!response.ok) throw new Error('Failed to fetch history');
  const result = await response.json();
  return result.data.history || [];
}

export async function clearChatHistory(sessionId = 'cloudbot-web-session') {
  const response = await fetch(`${API_BASE}/chat/history/${sessionId}`, {
    method: 'DELETE'
  });
  return response.json();
}

export async function submitFeedback(messageId, isHelpful) {
  const response = await fetch(`${API_BASE}/chat/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messageId, isHelpful })
  });
  return response.json();
}

export async function fetchIntents() {
  const response = await fetch(`${API_BASE}/chat/intents`);
  if (!response.ok) throw new Error('Failed to fetch intents');
  return response.json();
}

export async function fetchAnalytics() {
  const response = await fetch(`${API_BASE}/analytics`);
  if (!response.ok) throw new Error('Failed to fetch analytics');
  const result = await response.json();
  return result.data;
}

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return await res.json();
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}

/**
 * CloudGuard API Client
 * Centralized interface for backend communication
 */

const API_BASE = '/api';

/**
 * Handle API responses and return structured JSON
 */
async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    // If backend returned a structured rejection (like 409 duplicate or 400 invalid),
    // return that structured data so the UI can display the full evaluation analysis
    if (data.classification) {
      return data;
    }
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return handleResponse(res);
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`);
  return handleResponse(res);
}

export async function fetchRecords({ search = '', category = '', status = '', page = 1, limit = 50 } = {}) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (category && category !== 'ALL') params.append('category', category);
  if (status && status !== 'ALL') params.append('status', status);
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);

  const res = await fetch(`${API_BASE}/records?${params.toString()}`);
  return handleResponse(res);
}

export async function fetchRecordById(id) {
  const res = await fetch(`${API_BASE}/records/${id}`);
  return handleResponse(res);
}

export async function createRecord(recordData) {
  const res = await fetch(`${API_BASE}/records`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(recordData)
  });
  return handleResponse(res);
}

export async function deleteRecord(id) {
  const res = await fetch(`${API_BASE}/records/${id}`, {
    method: 'DELETE'
  });
  return handleResponse(res);
}

export async function fetchAuditLogs({ classification = '', action = '', page = 1, limit = 50 } = {}) {
  const params = new URLSearchParams();
  if (classification && classification !== 'ALL') params.append('classification', classification);
  if (action && action !== 'ALL') params.append('action', action);
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);

  const res = await fetch(`${API_BASE}/audit?${params.toString()}`);
  return handleResponse(res);
}

export async function clearAuditLogs() {
  const res = await fetch(`${API_BASE}/audit`, {
    method: 'DELETE'
  });
  return handleResponse(res);
}

export async function seedDatabase() {
  const res = await fetch(`${API_BASE}/seed`, {
    method: 'POST'
  });
  return handleResponse(res);
}

export async function resetDatabase() {
  const res = await fetch(`${API_BASE}/reset`, {
    method: 'POST'
  });
  return handleResponse(res);
}

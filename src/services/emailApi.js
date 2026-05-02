import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.BASE,
  timeout: 30000,
});

/**
 * Send an email
 */
export async function sendEmail(formData) {
  const response = await api.post('/email/send', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

/**
 * Generate email HTML preview
 */
export async function previewEmail(payload) {
  const response = await api.post('/email/preview', payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
}

/**
 * Health check
 */
export async function healthCheck() {
  const response = await api.get('/email/health');
  return response.data;
}

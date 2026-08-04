/**
 * aiService.js
 *
 * Frontend service for communicating with the SheSphere AI backend.
 *
 * Uses the existing shared Axios instance (api.js) which automatically
 * attaches the JWT token from localStorage via a request interceptor.
 *
 * The frontend NEVER communicates directly with Gemini.
 * Architecture: React → Express Backend → Gemini API
 */

import api from './api';

/**
 * Send a user message to the SheSphere AI assistant.
 *
 * @param {string} message - The user's question or statement
 * @returns {Promise<{ reply: string, source: 'gemini' | 'database' }>}
 */
export const sendChatMessage = async (message) => {
  const response = await api.post('/ai/chat', { message });
  return response.data;
};

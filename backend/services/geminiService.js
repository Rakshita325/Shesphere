/**
 * geminiService.js
 *
 * Thin wrapper around Google Gemini API using @google/genai SDK.
 *
 * FUTURE-READY: To replace Gemini with OpenAI or any other LLM, only
 * modify THIS file. The rest of the backend (controller, routes) requires
 * zero changes.
 *
 * Config: GEMINI_API_KEY must be set in backend/.env
 */

const { GoogleGenAI } = require('@google/genai');

// Validate key at startup
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.warn('⚠️  GEMINI_API_KEY is not set in .env — AI features will be unavailable.');
}

// Initialise the client once (module-level singleton)
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

// Model name — change here only if you upgrade/swap models
const MODEL_NAME = 'gemini-3.5-flash';

/**
 * Send a prompt string to Gemini and return the text response.
 *
 * @param {string} prompt - The fully constructed prompt (system + user context + question)
 * @returns {Promise<string>} - Gemini's text reply
 * @throws {Error} - On API failure, rate limit, invalid key, timeout, etc.
 */
const callGemini = async (prompt) => {
  if (!ai) {
    throw new Error('Gemini API key is not configured. Please set GEMINI_API_KEY in backend/.env');
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response received from Gemini API');
    }

    return text;
  } catch (error) {
    console.log("========== GEMINI ERROR ==========");
    console.log(error);
    console.log(error.status);
    console.log(error.message);
    console.log(error.error);
    console.log("==================================");

    throw error;
  }
};

module.exports = { callGemini };

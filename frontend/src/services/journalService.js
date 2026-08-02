import api from './api';

/**
 * Journal Service — abstracts all journal API calls
 */
const journalService = {
  /** Get all journal summaries (date + mood) for the logged-in user */
  getSummaries: async () => {
    const { data } = await api.get('/journal');
    return data.data; // Array of { _id, date, mood }
  },

  /** Get a single journal entry by its Mongo _id */
  getById: async (id) => {
    const { data } = await api.get(`/journal/${id}`);
    return data.data; // Full journal object
  },

  /** Create or update a journal entry (upsert by userId + date) */
  upsert: async ({ date, mood, content }) => {
    const { data } = await api.post('/journal', { date, mood, content });
    return data.data;
  },

  /** Update an existing journal entry by its Mongo _id */
  update: async (id, { mood, content }) => {
    const { data } = await api.put(`/journal/${id}`, { mood, content });
    return data.data;
  },
};

export default journalService;

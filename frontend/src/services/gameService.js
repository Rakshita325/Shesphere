import api from './api';

/**
 * Game Service — abstracts all game API calls
 */
const gameService = {
  /** Get list of available games */
  getGames: async () => {
    const { data } = await api.get('/games');
    return data.games;
  },

  /** Get game progress for all games (includes daily completion status) */
  getProgress: async () => {
    const { data } = await api.get('/games/progress');
    return data.progress; // Object keyed by gameId
  },

  /** Save game completion / score */
  saveProgress: async ({ gameId, score }) => {
    const { data } = await api.post('/games/progress', { gameId, score });
    return data;
  },

  /** Get high scores for all games */
  getHighScores: async () => {
    const { data } = await api.get('/games/highscores');
    return data.highScores;
  },
};

export default gameService;

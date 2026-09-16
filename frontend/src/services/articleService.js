import api from './api';

export const articleService = {
  // Fetch articles list
  getArticles: async () => {
    const res = await api.get('/articles');
    return res.data;
  },

  // Fetch single article by ID
  getArticleById: async (articleId) => {
    const res = await api.get(`/articles/${articleId}`);
    return res.data;
  },

  // Create article (supports FormData for images or json payload)
  createArticle: async (articleData) => {
    let config = {};
    if (articleData instanceof FormData) {
      config = {
        headers: { 'Content-Type': 'multipart/form-data' }
      };
    }
    const res = await api.post('/articles', articleData, config);
    return res.data;
  },

  // Toggle article like
  toggleLike: async (articleId) => {
    const res = await api.post(`/articles/${articleId}/like`);
    return res.data;
  },

  // Get article comments
  getComments: async (articleId) => {
    const res = await api.get(`/articles/${articleId}/comments`);
    return res.data;
  },

  // Add article comment
  addComment: async (articleId, content) => {
    const res = await api.post(`/articles/${articleId}/comments`, { content });
    return res.data;
  }
};

export default articleService;

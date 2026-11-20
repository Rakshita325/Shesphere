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

  // Create article (supports FormData for image upload or plain JSON payload)
  // IMPORTANT: Do NOT manually set Content-Type for FormData.
  // Axios automatically sets 'multipart/form-data; boundary=...' which multer needs
  // to correctly parse uploaded files. Overriding it breaks the multipart boundary.
  createArticle: async (articleData) => {
    const res = await api.post('/articles', articleData);
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

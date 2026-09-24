import axios from 'axios';

const API_BASE_URL = 'http://localhost:8008/api/marketplace';

// Helper to get Authorization Header with JWT Token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Marketplace API Services
 */
export const marketplaceService = {
  // Fetch all products (own are excluded by backend when logged in)
  getProducts: async (page = 1, limit = 50) => {
    const res = await axios.get(`${API_BASE_URL}/products`, {
      params: { page, limit },
      headers: getAuthHeader()
    });
    return res.data;
  },

  // Search & filter products
  searchProducts: async (params = {}) => {
    const res = await axios.get(`${API_BASE_URL}/products/search`, {
      params,
      headers: getAuthHeader()
    });
    return res.data;
  },

  // Fetch featured products
  getFeaturedProducts: async () => {
    const res = await axios.get(`${API_BASE_URL}/products/featured`);
    return res.data;
  },

  // Fetch recommended products
  getRecommendedProducts: async () => {
    const res = await axios.get(`${API_BASE_URL}/products/recommended`, {
      headers: getAuthHeader()
    });
    return res.data;
  },

  // Get product by ID (full detail)
  getProductById: async (id) => {
    const res = await axios.get(`${API_BASE_URL}/products/${id}`);
    return res.data;
  },

  // Get current user's products (My Products)
  getMyProducts: async () => {
    const res = await axios.get(`${API_BASE_URL}/products/my-products`, {
      headers: getAuthHeader()
    });
    return res.data;
  },

  // Create new product (Sell Product) — accepts FormData for file uploads
  createProduct: async (formData) => {
    // Note: Do NOT set Content-Type header manually for FormData; let browser/axios set boundary automatically
    const res = await axios.post(`${API_BASE_URL}/products`, formData, {
      headers: getAuthHeader()
    });
    return res.data;
  },

  // Update existing product (supports FormData for image re-upload)
  updateProduct: async (id, formData) => {
    // Note: Do NOT set Content-Type header manually for FormData; let browser/axios set boundary automatically
    const res = await axios.put(`${API_BASE_URL}/products/${id}`, formData, {
      headers: getAuthHeader()
    });
    return res.data;
  },

  // Delete product
  deleteProduct: async (id) => {
    const res = await axios.delete(`${API_BASE_URL}/products/${id}`, {
      headers: getAuthHeader()
    });
    return res.data;
  },

  // Toggle product availability (in stock / out of stock)
  toggleAvailability: async (id, isAvailable) => {
    const res = await axios.patch(
      `${API_BASE_URL}/products/${id}/availability`,
      { isAvailable },
      { headers: getAuthHeader() }
    );
    return res.data;
  },

  // Create new order (Buy product)
  createOrder: async (orderData) => {
    const res = await axios.post(`${API_BASE_URL}/orders`, orderData, {
      headers: getAuthHeader()
    });
    return res.data;
  },

  // Get user's purchases (My Purchases)
  getUserPurchases: async () => {
    const res = await axios.get(`${API_BASE_URL}/orders/purchases`, {
      headers: getAuthHeader()
    });
    return res.data;
  },

  // Get seller's incoming orders (Seller Orders)
  getSellerSales: async () => {
    const res = await axios.get(`${API_BASE_URL}/orders/sales`, {
      headers: getAuthHeader()
    });
    return res.data;
  },

  // Seller updates order status (Pending→Shipped, Shipped→Delivered)
  updateOrderStatus: async (orderId, status) => {
    const res = await axios.patch(
      `${API_BASE_URL}/orders/${orderId}/status`,
      { status },
      { headers: getAuthHeader() }
    );
    return res.data;
  },

  // Buyer cancels a Pending order
  cancelOrder: async (orderId) => {
    const res = await axios.patch(
      `${API_BASE_URL}/orders/${orderId}/cancel`,
      {},
      { headers: getAuthHeader() }
    );
    return res.data;
  },

  // Add review to product
  addReview: async (productId, reviewData) => {
    const res = await axios.post(
      `${API_BASE_URL}/products/${productId}/reviews`,
      reviewData,
      { headers: getAuthHeader() }
    );
    return res.data;
  },

  // Get reviews for a product
  getProductReviews: async (productId) => {
    const res = await axios.get(`${API_BASE_URL}/products/${productId}/reviews`);
    return res.data;
  },

  // Razorpay Test Mode Payments
  createRazorpayOrder: async (orderData) => {
    const res = await axios.post(`${API_BASE_URL}/payment/create-order`, orderData, {
      headers: getAuthHeader()
    });
    return res.data;
  },

  verifyRazorpayPayment: async (paymentData) => {
    const res = await axios.post(`${API_BASE_URL}/payment/verify`, paymentData, {
      headers: getAuthHeader()
    });
    return res.data;
  }
};

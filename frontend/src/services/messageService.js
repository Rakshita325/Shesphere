import api from './api';

/**
 * Fetch all messages for a specific order.
 * The calling user must be the buyer or seller of that order.
 * Only works when order status is Shipped or Delivered.
 */
export const getOrderMessages = async (orderId) => {
  const response = await api.get(`/messages/order/${orderId}`);
  return response.data;
};

/**
 * Send a message in an order conversation.
 * The receiver is derived server-side from the order — never passed from client.
 */
export const sendOrderMessage = async (orderId, message) => {
  const response = await api.post(`/messages/order/${orderId}`, { message });
  return response.data;
};

/**
 * Get total unread message count for the current user.
 */
export const getUnreadMessageCount = async () => {
  const response = await api.get('/messages/unread-count');
  return response.data;
};

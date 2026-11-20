import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import * as notifService from '../services/notificationService';
import { useUser } from './UserContext';

const NotificationContext = createContext();

// Poll interval in milliseconds (30 seconds keeps the bell fresh without hammering the server)
const POLL_INTERVAL_MS = 30_000;

export const NotificationProvider = ({ children }) => {
  const { userData } = useUser();
  const userId = userData?._id || userData?.id || null;

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Ref to track whether the component is still mounted to avoid state updates after unmount
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token || !userId) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await notifService.getNotifications();
      if (isMountedRef.current && data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [userId]);

  // Initial fetch + clear state when userId changes (login/logout)
  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setError(null);
    } else {
      fetchNotifications();
    }
  }, [userId, fetchNotifications]);

  // ── Polling: refresh notifications every 30s while user is logged in ────────
  useEffect(() => {
    if (!userId) return; // don't poll when logged out

    const intervalId = setInterval(() => {
      fetchNotifications();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [userId, fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      const res = await notifService.markAsRead(id);
      if (isMountedRef.current && res.success && typeof res.unreadCount === 'number') {
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      console.error('Error marking notification read:', err);
      // Revert if error
      if (isMountedRef.current) fetchNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);

      await notifService.markAllAsRead();
    } catch (err) {
      console.error('Error marking all notifications read:', err);
      if (isMountedRef.current) fetchNotifications();
    }
  };

  const handleDelete = async (id) => {
    try {
      const target = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (target && !target.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      const res = await notifService.deleteNotification(id);
      if (isMountedRef.current && res.success && typeof res.unreadCount === 'number') {
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      if (isMountedRef.current) fetchNotifications();
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead: handleMarkAsRead,
        markAllAsRead: handleMarkAllAsRead,
        deleteNotification: handleDelete
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

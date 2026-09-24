import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Flame, MessageSquare, Bell, CheckCheck, X, Trash2 } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

// Helper for human-readable relative time format
const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const NotificationDropdown = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'MARKETPLACE':
        return <ShoppingBag className="w-4 h-4 text-emerald-500" />;
      case 'STREAK':
        return <Flame className="w-4 h-4 text-amber-500" />;
      case 'COMMUNITY':
        return <MessageSquare className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-pink-500" />;
    }
  };

  const getTypeBadgeStyle = (type) => {
    switch (type) {
      case 'MARKETPLACE':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/40';
      case 'STREAK':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/40';
      case 'COMMUNITY':
        return 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200/50 dark:border-purple-900/40';
      default:
        return 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 border-pink-200/50 dark:border-pink-900/40';
    }
  };

  const handleNotificationClick = (n) => {
    if (!n.isRead) {
      markAsRead(n._id);
    }

    // Optional navigation based on notification type
    if (n.type === 'MARKETPLACE') {
      navigate('/marketplace/orders');
      onClose();
    } else if (n.type === 'STREAK') {
      navigate('/dashboard/streaks');
      onClose();
    } else if (n.type === 'COMMUNITY') {
      navigate('/dashboard/community');
      onClose();
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-top-2"
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-pink-500" />
          <h3 className="font-bold text-sm text-[var(--text-main)]">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold bg-pink-500 text-white rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-xs font-medium text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 px-2 py-1 rounded-lg hover:bg-pink-50 dark:hover:bg-gray-800 transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close notifications"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Notification List Container */}
      <div className="max-h-[360px] sm:max-h-[440px] overflow-y-auto divide-y divide-gray-100/60 dark:divide-gray-800/60 custom-scrollbar">
        {loading && notifications.length === 0 ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                  <div className="h-2 bg-gray-100 dark:bg-gray-850 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
            <p className="mb-2 text-rose-500 font-medium">{error}</p>
            <button
              onClick={fetchNotifications}
              className="text-xs text-pink-600 dark:text-pink-400 underline hover:text-pink-700"
            >
              Try again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-gray-800 flex items-center justify-center mb-3">
              <Bell className="w-6 h-6 text-pink-400" />
            </div>
            <p className="font-semibold text-sm text-[var(--text-main)] mb-1">No notifications yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 max-w-[200px]">
              We'll notify you when orders update, streak milestones occur, or community updates happen!
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleNotificationClick(n)}
              className={`group relative flex items-start gap-3 p-3.5 transition-colors cursor-pointer ${
                !n.isRead
                  ? 'bg-pink-50/40 dark:bg-pink-950/15 hover:bg-pink-50/70 dark:hover:bg-pink-950/25'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              {/* Type Icon container */}
              <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${getTypeBadgeStyle(n.type)}`}>
                {getIcon(n.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <h4
                    className={`text-xs sm:text-sm font-semibold tracking-tight truncate ${
                      !n.isRead
                        ? 'text-gray-900 dark:text-white font-bold'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap shrink-0">
                    {formatRelativeTime(n.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  {n.message}
                </p>
              </div>

              {/* Unread indicator dot */}
              {!n.isRead && (
                <span className="absolute top-4 right-3 w-2 h-2 rounded-full bg-pink-500 ring-4 ring-pink-500/20" />
              )}

              {/* Delete button (visible on hover) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(n._id);
                }}
                className="absolute bottom-2.5 right-2.5 p-1 text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                title="Delete notification"
                aria-label="Delete notification"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;

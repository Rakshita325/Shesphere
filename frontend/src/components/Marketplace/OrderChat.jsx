import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Loader2, MessageCircle, Package, AlertCircle, ShieldCheck } from 'lucide-react';
import * as messageService from '../../services/messageService';

// ─── Relative time helper ─────────────────────────────────────────────────────
const formatTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// ─── Component ────────────────────────────────────────────────────────────────
/**
 * OrderChat — renders the order-linked buyer ↔ artisan chat panel.
 *
 * Props:
 *   order      — the raw order object from MyPurchases (has id, productName, sellerName / buyerName etc.)
 *   currentUserId — string id of the logged-in user
 *   onClose    — callback to close the panel
 */
const OrderChat = ({ order, currentUserId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [orderInfo, setOrderInfo] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const pollingRef = useRef(null);

  const fetchMessages = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await messageService.getOrderMessages(order.id);
      if (data.success) {
        setMessages(data.messages || []);
        if (data.order) setOrderInfo(data.order);
      }
    } catch (err) {
      if (!silent) {
        setError(err?.response?.data?.message || 'Failed to load messages');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [order.id]);

  // Initial fetch + poll every 8 seconds for new messages
  useEffect(() => {
    fetchMessages();
    pollingRef.current = setInterval(() => fetchMessages(true), 8000);
    return () => clearInterval(pollingRef.current);
  }, [fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || sending) return;

    setSending(true);
    setInputValue('');
    try {
      const data = await messageService.sendOrderMessage(order.id, text);
      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send message');
      setInputValue(text); // restore on failure
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  // Determine the "other party" display name
  const otherParty = orderInfo
    ? (orderInfo.buyer?._id?.toString() === currentUserId
        ? orderInfo.seller
        : orderInfo.buyer)
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="relative flex flex-col w-full sm:max-w-lg bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
        style={{ height: '90svh', maxHeight: '680px' }}
      >
        {/* ── Header ── */}
        <div className="shrink-0 flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
          <div className="flex items-center justify-center w-9 h-9 rounded-2xl bg-pink-50 dark:bg-pink-950/40 border border-pink-100 dark:border-pink-900/40 shrink-0">
            <MessageCircle className="w-4.5 h-4.5 text-pink-500" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {otherParty ? otherParty.fullName : 'Order Chat'}
              </h3>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-900/40">
                <ShieldCheck className="w-2.5 h-2.5" /> Verified
              </span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Package className="w-3 h-3 text-gray-400" />
              <span className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                {order.productName} · #{order.id?.slice(-6)}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
              <Loader2 className="w-7 h-7 animate-spin text-pink-400" />
              <p className="text-xs">Loading messages…</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
              <AlertCircle className="w-8 h-8 text-rose-400" />
              <p className="text-sm font-medium text-rose-500">{error}</p>
              <button
                onClick={() => fetchMessages()}
                className="text-xs text-pink-600 underline hover:text-pink-700"
              >
                Try again
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
              <div className="w-14 h-14 rounded-3xl bg-pink-50 dark:bg-gray-800 flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-pink-300" />
              </div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No messages yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 max-w-[220px]">
                Start the conversation. Ask about delivery details, packaging, or anything related to your order.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId?._id?.toString() === currentUserId?.toString()
                          || msg.senderId?.toString() === currentUserId?.toString();
              return (
                <div key={msg._id} className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  {!isMine && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0 mb-0.5">
                      {(msg.senderId?.fullName?.[0] || '?').toUpperCase()}
                    </div>
                  )}

                  <div className={`flex flex-col gap-0.5 max-w-[75%] ${isMine ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                        isMine
                          ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-br-md'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md'
                      }`}
                    >
                      {msg.message}
                    </div>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 px-1">
                      {formatTime(msg.createdAt)}
                      {isMine && (
                        <span className={`ml-1 ${msg.isRead ? 'text-blue-400' : 'text-gray-300'}`}>
                          {msg.isRead ? '✓✓' : '✓'}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── Input ── */}
        <div className="shrink-0 px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
          {error && !loading && messages.length > 0 && (
            <p className="text-[10px] text-rose-500 mb-2 text-center">{error}</p>
          )}
          <form onSubmit={handleSend} className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message… (Enter to send)"
              rows={1}
              maxLength={2000}
              className="flex-1 resize-none rounded-2xl px-4 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border border-transparent focus:border-pink-300 dark:focus:border-pink-700 focus:outline-none transition-colors"
              style={{ maxHeight: '120px', overflowY: 'auto' }}
              disabled={loading || !!error}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || sending || loading}
              className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg hover:shadow-pink-200/50 dark:hover:shadow-pink-900/30 hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              aria-label="Send message"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
          <p className="text-[9px] text-gray-400 dark:text-gray-600 mt-1.5 text-center">
            Messages are private between buyer and artisan · linked to this order only
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderChat;

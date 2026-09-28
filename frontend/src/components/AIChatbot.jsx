/**
 * AIChatbot.jsx
 *
 * SheSphere AI — right-side sliding chatbot panel.
 *
 * Features:
 *  ✓ Welcome message on first open
 *  ✓ Chat history (user + AI message bubbles)
 *  ✓ Auto-scroll to latest message
 *  ✓ Typing indicator (animated dots)
 *  ✓ Close button
 *  ✓ Input field + Send button + Enter key support
 *  ✓ Clear conversation button
 *  ✓ Framer-motion slide-in animation
 *  ✓ Responsive: drawer on desktop/tablet, full-screen on mobile
 *  ✓ Matches SheSphere pastel pink/lavender theme
 *  ✓ Error handling with user-friendly messages
 *
 * The component calls /api/ai/chat via aiService.js.
 * JWT is attached automatically by the Axios interceptor in api.js.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, Trash2, Sparkles, Minus, Maximize2, Minimize2 } from 'lucide-react';
import { sendChatMessage } from '../services/aiService';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';

// ─── Suggestion chips shown in the welcome state ─────────────────────────────
const SUGGESTION_CHIPS = [
  "What should I learn today?",
  "Create a weekly learning plan",
  "Explain my progress",
  "I want to start a home business",
  "I'm feeling demotivated",
  "What badge am I close to?",
];

// ─── Typing indicator component ───────────────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex items-end gap-2 mb-4">
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center flex-shrink-0 shadow-sm">
      <Bot className="w-4 h-4 text-white" />
    </div>
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm text-gray-800 dark:text-gray-100">
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </div>
);

// ─── Render markdown-style bold text (**text**) ───────────────────────────────
const renderText = (text) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
};

// ─── Single message bubble ────────────────────────────────────────────────────
const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex items-end gap-2 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center flex-shrink-0 shadow-sm">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Bubble */}
      <div
        className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${isUser
          ? 'bg-gradient-to-br from-pink-400 to-pink-500 text-white rounded-br-sm'
          : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-750 text-gray-800 dark:text-gray-100 rounded-bl-sm'
          }`}
      >
        {isUser ? message.text : renderText(message.text)}
        {message.source === 'database' && (
          <span className="block text-xs mt-1 opacity-60">📊 from your profile</span>
        )}
      </div>
    </motion.div>
  );
};

// ─── Main AIChatbot Component ─────────────────────────────────────────────────
const AIChatbot = ({ isOpen, onClose }) => {
  const { userData } = useUser();
  const { t } = useLanguage();
  const userId = userData?._id || userData?.id || null;

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [error, setError] = useState(null);

  // View state: 'normal' | 'maximized' | 'minimized'
  const [viewMode, setViewMode] = useState('normal');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Reset messages and state whenever authenticated user changes or logs out
  useEffect(() => {
    setMessages([]);
    setInputValue('');
    setIsTyping(false);
    setHasStarted(false);
    setError(null);
    setViewMode('normal');
  }, [userId]);

  // Auto-scroll to bottom whenever messages update
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (viewMode !== 'minimized') {
      scrollToBottom();
    }
  }, [messages, isTyping, viewMode, scrollToBottom]);

  // Focus input when panel opens or mode changes to normal/maximized
  useEffect(() => {
    if (isOpen && viewMode !== 'minimized') {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen, viewMode]);

  // Reset viewMode to normal when chatbot is reopened
  useEffect(() => {
    if (!isOpen) {
      setViewMode('normal');
    }
  }, [isOpen]);

  // ── Send message handler ──────────────────────────────────────────────────
  const handleSend = async (text) => {
    const messageText = (text || inputValue).trim();
    if (!messageText || isTyping) return;

    setInputValue('');
    setError(null);
    setHasStarted(true);

    // Add user message
    const userMsg = { id: Date.now(), role: 'user', text: messageText };
    setMessages((prev) => [...prev, userMsg]);

    // Show typing indicator
    setIsTyping(true);

    try {
      const data = await sendChatMessage(messageText);
      const aiMsg = {
        id: Date.now() + 1,
        role: 'ai',
        text: data.reply,
        source: data.source,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errText =
        err?.response?.data?.message ||
        '❌ Something went wrong. Please try again.';
      setError(errText);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'ai', text: errText },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // ── Clear conversation ────────────────────────────────────────────────────
  const handleClear = () => {
    setMessages([]);
    setHasStarted(false);
    setError(null);
    inputRef.current?.focus();
  };

  // ── Enter key support ─────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Minimized Floating Bar ─────────────────────────────── */}
          {viewMode === 'minimized' ? (
            <motion.div
              key="minimized-bar"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 md:bottom-6 md:right-6 z-50 flex items-center gap-3 px-4 py-2.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-pink-200/80 dark:border-pink-900/50 shadow-2xl rounded-full cursor-pointer hover:shadow-pink-500/20 hover:border-pink-300 dark:hover:border-pink-800 transition-all group"
              onClick={() => setViewMode('normal')}
            >
              <div className="relative flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Bot className="w-4.5 h-4.5 text-white" />
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full" />
              </div>

              <div className="flex flex-col pr-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-100">{t('chatbot.title')}</span>
                  {messages.length > 0 && (
                    <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-300 rounded-full">
                      {messages.length}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-pink-500 dark:text-pink-400 font-medium">{t('chatbot.clickToExpand')}</span>
              </div>

              <div className="flex items-center gap-1 border-l border-gray-200 dark:border-gray-800 pl-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewMode('normal');
                  }}
                  title="Restore normal view"
                  className="w-7 h-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  title="Close chatbot"
                  className="w-7 h-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              {/* ── Backdrop (Maximized mode & Mobile normal mode) ───── */}
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`fixed inset-0 z-40 ${viewMode === 'maximized'
                  ? 'bg-black/40 dark:bg-black/60 backdrop-blur-xs'
                  : 'bg-black/20 md:hidden'
                  }`}
                onClick={() => {
                  if (viewMode === 'maximized') {
                    setViewMode('normal');
                  } else {
                    onClose();
                  }
                }}
              />

              {/* ── Chat Panel ──────────────────────────────────────── */}
              <motion.div
                key="chatpanel"
                layout
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                className={`
                  fixed z-50 flex flex-col shadow-2xl rounded-[24px] overflow-hidden
                  bg-gray-50 dark:bg-gray-900 border border-pink-200/60 dark:border-gray-800
                  ${viewMode === 'maximized'
                    ? 'top-1/2 left-[52%] -translate-x-1/2 -translate-y-1/2 w-[90vw] sm:w-[92vw] lg:w-[90vw] h-[94vh] sm:h-[90vh] max-w-[1400px] max-h-[900px]'
                    : 'bottom-2.5 sm:bottom-5 md:bottom-6 left-[10px] right-[10px] sm:left-auto sm:right-5 md:right-6 w-[calc(100vw-20px)] sm:w-[440px] md:w-[60vw] lg:w-[40vw] xl:w-[38vw] h-[75vh] md:h-[70vh] max-w-[580px] max-h-[750px] min-h-[420px]'
                  }
                `}
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {/* ── Header ─────────────────────────────────────────── */}
                <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-pink-400 via-pink-300 to-purple-300 shadow-md flex-shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold text-sm leading-tight">{t('chatbot.title')}</p>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Online" />
                      </div>
                      <p className="text-white/80 text-xs">{t('chatbot.subtext')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Clear conversation button */}
                    {messages.length > 0 && (
                      <button
                        onClick={handleClear}
                        title="Clear conversation"
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    )}

                    {/* Minimize button */}
                    <button
                      onClick={() => setViewMode('minimized')}
                      title="Minimize"
                      className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                    >
                      <Minus className="w-4 h-4 text-white" />
                    </button>

                    {/* Maximize / Restore button */}
                    {viewMode === 'maximized' ? (
                      <button
                        onClick={() => setViewMode('normal')}
                        title="Restore size"
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                      >
                        <Minimize2 className="w-4 h-4 text-white" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setViewMode('maximized')}
                        title="Maximize"
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                      >
                        <Maximize2 className="w-4 h-4 text-white" />
                      </button>
                    )}

                    {/* Close button */}
                    <button
                      onClick={onClose}
                      title="Close"
                      className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* ── Messages area ─────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 scroll-smooth">
                  {/* Welcome state (before any message is sent) */}
                  {!hasStarted && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-center py-4"
                    >
                      {/* Welcome illustration */}
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center mx-auto mb-3 shadow-inner">
                        <Sparkles className="w-8 h-8 text-pink-500" />
                      </div>

                      <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-1">
                        {t('chatbot.welcomeHi', { name: userData?.fullName?.split(' ')[0] || 'there' })}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 px-4 leading-relaxed max-w-md mx-auto">
                        {t('chatbot.welcomeDesc')}
                      </p>

                      {/* Suggestion chips */}
                      <div className="flex flex-wrap gap-2 justify-center px-2 max-w-xl mx-auto">
                        {SUGGESTION_CHIPS.map((chip) => (
                          <button
                            key={chip}
                            onClick={() => handleSend(chip)}
                            className="text-xs bg-white dark:bg-gray-800 border border-pink-200 dark:border-pink-900/40 text-pink-600 dark:text-pink-400 rounded-full px-3 py-1.5 hover:bg-pink-50 dark:hover:bg-pink-900/10 hover:border-pink-300 dark:hover:border-pink-900/50 transition-colors shadow-sm cursor-pointer"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Chat messages */}
                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}

                  {/* Typing indicator */}
                  {isTyping && <TypingIndicator />}

                  {/* Scroll anchor */}
                  <div ref={messagesEndRef} />
                </div>

                {/* ── Input area ────────────────────────────────────── */}
                <div className="flex-shrink-0 px-4 py-3 bg-white dark:bg-gray-850 border-t border-gray-100 dark:border-gray-800 shadow-inner">
                  <div className="flex items-end gap-2 max-w-4xl mx-auto">
                    <textarea
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={t('chatbot.inputPlaceholder')}
                      rows={1}
                      disabled={isTyping}
                      className="flex-1 resize-none border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all disabled:opacity-50 max-h-28 overflow-y-auto"
                      style={{ lineHeight: '1.5' }}
                      onInput={(e) => {
                        // Auto-grow textarea
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 112) + 'px';
                      }}
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={!inputValue.trim() || isTyping}
                      title="Send message"
                      className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white flex items-center justify-center flex-shrink-0 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {t('chatbot.poweredBy')}
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </>
      )}
    </AnimatePresence>
  );
};

export default AIChatbot;


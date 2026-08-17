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
import { X, Send, Bot, Trash2, Sparkles } from 'lucide-react';
import { sendChatMessage } from '../services/aiService';
import { useUser } from '../context/UserContext';

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
        className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
          isUser
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
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom whenever messages update
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 350);
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

  // ── Panel animation variants ──────────────────────────────────────────────
  const panelVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: 'spring', damping: 28, stiffness: 280 } },
    exit: { x: '100%', opacity: 0, transition: { duration: 0.22, ease: 'easeIn' } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop (mobile only) ────────────────────────────────── */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={onClose}
          />

          {/* ── Chat Panel ───────────────────────────────────────────── */}
          <motion.div
            key="chatpanel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`
              fixed z-50 flex flex-col shadow-2xl
              /* Mobile: full screen */
              inset-0
              /* Desktop / tablet: right-side drawer */
              md:inset-auto md:top-0 md:right-0 md:bottom-0 md:w-[400px]
              bg-gray-50 dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800
            `}
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-pink-400 via-pink-300 to-purple-300 shadow-md flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-tight">SheSphere AI</p>
                  <p className="text-white/80 text-xs">Your learning mentor</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Clear button */}
                {messages.length > 0 && (
                  <button
                    onClick={handleClear}
                    title="Clear conversation"
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                )}
                {/* Close button */}
                <button
                  onClick={onClose}
                  title="Close"
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* ── Messages area ─────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 scroll-smooth">

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
                    Hi {userData?.fullName?.split(' ')[0] || 'there'}! 👋
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 px-4 leading-relaxed">
                    I'm your personal SheSphere AI mentor. Ask me anything about
                    learning, your progress, or starting a home business!
                  </p>

                  {/* Suggestion chips */}
                  <div className="flex flex-wrap gap-2 justify-center px-2">
                    {SUGGESTION_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        onClick={() => handleSend(chip)}
                        className="text-xs bg-white dark:bg-gray-800 border border-pink-200 dark:border-pink-900/40 text-pink-600 dark:text-pink-400 rounded-full px-3 py-1.5 hover:bg-pink-50 dark:hover:bg-pink-900/10 hover:border-pink-300 dark:hover:border-pink-900/50 transition-colors shadow-sm"
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

            {/* ── Input area ────────────────────────────────────────── */}
            <div className="flex-shrink-0 px-4 py-3 bg-white dark:bg-gray-850 border-t border-gray-100 dark:border-gray-800 shadow-inner">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  rows={1}
                  disabled={isTyping}
                  className="flex-1 resize-none border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl px-3 py-2.5 text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all disabled:opacity-50 max-h-28 overflow-y-auto"
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
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white flex items-center justify-center flex-shrink-0 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
                Powered by Google Gemini · Press Enter to send
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AIChatbot;

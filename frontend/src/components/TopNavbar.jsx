import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, X, Bell, Bot, Settings as Gear, User as UserIcon, Sun, Moon, ChevronDown } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { useSearch } from '../context/SearchContext';
import AIChatbot from './AIChatbot';
import NotificationDropdown from './NotificationDropdown';

// Mapping of route paths to readable page titles
const pageTitles = {
  '/dashboard': 'Dashboard',
  '/dashboard/games': 'Games',
  '/dashboard/journal': 'Journal',
  '/dashboard/community': 'Community',
  '/dashboard/profile': 'Profile',
  '/profile': 'Profile',
  '/dashboard/streaks': 'Streaks',
  '/dashboard/interests': 'Select Interests',
  '/dashboard/edit-profile': 'Edit Profile',
  '/marketplace': 'Marketplace',
  '/marketplace/sell': 'Sell Product',
  '/marketplace/orders': 'Orders & Purchases',
  '/dashboard/marketplace': 'Marketplace',
  '/dashboard/marketplace/sell': 'Sell Product',
  '/dashboard/marketplace/orders': 'Orders & Purchases',
};

const getSearchPlaceholder = (pathname) => {
  const path = pathname.toLowerCase();
  if (path.includes('/marketplace')) return 'Search marketplace products...';
  if (path.includes('/community')) return 'Search community groups...';
  if (path.includes('/journal')) return 'Search journal entries or dates...';
  if (path.includes('/streaks')) return 'Search streak milestones & info...';
  if (path.includes('/games')) return 'Search available games...';
  if (path.includes('/settings')) return 'Search settings options...';
  if (path.includes('/profile')) return 'Search profile sections...';
  return 'Search videos & articles...';
};

const TopNavbar = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData } = useUser();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const { searchQuery, setSearchQuery, clearSearch } = useSearch();

  // ── AI Chatbot panel state ────────────────────────────────────────────────
  const [isChatOpen, setIsChatOpen] = useState(false);
  // ── Notification dropdown state ─────────────────────────────────────────
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  let title = pageTitles[location.pathname];
  if (!title) {
    if (location.pathname.startsWith('/marketplace/') || location.pathname.startsWith('/dashboard/marketplace/')) {
      title = 'Product Details';
    } else {
      title = 'SheSphere';
    }
  }

  const handleProfileClick = () => {
    navigate('/dashboard/profile');
  };

  const placeholder = getSearchPlaceholder(location.pathname);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between bg-white/85 dark:bg-gray-900/85 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 px-4 md:px-6 py-3 transition-colors duration-300">
        {/* Mobile menu button */}
        <button
          className="md:hidden text-[var(--text-muted)] hover:text-[var(--text-main)] p-2 rounded-xl bg-gray-100/60 dark:bg-gray-800/60 transition-colors"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Left – Page title */}
        <div className="flex-1 text-lg md:text-xl font-bold bg-gradient-to-r from-gray-900 via-purple-950 to-gray-800 dark:from-white dark:via-purple-200 dark:to-gray-200 bg-clip-text text-transparent ml-2 md:ml-0">
          {title}
        </div>

        {/* Center – Search (visible on sm+) */}
        <div className="hidden sm:flex items-center gap-2 flex-1 max-w-md mx-4 md:mx-6">
          <div className="relative w-full flex items-center">
            <Search className="w-4.5 h-4.5 absolute left-3.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full border border-gray-200/80 dark:border-gray-750 bg-gray-50/60 dark:bg-gray-800/60 text-[var(--text-main)] rounded-2xl pl-10 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 dark:focus:ring-pink-500/30 focus:border-pink-500 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer p-0.5 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                title="Clear search"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right – Icon controls with balanced spacing */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Notification bell & dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen((prev) => !prev)}
              className="relative p-2.5 rounded-2xl hover:bg-pink-50/80 dark:hover:bg-gray-800 transition-colors cursor-pointer group focus:outline-none"
              title="Notifications"
              aria-label="Toggle notifications"
            >
              <Bell className={`w-5 h-5 transition-colors ${isNotificationsOpen ? 'text-pink-500' : 'text-[var(--text-muted)] group-hover:text-pink-500'}`} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white shadow-xs">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            <NotificationDropdown
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
            />
          </div>

          {/* Theme toggle icon button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl bg-gray-100/70 dark:bg-gray-800/70 text-[var(--text-muted)] hover:text-pink-500 dark:hover:text-pink-400 transition-all hover:scale-105 cursor-pointer shadow-2xs"
            title={theme === 'dark' ? 'Switch to Light Mode ☀️' : 'Switch to Dark Mode 🌙'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
          </button>

          {/* 🤖 SheSphere AI button */}
          <button
            id="shesphere-ai-btn"
            onClick={() => setIsChatOpen(true)}
            title="SheSphere AI Assistant"
            className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 dark:from-pink-950/40 dark:via-purple-950/40 dark:to-indigo-950/40 border border-pink-200/50 dark:border-pink-900/40 text-pink-600 dark:text-pink-300 hover:border-pink-400 transition-all group shadow-2xs cursor-pointer"
            aria-label="Open SheSphere AI Assistant"
          >
            <Bot className="w-5 h-5 group-hover:scale-110 transition-transform text-pink-500" />
            <span className="hidden sm:block text-xs font-bold whitespace-nowrap tracking-wide">
              SheSphere AI
            </span>
          </button>


          {/* User Profile Button */}
          <button onClick={handleProfileClick} className="flex items-center gap-2.5 pl-2 focus:outline-none cursor-pointer group">
            {userData.profilePicture ? (
              <img src={userData.profilePicture} alt="avatar" className="w-9 h-9 rounded-full object-cover border-2 border-pink-300 shadow-2xs" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-2xs border-2 border-white dark:border-gray-800">
                {(userData.fullName || 'U').charAt(0)}
              </div>
            )}
            <span className="text-sm font-semibold text-[var(--text-main)] hidden sm:block">
              {userData.fullName || 'Shrilakshmi Hegde'}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-pink-500 transition-colors" />
          </button>

        </div>
      </header>

      {/* AI Chatbot panel */}
      <AIChatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
};

export default TopNavbar;

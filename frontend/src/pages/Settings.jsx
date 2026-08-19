import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Palette, Key, LogOut, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import CardBase from '../components/dashboard/CardBase';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const Settings = () => {
  const navigate = useNavigate();
  const { userData, updateUserData, logout } = useUser();
  const { theme, setTheme } = useTheme();

  // ── 1. Language State ───────────────────────────────────────────────────────
  const [language, setLanguage] = useState(userData.language || 'english');
  const [langSaving, setLangSaving] = useState(false);
  const [langMessage, setLangMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (userData.language) {
      setLanguage(userData.language.toLowerCase());
    }
  }, [userData.language]);

  const handleSaveLanguage = async () => {
    setLangSaving(true);
    setLangMessage({ text: '', type: '' });
    try {
      await api.put('/auth/profile', { language });
      updateUserData({ language });
      setLangMessage({ text: 'Language preference saved!', type: 'success' });
      setTimeout(() => setLangMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setLangMessage({ text: err.response?.data?.message || 'Failed to save language preference', type: 'error' });
    } finally {
      setLangSaving(false);
    }
  };

  // ── 2. Password State ───────────────────────────────────────────────────────
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMessage, setPwdMessage] = useState({ text: '', type: '' });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdMessage({ text: '', type: '' });

    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setPwdMessage({ text: 'All password fields are required', type: 'error' });
      return;
    }

    if (passwords.new.length < 8) {
      setPwdMessage({ text: 'New password must be at least 8 characters long', type: 'error' });
      return;
    }

    if (passwords.new !== passwords.confirm) {
      setPwdMessage({ text: 'New passwords do not match', type: 'error' });
      return;
    }

    setPwdLoading(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.new,
        confirmPassword: passwords.confirm
      });
      setPwdMessage({ text: res.data?.message || 'Password updated successfully!', type: 'success' });
      setPasswords({ current: '', new: '', confirm: '' });
      setTimeout(() => setPwdMessage({ text: '', type: '' }), 4000);
    } catch (err) {
      setPwdMessage({ text: err.response?.data?.message || 'Failed to update password', type: 'error' });
    } finally {
      setPwdLoading(false);
    }
  };

  // ── 3. Logout ───────────────────────────────────────────────────────────────
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-poppins min-h-screen pb-12">
      {/* Page Header */}
      <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-5">
        <div className="p-3 rounded-2xl bg-pink-50 dark:bg-pink-950/60 border border-pink-100 dark:border-pink-900/50 text-pink-500 shrink-0">
          <Globe className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-main)]">Settings</h1>
          <p className="text-sm text-[var(--text-muted)]">Manage your language preferences, theme appearance, and security settings.</p>
        </div>
      </div>

      {/* 🌐 Section 1: Language */}
      <div className="glass-card rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-pink-500">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--text-main)]">Language Preferences</h2>
            <p className="text-xs text-[var(--text-muted)]">Choose your preferred language for the SheSphere dashboard</p>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-main)] mb-2">
              Display Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full sm:w-72 h-12 px-4 bg-gray-50/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-medium text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-pink-300 dark:focus:ring-pink-500/30 focus:border-pink-500 cursor-pointer transition-all"
            >
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
              <option value="kannada">Kannada</option>
            </select>
          </div>

          {langMessage.text && (
            <div className={`flex items-center gap-2 text-xs font-semibold ${
              langMessage.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {langMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{langMessage.text}</span>
            </div>
          )}

          <div>
            <button
              onClick={handleSaveLanguage}
              disabled={langSaving}
              className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold rounded-full shadow-md transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {langSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Save Language</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🎨 Section 2: Theme */}
      <div className="glass-card rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-500">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--text-main)]">Appearance Theme</h2>
            <p className="text-xs text-[var(--text-muted)]">Switch between Light Mode ☀️ and Dark Mode 🌙</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              theme === 'light'
                ? 'bg-pink-50/60 border-pink-400 dark:bg-gray-800 shadow-sm ring-2 ring-pink-300'
                : 'bg-gray-50/50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 hover:border-pink-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">☀️</span>
              <div>
                <span className="text-sm font-bold text-[var(--text-main)] block">Light Mode</span>
                <span className="text-xs text-[var(--text-muted)]">Soft blush & pastel cream</span>
              </div>
            </div>
            <input
              type="radio"
              name="theme"
              value="light"
              checked={theme === 'light'}
              onChange={() => setTheme('light')}
              className="w-4 h-4 text-pink-500 cursor-pointer"
            />
          </div>

          <div
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              theme === 'dark'
                ? 'bg-purple-950/40 border-purple-400 shadow-sm ring-2 ring-purple-500'
                : 'bg-gray-50/50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌙</span>
              <div>
                <span className="text-sm font-bold text-[var(--text-main)] block">Dark Mode</span>
                <span className="text-xs text-[var(--text-muted)]">Deep plum & navy tones</span>
              </div>
            </div>
            <input
              type="radio"
              name="theme"
              value="dark"
              checked={theme === 'dark'}
              onChange={() => setTheme('dark')}
              className="w-4 h-4 text-purple-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 🔐 Section 3: Change Password */}
      <div className="glass-card rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--text-main)]">Change Password</h2>
            <p className="text-xs text-[var(--text-muted)]">Update your login security credentials</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4 pt-2 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              placeholder="••••••••"
              className="w-full h-11 px-4 bg-gray-50/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-medium text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-pink-300 dark:focus:ring-pink-500/30 focus:border-pink-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                placeholder="At least 8 characters"
                className="w-full h-11 px-4 bg-gray-50/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-medium text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-pink-300 dark:focus:ring-pink-500/30 focus:border-pink-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                placeholder="Re-enter new password"
                className="w-full h-11 px-4 bg-gray-50/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-medium text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-pink-300 dark:focus:ring-pink-500/30 focus:border-pink-500 transition-all"
              />
            </div>
          </div>

          {pwdMessage.text && (
            <div className={`flex items-center gap-2 text-xs font-semibold ${
              pwdMessage.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {pwdMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{pwdMessage.text}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={pwdLoading}
              className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold rounded-full shadow-md transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {pwdLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Update Password</span>
            </button>
          </div>
        </form>
      </div>

      {/* 🚪 Section 4: Logout */}
      <div className="pt-2">
        <button
          onClick={handleLogout}
          className="w-full py-3 px-4 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 text-xs font-bold rounded-2xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Settings;

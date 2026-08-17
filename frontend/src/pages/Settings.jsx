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
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-5 font-poppins min-h-screen">
      
      {/* Page Header */}
      <div className="mb-2">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">Manage your language, theme, and security settings.</p>
      </div>

      {/* 🌐 Section 1: Language */}
      <CardBase className="p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm rounded-2xl bg-white dark:bg-gray-800 transition-colors">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-pink-600 dark:text-pink-400" />
          <h2 className="text-sm font-bold text-gray-800 dark:text-white">Language Preferences</h2>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
              Display Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full sm:w-64 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-xs text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 cursor-pointer transition-colors"
            >
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
              <option value="kannada">Kannada</option>
            </select>
          </div>

          {langMessage.text && (
            <div className={`flex items-center gap-1.5 text-xs font-medium ${
              langMessage.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {langMessage.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              <span>{langMessage.text}</span>
            </div>
          )}

          <div>
            <button
              onClick={handleSaveLanguage}
              disabled={langSaving}
              className="px-4 py-1.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold rounded-xl shadow-sm transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {langSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Save Language
            </button>
          </div>
        </div>
      </CardBase>

      {/* 🎨 Section 2: Theme */}
      <CardBase className="p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm rounded-2xl bg-white dark:bg-gray-800 transition-colors">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4 text-pink-600 dark:text-pink-400" />
          <h2 className="text-sm font-bold text-gray-800 dark:text-white">Appearance Theme</h2>
        </div>

        <div className="flex items-center gap-6">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="theme"
              value="light"
              checked={theme === 'light'}
              onChange={() => setTheme('light')}
              className="w-4 h-4 text-pink-600 border-gray-300 focus:ring-pink-500 cursor-pointer"
            />
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Light Mode</span>
          </label>

          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="theme"
              value="dark"
              checked={theme === 'dark'}
              onChange={() => setTheme('dark')}
              className="w-4 h-4 text-pink-600 border-gray-300 focus:ring-pink-500 cursor-pointer"
            />
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Dark Mode</span>
          </label>
        </div>
      </CardBase>

      {/* 🔐 Section 3: Change Password */}
      <CardBase className="p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm rounded-2xl bg-white dark:bg-gray-800 transition-colors">
        <div className="flex items-center gap-2 mb-3">
          <Key className="w-4 h-4 text-pink-600 dark:text-pink-400" />
          <h2 className="text-sm font-bold text-gray-800 dark:text-white">Change Password</h2>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-3 max-w-lg">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              placeholder="••••••••"
              className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-xs text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                placeholder="At least 8 characters"
                className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-xs text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                placeholder="Re-enter new password"
                className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-xs text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 transition-colors"
              />
            </div>
          </div>

          {pwdMessage.text && (
            <div className={`flex items-center gap-1.5 text-xs font-medium ${
              pwdMessage.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {pwdMessage.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              <span>{pwdMessage.text}</span>
            </div>
          )}

          <div className="pt-1">
            <button
              type="submit"
              disabled={pwdLoading}
              className="px-4 py-1.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold rounded-xl shadow-sm transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {pwdLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Update Password
            </button>
          </div>
        </form>
      </CardBase>

      {/* 🚪 Section 4: Logout */}
      <div className="pt-2">
        <button
          onClick={handleLogout}
          className="w-full py-2 px-4 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 text-xs font-semibold rounded-xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Settings;

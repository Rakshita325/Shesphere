import React, { useState } from 'react';
import CardBase from '../components/dashboard/CardBase';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import { useUser } from '../context/UserContext';

// Simple checkbox component using Tailwind
const Checkbox = ({ label, checked, onChange }) => (
  <label className="inline-flex items-center space-x-2">
    <input
      type="checkbox"
      className="form-checkbox h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
      checked={checked}
      onChange={e => onChange(e.target.checked)}
    />
    <span className="text-sm text-gray-700">{label}</span>
  </label>
);

const Settings = () => {
  const { userData, updateUserData, logout } = useUser();
  const [name, setName] = useState(userData.name || '');
  const [email, setEmail] = useState(userData.email || '');
  const [phone, setPhone] = useState(userData.phone || '');
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState({ email: true, push: false });
  const [theme, setTheme] = useState('light');
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  const handleSaveAccount = () => {
    updateUserData({ ...userData, name, email, phone });
  };

  const handleSaveLanguage = () => {
    console.log('Language set to', language);
  };

  const handleSaveNotifications = () => {
    console.log('Notification prefs', notifications);
  };

  const handleThemeChange = (mode) => {
    setTheme(mode);
    const root = document.documentElement;
    if (mode === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
  };

  const handlePasswordChange = () => {
    if (passwords.new !== passwords.confirm) {
      alert('New passwords do not match');
      return;
    }
    console.log('Password changed');
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const handleLogout = () => {
    if (logout) logout(); else console.log('Logout');
  };

  return (
    <div className="p-6 space-y-8 font-poppins bg-gradient-to-b from-pastel-blue/5 to-white min-h-screen dark:bg-gray-900">


      {/* Language Settings */}
      <CardBase className="p-6">
        <h2 className="text-xl font-semibold text-pink-600 mb-4">🌐 Language Settings</h2>
        <Select
          options={[
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' },
            { value: 'de', label: 'German' },
          ]}
          value={language}
          onChange={e => setLanguage(e.target.value)}
        />
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSaveLanguage}>Save Language</Button>
        </div>
      </CardBase>

      {/* Notification Preferences */}
      <CardBase className="p-6">
        <h2 className="text-xl font-semibold text-pink-600 mb-4">🔔 Notification Preferences</h2>
        <div className="space-y-2">
          <Checkbox label="Email Notifications" checked={notifications.email} onChange={val => setNotifications({ ...notifications, email: val })} />
          <Checkbox label="Push Notifications" checked={notifications.push} onChange={val => setNotifications({ ...notifications, push: val })} />
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSaveNotifications}>Save Preferences</Button>
        </div>
      </CardBase>

      {/* Theme */}
      <CardBase className="p-6">
        <h2 className="text-xl font-semibold text-pink-600 mb-4">🎨 Theme</h2>
        <div className="flex space-x-4">
          <Button className={theme === 'light' ? 'bg-pink-600 text-white' : ''} onClick={() => handleThemeChange('light')}>Light Mode</Button>
          <Button className={theme === 'dark' ? 'bg-pink-600 text-white' : ''} onClick={() => handleThemeChange('dark')}>Dark Mode</Button>
        </div>
      </CardBase>

      {/* Privacy Settings */}
      <CardBase className="p-6">
        <h2 className="text-xl font-semibold text-pink-600 mb-4">🔐 Privacy Settings</h2>
        <p className="text-gray-700">Customize your data sharing preferences here. (Placeholder for future options.)</p>
      </CardBase>

      {/* Change Password */}
      <CardBase className="p-6">
        <h2 className="text-xl font-semibold text-pink-600 mb-4">🔑 Change Password</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Current Password" type="password" value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })} />
          <Input label="New Password" type="password" value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })} />
          <Input label="Confirm New Password" type="password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} />
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handlePasswordChange}>Update Password</Button>
        </div>
      </CardBase>

      {/* Logout */}
      <CardBase className="p-6 flex justify-end">
        <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white">🚪 Logout</Button>
      </CardBase>
    </div>
  );
};

export default Settings;

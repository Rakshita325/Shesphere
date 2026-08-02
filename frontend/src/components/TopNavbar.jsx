import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, HelpCircle, Settings as Gear, User as UserIcon } from 'lucide-react';
import { useUser } from '../context/UserContext';

// Mapping of route paths to readable page titles
const pageTitles = {
  '/dashboard': 'Dashboard',
  '/dashboard/games': 'Games',
  '/dashboard/journal': 'Journal',
  '/dashboard/community': 'Community',
  '/dashboard/profile': 'Profile',
  '/dashboard/streaks': 'Streaks',
  '/dashboard/settings': 'Settings',
  '/dashboard/interests': 'Select Interests',
  '/dashboard/edit-profile': 'Edit Profile',
};

const TopNavbar = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData } = useUser();

  const title = pageTitles[location.pathname] || 'SheSphere';

  const handleProfileClick = () => {
    navigate('/dashboard/profile');
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-pastel-lavender/50 px-4 py-2.5">
      {/* Mobile menu button */}
      <button className="md:hidden text-gray-600" onClick={onMenuClick} aria-label="Open menu">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Left – Page title */}
      <div className="flex-1 text-lg font-semibold text-gray-800 ml-2 md:ml-0">{title}</div>

      {/* Center – Search (visible on md+) */}
      <div className="hidden md:flex items-center gap-2 flex-1 max-w-md mx-4">
        <Search className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search..."
          className="flex-1 border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-pink-300"
        />
      </div>

      {/* Right – icons and user info */}
      <div className="flex items-center gap-4">
        <Bell className="w-5 h-5 text-gray-600 cursor-pointer" />
        <HelpCircle className="w-5 h-5 text-gray-600 cursor-pointer" />
        <Gear onClick={() => navigate('/dashboard/settings')} className="w-5 h-5 text-gray-600 cursor-pointer" />
        <button onClick={handleProfileClick} className="flex items-center gap-2 focus:outline-none">
          {userData.profilePicture ? (
            <img src={userData.profilePicture} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <UserIcon className="w-8 h-8 text-gray-600" />
          )}
          <span className="text-sm font-medium text-gray-800 hidden sm:block">
            {userData.fullName || 'User'}
          </span>
        </button>
      </div>
    </header>
  );
};

export default TopNavbar;

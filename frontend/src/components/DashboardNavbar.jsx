import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, User, ChevronDown } from 'lucide-react';
import { useUser } from '../context/UserContext';
import Select from '../components/ui/Select';

const interests = [
  { value: 'cooking', label: 'Cooking' },
  { value: 'arts', label: 'Arts & Crafts' },
  { value: 'gardening', label: 'Gardening' },
  { value: 'digital', label: 'Digital Skills' },
];

const DashboardNavbar = () => {
  const { userData, updateUserData } = useUser();
  const [selectedInterest, setSelectedInterest] = useState(userData.interest || '');

  const handleInterestChange = (e) => {
    const value = e.target.value;
    setSelectedInterest(value);
    updateUserData({ interest: value });
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white shadow-sm border-b border-pastel-lavender/30">
      <div className="flex items-center gap-4 w-full max-w-md">
        <Search className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search..."
          className="flex-1 border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-pink-300"
        />
      </div>
      <div className="flex items-center gap-4">
        <Select
          label=""
          value={selectedInterest}
          onChange={handleInterestChange}
          options={interests}
          className="w-48"
        />
        <button className="relative text-gray-600 hover:text-pink-500 focus:outline-none">
          <Bell className="w-5 h-5" />
          {/* placeholder badge */}
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full" />
        </button>
        <div className="relative">
          <button className="flex items-center gap-2 text-gray-600 hover:text-pink-500 focus:outline-none">
            <User className="w-5 h-5" />
            <span>{userData.fullName || 'User'}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {/* dropdown could be added later */}
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;

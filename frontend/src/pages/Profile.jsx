// src/pages/Profile.jsx
import React from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import CardBase from '../components/dashboard/CardBase';
import AchievementBadges from '../components/games/AchievementBadges';

const Profile = () => {
  const { userData } = useUser();
  const navigate = useNavigate();
  const {
    profilePicture,
    language = 'Not set',
    education = 'Not set',
    interest = 'Not set',
    email = '',
    fullName = '',
    streak = 0,
  } = userData;

  return (
    <div className="p-6 space-y-6 font-poppins bg-gradient-to-b from-pastel-pink/5 to-white min-h-screen">
      {/* Profile Card */}
      <CardBase className="flex flex-col md:flex-row items-center gap-6 p-6">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
          {profilePicture ? (
            <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">No Photo</div>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-gray-800">{fullName}</h2>
          <p className="text-gray-600">{email}</p>
          <p className="mt-2 text-sm text-gray-500">Language: <span className="font-medium text-gray-700">{language}</span></p>
          <p className="text-sm text-gray-500">Education: <span className="font-medium text-gray-700">{education}</span></p>
          <p className="text-sm text-gray-500">Current Interest: <span className="font-medium text-gray-700">{interest}</span></p>
          <p className="text-sm text-gray-500 mt-2">Current Streak: <span className="font-medium text-pink-500">{streak} days</span></p>
          <button
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition"
            onClick={() => navigate('/edit-profile')}
          >
            Edit Profile
          </button>
        </div>
      </CardBase>

      
      {/* Badges */}
      <AchievementBadges />
    </div>
  );
};

export default Profile;

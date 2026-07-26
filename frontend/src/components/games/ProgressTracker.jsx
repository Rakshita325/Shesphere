// src/components/games/ProgressTracker.jsx
import React from 'react';
import CardBase from '../dashboard/CardBase';
import { useUser } from '../../context/UserContext';

const ProgressTracker = () => {
  const { userData } = useUser();
  const xp = userData.xp || 0;
  const level = Math.floor(xp / 100) + 1;
  const nextLevelXp = (level) * 100;
  const progress = (xp % 100) / 100;

  return (
    <CardBase className="p-5">
      <h2 className="text-lg font-semibold mb-2">Progress to Level {level + 1}</h2>
      <div className="w-full bg-pink-100 rounded-full h-4 overflow-hidden">
        <div
          className="bg-pink-500 h-4 rounded-full transition-width duration-300"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-gray-600">
        {xp % 100} / 100 XP
      </p>
    </CardBase>
  );
};

export default ProgressTracker;

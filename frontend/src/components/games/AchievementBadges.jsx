// src/components/games/AchievementBadges.jsx
import React from 'react';
import CardBase from '../dashboard/CardBase';
import { Trophy } from 'lucide-react';

const badges = [
  { id: 'beginner', label: 'Beginner', color: 'bg-pink-100' },
  { id: 'learner', label: 'Learner', color: 'bg-purple-100' },
  { id: 'expert', label: 'Expert', color: 'bg-teal-100' },
  { id: 'consistent', label: 'Consistent', color: 'bg-orange-100' },
];

const AchievementBadges = () => {
  return (
    <CardBase className="p-5">
      <h2 className="text-lg font-semibold mb-4">Achievements</h2>
      <div className="grid grid-cols-2 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`flex items-center gap-2 p-2 rounded-lg ${badge.color}`}
          >
            <Trophy className="w-5 h-5 text-pink-500" />
            <span className="font-medium text-gray-800">{badge.label}</span>
          </div>
        ))}
      </div>
    </CardBase>
  );
};

export default AchievementBadges;

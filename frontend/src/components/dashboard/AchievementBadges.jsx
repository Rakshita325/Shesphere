import React from 'react';
import CardBase from '../dashboard/CardBase';
import { BadgeCheck } from 'lucide-react';
import { badges } from '../../utils/dummyData';

const AchievementBadges = () => {
  return (
    <CardBase className="col-span-1 md:col-span-2 lg:col-span-3">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Achievement Badges</h3>
      <div className="flex flex-wrap gap-4">
        {badges.map((b) => (
          <div key={b.id} className={`flex items-center gap-2 p-2 ${b.color} rounded-lg`}>
            <BadgeCheck className="w-5 h-5" />
            <span className="font-medium text-gray-800">{b.name}</span>
          </div>
        ))}
      </div>
    </CardBase>
  );
};

export default AchievementBadges;

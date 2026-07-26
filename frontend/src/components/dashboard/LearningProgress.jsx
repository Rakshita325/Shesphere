import React from 'react';
import CardBase from '../dashboard/CardBase';
import { progressStats } from '../../utils/dummyData';

const LearningProgress = () => {
  const { learningProgress } = progressStats;
  return (
    <CardBase className="col-span-1 md:col-span-2 lg:col-span-3">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Learning Progress</h3>
      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
        <div
          className="bg-pink-400 h-3 rounded-full transition-width duration-300"
          style={{ width: `${learningProgress}%` }}
        />
      </div>
      <p className="text-sm text-gray-500">{learningProgress}% completed</p>
    </CardBase>
  );
};

export default LearningProgress;

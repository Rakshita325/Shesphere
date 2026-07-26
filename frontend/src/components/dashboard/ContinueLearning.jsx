import React from 'react';
import CardBase from '../dashboard/CardBase';
import { progressStats } from '../../utils/dummyData';

const ContinueLearning = () => {
  const currentCourse = {
    title: 'French Cooking Basics',
    progress: progressStats.learningProgress, // 68%
  };

  return (
    <CardBase className="col-span-1 md:col-span-2 lg:col-span-3">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Continue Learning</h3>
      <p className="text-gray-600 mb-4">{currentCourse.title}</p>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
        <div
          className="bg-pink-400 h-2.5 rounded-full transition-width duration-300"
          style={{ width: `${currentCourse.progress}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-500">{currentCourse.progress}% completed</p>
    </CardBase>
  );
};

export default ContinueLearning;

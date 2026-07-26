import React from 'react';
import CardBase from '../dashboard/CardBase';
import { CalendarCheck } from 'lucide-react';

const DailyChallenge = () => {
  return (
    <CardBase className="col-span-1 md:col-span-2 lg:col-span-3">
      <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <CalendarCheck className="w-5 h-5 text-pink-500" />
        Daily Challenge
      </h3>
      <p className="text-gray-600">Complete 10 minutes of sketching to earn a streak bonus.</p>
      <button className="mt-4 px-4 py-2 bg-pink-400 text-white rounded-md hover:bg-pink-500 transition-colors">
        Start Challenge
      </button>
    </CardBase>
  );
};

export default DailyChallenge;

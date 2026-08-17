import React from 'react';
import { useUser } from '../../context/UserContext';
import CardBase from '../dashboard/CardBase';

const WelcomeCard = () => {
  const { userData } = useUser();
  const name = userData.fullName || 'Friend';
  return (
    <CardBase className="col-span-1 md:col-span-2 lg:col-span-3">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Welcome back, {name}!</h2>
      <p className="mt-2 text-gray-600 dark:text-gray-300">Ready to continue your learning journey today?</p>
    </CardBase>
  );
};

export default WelcomeCard;

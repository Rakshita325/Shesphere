// src/components/games/DailyChallenge.jsx
import React from 'react';
import CardBase from '../dashboard/CardBase';
import { useUser } from '../../context/UserContext';
import { dailyChallenges } from '../../utils/gamesData';

const DailyChallenge = () => {
  const { userData } = useUser();
  const interest = userData.interest || 'cooking';
  const challenge = dailyChallenges[interest] || dailyChallenges['cooking'];

  return (
    <CardBase className="p-5">
      <h2 className="text-lg font-semibold mb-2">Daily Challenge</h2>
      <p className="text-gray-700">{challenge}</p>
    </CardBase>
  );
};

export default DailyChallenge;
